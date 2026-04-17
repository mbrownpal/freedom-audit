import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

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

    const { data, error } = await supabase
      .from('assessments')
      .select('*')
      .eq('email', email)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows found
        return NextResponse.json({ data: null });
      }
      throw error;
    }

    return NextResponse.json({
      data: {
        email: data.email,
        clientName: data.client_name,
        currentQuestion: data.current_question,
        answers: data.answers,
        report: data.report,
        status: data.status,
      },
    });
  } catch (error) {
    console.error('[API] Load error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Load failed' },
      { status: 500 }
    );
  }
}
