import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import PDFDocument from 'pdfkit';
import { Readable } from 'stream';

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

async function generatePDF(clientName: string, report: Report): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'letter', margins: { top: 80, bottom: 64, left: 64, right: 64 } });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // Colors
    const COPPER = '#B87333';
    const INK = '#1a1815';
    const MUTED = '#655d52';

    // Helper to add paragraphs
    const addParagraphs = (text: string) => {
      const paragraphs = text.split(/\n{2,}/).map((s) => s.trim()).filter(Boolean);
      paragraphs.forEach((para, idx) => {
        doc.font('Times-Roman').fontSize(12).fillColor(INK).text(para, {
          align: 'left',
          lineGap: 6,
        });
        if (idx < paragraphs.length - 1) {
          doc.moveDown(0.8);
        }
      });
    };

    // Cover
    doc.font('Helvetica').fontSize(9).fillColor(COPPER).text('THE FREEDOM AUDIT', { align: 'center' });
    doc.moveDown(2);
    doc.font('Times-Roman').fontSize(42).fillColor(INK).text('Your Report', { align: 'center' });
    doc.moveDown(0.5);
    doc.moveTo(doc.page.width / 2 - 24, doc.y).lineTo(doc.page.width / 2 + 24, doc.y).strokeColor(COPPER).stroke();
    doc.moveDown(1);
    doc.font('Times-Italic').fontSize(16).fillColor(COPPER).text(`Prepared for ${clientName}`, { align: 'center' });
    doc.moveDown(0.5);
    doc.font('Helvetica').fontSize(9).fillColor(MUTED).text(new Date().toLocaleDateString(), { align: 'center' });

    // Sections
    const sections = [
      { title: 'Your Metatype', isMetatype: true, content: report.metatype_description, metatypeName: report.metatype_name },
      { title: 'Freedom of Health', content: report.pillar_health },
      { title: 'Freedom of Relationships', content: report.pillar_relationships },
      { title: 'Freedom of Time', content: report.pillar_time },
      { title: 'Freedom of Mind', content: report.pillar_mind },
      { title: 'Freedom of Soul', content: report.pillar_soul },
      { title: 'Financial Foundation', content: report.pillar_finances },
      { title: 'Your Inner State', content: report.inner_state, extra: report.patterns },
      { title: 'The Gap', content: report.the_gap_narrative, isGap: true },
      { title: 'Your Strategy', content: report.strategy },
    ];

    sections.forEach((section) => {
      doc.addPage();
      doc.font('Helvetica').fontSize(9).fillColor(COPPER).text(section.title.toUpperCase());
      doc.moveDown(0.8);

      if (section.isMetatype && section.metatypeName) {
        doc.font('Times-Italic').fontSize(28).fillColor(COPPER).text(section.metatypeName);
        doc.moveDown(1);
      } else {
        doc.font('Times-Roman').fontSize(26).fillColor(INK).text(section.title);
        doc.moveDown(0.8);
      }

      if (section.isGap) {
        // Add gap visualization (text-based since we can't render complex graphics easily)
        const vision = Number(report.alignment_score_vision) || 0;
        const reality = Number(report.alignment_score_reality) || 0;
        const gap = Math.max(0, vision - reality);

        doc.font('Helvetica').fontSize(11).fillColor(MUTED);
        doc.text(`Your Vision: ${vision.toFixed(1)}  |  The Gap: ${gap.toFixed(1)}  |  Your Reality: ${reality.toFixed(1)}`, { align: 'center' });
        doc.moveDown(1);
      }

      addParagraphs(section.content);

      if (section.extra) {
        doc.moveDown(1);
        doc.moveTo(64, doc.y).lineTo(104, doc.y).strokeColor(COPPER).stroke();
        doc.moveDown(0.8);
        addParagraphs(section.extra);
      }
    });

    // Footer
    doc.addPage();
    doc.font('Helvetica').fontSize(9).fillColor(MUTED).text('END OF REPORT', { align: 'center' });
    doc.moveDown(0.5);
    doc.fillColor(COPPER).text('UNBREAKABLE WEALTH', { align: 'center' });

    doc.end();
  });
}

export async function POST(req: NextRequest) {
  try {
    const { clientName, clientEmail, report, answers } = await req.json();

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ error: 'Email not configured' }, { status: 500 });
    }

    // Generate PDF
    const pdfBuffer = await generatePDF(clientName, report);

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
          filename: `freedom-audit-${clientName.toLowerCase().replace(/\s+/g, '-')}.pdf`,
          content: pdfBuffer,
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
