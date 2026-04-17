import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const { email, clientName, currentQuestion, answers, report, status } = await req.json();

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 500 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    // Check if assessment exists for this email
    const { data: existing } = await supabase
      .from('assessments')
      .select('id')
      .eq('email', email)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    const payload = {
      email,
      client_name: clientName,
      current_question: currentQuestion,
      answers,
      report,
      status: status || 'in_progress',
      ...(status === 'complete' && { completed_at: new Date().toISOString() }),
    };

    let result;
    if (existing) {
      // Update existing
      result = await supabase
        .from('assessments')
        .update(payload)
        .eq('id', existing.id)
        .select()
        .single();
    } else {
      // Insert new
      result = await supabase
        .from('assessments')
        .insert([payload])
        .select()
        .single();
    }

    if (result.error) {
      throw result.error;
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
    console.error('[API] Save error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Save failed' },
      { status: 500 }
    );
  }
}
