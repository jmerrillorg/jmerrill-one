import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import formidable from 'formidable';
import { promises as fs } from 'fs';
import path from 'path';

// Required to handle file uploads in Next.js API routes
export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextRequest) {
  try {
    const form = formidable({ multiples: false, uploadDir: '/tmp', keepExtensions: true });

    const data = await new Promise<{ fields: any; files: any }>((resolve, reject) => {
      form.parse(req as any, (err, fields, files) => {
        if (err) reject(err);
        else resolve({ fields, files });
      });
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

    const manuscript = data.files.manuscript?.[0] ?? data.files.manuscript;

    const transporter = nodemailer.createTransport({
      host: 'smtp.office365.com',
      port: 587,
      secure: false,
      auth: {
        user: 'jackie@jmerrill.pub',
        pass: process.env.M365_APP_PASSWORD!, // Store securely
      },
    });

    const mailOptions = {
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
      `,
      attachments: manuscript
        ? [
            {
              filename: manuscript.originalFilename || 'manuscript',
              path: manuscript.filepath,
              contentType: manuscript.mimetype,
            },
          ]
        : [],
    };

    await transporter.sendMail(mailOptions);

    // Clean up file after sending (optional)
    if (manuscript?.filepath) {
      await fs.unlink(manuscript.filepath);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Email error:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}