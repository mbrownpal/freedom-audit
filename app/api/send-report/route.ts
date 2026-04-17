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

function generateHTMLReport(clientName: string, report: Report): string {
  const vision = Number(report.alignment_score_vision) || 0;
  const reality = Number(report.alignment_score_reality) || 0;
  const gap = Math.max(0, vision - reality).toFixed(1);

  const sections = [
    { title: 'Your Metatype', subtitle: report.metatype_name, content: report.metatype_description, isMetatype: true },
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
    const paragraphsHTML = paragraphs.map((p) => `<p>${p}</p>`).join('');

    return `
      <div class="section">
        <div class="section-title">${section.title.toUpperCase()}</div>
        ${section.subtitle ? `<h2 class="metatype-name">${section.subtitle}</h2>` : `<h2>${section.title}</h2>`}
        ${section.gap ? `<div class="gap-scores">${section.gap}</div>` : ''}
        <div class="section-content">${paragraphsHTML}</div>
      </div>
    `;
  }).join('');

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Freedom Audit Report - ${clientName}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: Georgia, 'Times New Roman', serif;
          color: #1a1815;
          background: #fff;
          line-height: 1.8;
          padding: 80px 64px;
          max-width: 800px;
          margin: 0 auto;
        }
        .cover {
          text-align: center;
          padding: 120px 0;
          border-bottom: 2px solid #B87333;
          margin-bottom: 80px;
        }
        .cover .eyebrow {
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          font-size: 11px;
          letter-spacing: 2px;
          color: #B87333;
          margin-bottom: 40px;
        }
        .cover h1 {
          font-size: 56px;
          font-weight: 400;
          margin-bottom: 20px;
        }
        .cover .client-name {
          font-style: italic;
          font-size: 20px;
          color: #B87333;
          margin-top: 40px;
        }
        .cover .date {
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          font-size: 11px;
          color: #655d52;
          margin-top: 20px;
        }
        .section {
          page-break-inside: avoid;
          margin-bottom: 80px;
        }
        .section-title {
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          font-size: 10px;
          letter-spacing: 2px;
          color: #B87333;
          margin-bottom: 12px;
        }
        .section h2 {
          font-size: 32px;
          font-weight: 400;
          margin-bottom: 24px;
          color: #1a1815;
        }
        .metatype-name {
          font-style: italic;
          color: #B87333 !important;
          font-size: 36px !important;
        }
        .gap-scores {
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          font-size: 13px;
          color: #655d52;
          text-align: center;
          margin-bottom: 32px;
          padding: 16px;
          background: #f7f2ea;
          border-radius: 4px;
        }
        .section-content p {
          font-size: 16px;
          line-height: 1.8;
          margin-bottom: 24px;
        }
        .footer {
          text-align: center;
          padding-top: 80px;
          border-top: 2px solid #B87333;
          margin-top: 120px;
        }
        .footer .end {
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          font-size: 10px;
          letter-spacing: 2px;
          color: #655d52;
        }
        .footer .brand {
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          font-size: 12px;
          letter-spacing: 2px;
          color: #B87333;
          margin-top: 12px;
        }
        @media print {
          body { padding: 40px; }
          .section { page-break-before: always; }
          .cover { page-break-after: always; }
        }
      </style>
    </head>
    <body>
      <div class="cover">
        <div class="eyebrow">THE FREEDOM AUDIT</div>
        <h1>Your Report</h1>
        <div class="client-name">Prepared for ${clientName}</div>
        <div class="date">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
      </div>
      ${sectionsHTML}
      <div class="footer">
        <div class="end">END OF REPORT</div>
        <div class="brand">UNBREAKABLE WEALTH</div>
      </div>
    </body>
    </html>
  `;
}

export async function POST(req: NextRequest) {
  try {
    const { clientName, clientEmail, report, answers } = await req.json();

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ error: 'Email not configured' }, { status: 500 });
    }

    // Generate HTML report
    const htmlReport = generateHTMLReport(clientName, report);

    // Send to client
    await resend.emails.send({
      from: 'Freedom Audit <audit@unbreakablewealth.com>',
      to: clientEmail,
      subject: `Your Freedom Audit Report - ${clientName}`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <h1 style="font-size: 32px; font-weight: 500; margin-bottom: 20px; color: #1a1815;">Your Freedom Audit Report</h1>
          <p style="font-size: 18px; line-height: 1.6; color: #3a342c;">Hi ${clientName},</p>
          <p style="font-size: 18px; line-height: 1.6; color: #3a342c;">
            Your Freedom Audit report is ready. This is a comprehensive map of where you stand across the dimensions 
            that actually determine freedom.
          </p>
          <p style="font-size: 18px; line-height: 1.6; color: #3a342c;">
            Your report is attached as a PDF. Take your time with it. The insights here are meant to be revisited, 
            not consumed in one sitting.
          </p>
          <p style="font-size: 18px; line-height: 1.6; color: #3a342c;">
            If you'd like to discuss your results or explore what's next, reply to this email.
          </p>
          <p style="font-size: 18px; line-height: 1.6; color: #3a342c; margin-top: 40px;">
            — Mike Brown<br>
            <span style="font-size: 14px; color: #655d52;">Unbreakable Wealth</span>
          </p>
        </div>
      `,
      attachments: [
        {
          filename: `freedom-audit-${clientName.toLowerCase().replace(/\s+/g, '-')}.html`,
          content: htmlReport,
        },
      ],
    });

    // Send raw answers to admin
    await resend.emails.send({
      from: 'Freedom Audit <audit@unbreakablewealth.com>',
      to: process.env.ADMIN_EMAIL || 'mike@mbrown.co',
      subject: `New Freedom Audit Submission - ${clientName}`,
      html: `
        <div style="font-family: monospace; padding: 20px; background: #f7f2ea;">
          <h2>New Freedom Audit Submission</h2>
          <p><strong>Name:</strong> ${clientName}</p>
          <p><strong>Email:</strong> ${clientEmail}</p>
          <p><strong>Completed:</strong> ${new Date().toLocaleString()}</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #ccc;">
          <h3>Raw Answers:</h3>
          <pre style="white-space: pre-wrap; word-wrap: break-word;">${JSON.stringify(answers, null, 2)}</pre>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API] Send report error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Send failed' },
      { status: 500 }
    );
  }
}
