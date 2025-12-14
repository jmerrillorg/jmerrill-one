export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import formidable, { File as FormidableFile } from 'formidable';
import { IncomingMessage } from 'http';
import { promises as fs } from 'fs';

/**
 * Parsed form structure
 */
type ParsedForm = {
  fields: Record<string, string>;
  files: Record<string, FormidableFile | FormidableFile[]>;
};

/**
 * Convert NextRequest → IncomingMessage for formidable
 * (Required for App Router compatibility)
 */
function toIncomingMessage(req: NextRequest): IncomingMessage {
  const anyReq = req as any;
  return anyReq.req ?? anyReq;
}

export async function POST(req: NextRequest) {
  try {
    const form = formidable({
      multiples: false,
      uploadDir: '/tmp',
      keepExtensions: true,
    });

    const data: ParsedForm = await new Promise((resolve, reject) => {
      form.parse(
        toIncomingMessage(req),
        (err, fields, files) => {
          if (err) return reject(err);

          resolve({
            fields: Object.fromEntries(
              Object.entries(fields).map(([key, value]) => [
                key,
                Array.isArray(value) ? value[0] : value,
              ])
            ) as Record<string, string>,
            files: files as Record<string, FormidableFile | FormidableFile[]>,
          });
        }
      );
    });

    const {
      firstName,
      lastName,
      email,
      phone,
      bookTitle,
      genre,
      timezone,
      estimatedPubDate,
      message,
    } = data.fields;

    const manuscriptFile = Array.isArray(data.files.manuscript)
      ? data.files.manuscript[0]
      : data.files.manuscript;

    if (!process.env.M365_APP_PASSWORD) {
      throw new Error('Missing M365_APP_PASSWORD');
    }

    const transporter = nodemailer.createTransport({
      host: 'smtp.office365.com',
      port: 587,
      secure: false,
      auth: {
        user: 'jackie@jmerrill.pub',
        pass: process.env.M365_APP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: 'jackie@jmerrill.pub',
      to: 'submissions@jmerrill.one',
      subject: `📚 New Author Submission – ${firstName} ${lastName}`,
      text: `
New submission received:

Name: ${firstName} ${lastName}
Email: ${email}
Phone: ${phone}
Book Title: ${bookTitle}
Genre: ${genre}
Timezone: ${timezone}
Estimated Publishing Date: ${estimatedPubDate}

Message:
${message}
      `.trim(),
      attachments: manuscriptFile?.filepath
        ? [
            {
              filename:
                manuscriptFile.originalFilename ?? 'manuscript',
              path: manuscriptFile.filepath,
              contentType:
                manuscriptFile.mimetype ?? undefined,
            },
          ]
        : [],
    });

    if (manuscriptFile?.filepath) {
      await fs.unlink(manuscriptFile.filepath);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Email error:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}