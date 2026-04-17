import { NextRequest, NextResponse } from 'next/server';

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

function generatePrintHTML(clientName: string, report: Report): string {
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
    const paragraphsHTML = paragraphs.map((p) => `<p>${p}</p>`).join('');

    return `
      <div class="section">
        <div class="section-title">${section.title.toUpperCase()}</div>
        ${section.subtitle ? `<h2 class="metatype-name">${section.subtitle}</h2>` : `<h2>${section.title}</h2>`}
        ${(section as any).gap ? `<div class="gap-scores">${(section as any).gap}</div>` : ''}
        <div class="section-content">${paragraphsHTML}</div>
      </div>
    `;
  }).join('');

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Freedom Audit Report - ${clientName}</title>
      <style>
        @page { 
          size: letter;
          margin: 0.75in;
        }
        
        * { 
          margin: 0; 
          padding: 0; 
          box-sizing: border-box; 
        }
        
        body {
          font-family: Georgia, 'Times New Roman', serif;
          color: #1a1815;
          background: #ffffff;
          line-height: 1.7;
          padding: 0.75in;
        }
        
        .cover {
          text-align: center;
          padding: 80px 0 100px;
          border-bottom: 3px solid #B87333;
          margin-bottom: 60px;
          page-break-after: always;
        }
        
        .eyebrow {
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          font-size: 10px;
          letter-spacing: 3px;
          color: #B87333;
          margin-bottom: 40px;
          text-transform: uppercase;
        }
        
        .cover h1 {
          font-size: 48px;
          font-weight: 400;
          margin-bottom: 16px;
          color: #1a1815;
        }
        
        .cover .rule {
          width: 60px;
          height: 2px;
          background: #B87333;
          margin: 30px auto;
        }
        
        .client-name {
          font-style: italic;
          font-size: 18px;
          color: #B87333;
          margin-top: 30px;
        }
        
        .date {
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          font-size: 10px;
          color: #655d52;
          margin-top: 16px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        .section {
          page-break-inside: avoid;
          margin-bottom: 50px;
          page-break-before: always;
        }
        
        .section:first-of-type {
          page-break-before: auto;
        }
        
        .section-title {
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          font-size: 9px;
          letter-spacing: 2px;
          color: #B87333;
          margin-bottom: 12px;
          text-transform: uppercase;
        }
        
        .section h2 {
          font-size: 28px;
          font-weight: 400;
          margin-bottom: 24px;
          color: #1a1815;
        }
        
        .metatype-name {
          font-style: italic;
          color: #B87333 !important;
          font-size: 32px !important;
        }
        
        .gap-scores {
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          font-size: 12px;
          color: #655d52;
          text-align: center;
          margin-bottom: 28px;
          padding: 14px;
          background: #f7f2ea;
          border-radius: 4px;
          border: 1px solid #e8dcc8;
        }
        
        .section-content p {
          font-size: 14px;
          line-height: 1.8;
          margin-bottom: 20px;
          color: #2a2520;
        }
        
        .footer {
          text-align: center;
          padding-top: 60px;
          border-top: 2px solid #B87333;
          margin-top: 80px;
          page-break-inside: avoid;
        }
        
        .footer .end {
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          font-size: 9px;
          letter-spacing: 2px;
          color: #655d52;
          text-transform: uppercase;
        }
        
        .footer .brand {
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          font-size: 11px;
          letter-spacing: 2px;
          color: #B87333;
          margin-top: 12px;
          text-transform: uppercase;
        }
        
        @media print {
          body { padding: 0; }
          .section { page-break-before: always; }
          .cover { page-break-after: always; }
        }
      </style>
    </head>
    <body>
      <div class="cover">
        <div class="eyebrow">The Freedom Audit</div>
        <h1>Your Report</h1>
        <div class="rule"></div>
        <div class="client-name">Prepared for ${clientName}</div>
        <div class="date">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
      </div>
      
      ${sectionsHTML}
      
      <div class="footer">
        <div class="end">End of Report</div>
        <div class="brand">Unbreakable Wealth</div>
      </div>
    </body>
    </html>
  `;
}

export async function POST(req: NextRequest) {
  try {
    const { clientName, report } = await req.json();

    if (!clientName || !report) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const html = generatePrintHTML(clientName, report);
    
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `inline; filename="freedom-audit-${clientName.toLowerCase().replace(/\s+/g, '-')}.html"`,
      },
    });
  } catch (error) {
    console.error('[pdf] Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate report', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
