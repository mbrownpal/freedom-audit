import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface Report {
  metatype_name: string;
  metatype_description: string;
  pillar_health: string;
  pillar_relationships: string;
  pillar_time: string;
  pillar_mind: string;
  pillar_soul: string;
  pillar_finances: string;
  inner_state: string;
  patterns: string;
  alignment_score_vision: string;
  alignment_score_reality: string;
  the_gap_narrative: string;
  strategy: string;
}

function generateEmailHTML(clientName: string, report: Report): string {
  const vision = Number(report.alignment_score_vision) || 0;
  const reality = Number(report.alignment_score_reality) || 0;
  const gap = Math.max(0, vision - reality).toFixed(1);

  const sections = [
    { title: 'Your Metatype', subtitle: report.metatype_name, content: report.metatype_description },
    { title: 'Freedom of Health', content: report.pillar_health },
    { title: 'Freedom of Relationships', content: report.pillar_relationships },
    { title: 'Freedom of Time', content: report.pillar_time },
    { title: 'Freedom of Mind', content: report.pillar_mind },
    { title: 'Freedom of Soul', content: report.pillar_soul },
    { title: 'Financial Foundation', content: report.pillar_finances },
    { title: 'Your Inner State', content: report.inner_state + '\n\n' + report.patterns },
    { title: 'The Gap', content: report.the_gap_narrative, gap: `Vision: ${vision.toFixed(1)} | Gap: ${gap} | Reality: ${reality.toFixed(1)}` },
    { title: 'Your Strategy', content: report.strategy },
  ];

  const sectionsHTML = sections.map((section) => {
    const paragraphs = section.content.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
    const paragraphsHTML = paragraphs.map((p) => `<p style="font-size: 15px; line-height: 1.8; margin-bottom: 20px; color: #2a2520;">${p}</p>`).join('');

    return `
      <div style="margin-bottom: 50px; page-break-inside: avoid;">
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 10px; letter-spacing: 2px; color: #B87333; margin-bottom: 12px; text-transform: uppercase;">${section.title.toUpperCase()}</div>
        ${section.subtitle 
          ? `<h2 style="font-family: Georgia, 'Times New Roman', serif; font-style: italic; color: #B87333; font-size: 32px; font-weight: 400; margin-bottom: 24px;">${section.subtitle}</h2>` 
          : `<h2 style="font-family: Georgia, 'Times New Roman', serif; font-size: 28px; font-weight: 400; margin-bottom: 24px; color: #1a1815;">${section.title}</h2>`
        }
        ${(section as any).gap ? `<div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 13px; color: #655d52; text-align: center; margin-bottom: 28px; padding: 14px; background: #f7f2ea; border-radius: 4px; border: 1px solid #e8dcc8;">${(section as any).gap}</div>` : ''}
        <div>${paragraphsHTML}</div>
      </div>
    `;
  }).join('');

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Freedom Audit Report</title>
    </head>
    <body style="font-family: Georgia, 'Times New Roman', serif; color: #1a1815; background: #ffffff; line-height: 1.7; margin: 0; padding: 0;">
      <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        
        <!-- Cover -->
        <div style="text-align: center; padding: 60px 0 80px; border-bottom: 3px solid #B87333; margin-bottom: 60px;">
          <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 11px; letter-spacing: 3px; color: #B87333; margin-bottom: 30px; text-transform: uppercase;">The Freedom Audit</div>
          <h1 style="font-size: 42px; font-weight: 400; margin: 0 0 20px 0; color: #1a1815;">Your Report</h1>
          <div style="width: 60px; height: 2px; background: #B87333; margin: 25px auto;"></div>
          <div style="font-style: italic; font-size: 18px; color: #B87333; margin-top: 25px;">Prepared for ${clientName}</div>
          <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 11px; color: #655d52; margin-top: 16px; text-transform: uppercase; letter-spacing: 1px;">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
        </div>
        
        <!-- Sections -->
        ${sectionsHTML}
        
        <!-- Footer -->
        <div style="text-align: center; padding-top: 60px; border-top: 2px solid #B87333; margin-top: 80px;">
          <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 10px; letter-spacing: 2px; color: #655d52; text-transform: uppercase;">End of Report</div>
          <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 12px; letter-spacing: 2px; color: #B87333; margin-top: 12px; text-transform: uppercase;">Unbreakable Wealth</div>
        </div>
        
        <div style="margin-top: 60px; padding-top: 30px; border-top: 1px solid #e8dcc8; text-align: center;">
          <p style="font-size: 14px; color: #655d52; margin-bottom: 16px;">If you'd like to discuss your results or explore working together, simply reply to this email.</p>
          <p style="font-size: 13px; color: #999;">— Mike Brown<br/>Unbreakable Wealth</p>
        </div>
        
      </div>
    </body>
    </html>
  `;
}

export async function POST(req: NextRequest) {
  try {
    const { clientName, clientEmail, report, answers } = await req.json();

    if (!clientName || !clientEmail || !report) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const reportHTML = generateEmailHTML(clientName, report);

    // Send beautiful HTML email to client
    await resend.emails.send({
      from: 'Freedom Audit <audit@unbreakablewealth.com>',
      replyTo: 'mike@mbrown.co',
      to: clientEmail,
      subject: `Your Freedom Audit Report - ${clientName}`,
      html: reportHTML,
    });

    // Send raw answers to admin
    await resend.emails.send({
      from: 'Freedom Audit <audit@unbreakablewealth.com>',
      to: 'mike@mbrown.co',
      subject: `New Freedom Audit Submission - ${clientName}`,
      html: `
        <p><strong>New Freedom Audit completed by:</strong> ${clientName} (${clientEmail})</p>
        <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
        <hr/>
        <pre>${JSON.stringify(answers, null, 2)}</pre>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[send-report] Error:', error);
    return NextResponse.json(
      { error: 'Failed to send report', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
