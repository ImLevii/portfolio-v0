import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { name, email, subject, message } = await request.json();

  // Import Resend dynamically to avoid issues in edge runtimes
  const { Resend } = await import('resend');
  const resend = new Resend('re_Yfm6Rqqs_C9a59V5ebDjEW5ZksczCYsFz');

  try {
    const data = await resend.emails.send({
      from: 'Contact Form <contact@levik.dev>',
      to: ['contact@levik.dev'],
      subject: `[LEVIK.DEV] ${subject}`,
      replyTo: email,
      html: `
        <div style="font-family: Arial, sans-serif; background: #f9f9f9; padding: 32px; border-radius: 8px; max-width: 600px; margin: auto; border: 1px solid #eee;">
          <div style="text-align: center; margin-bottom: 24px;">
            <span style="display: inline-flex; align-items: center; gap: 10px;">
              <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"36\" height=\"36\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#e11d48\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><polyline points=\"16 18 22 12 16 6\"></polyline><polyline points=\"8 6 2 12 8 18\"></polyline></svg>
              <span style="font-size: 1.7rem; font-family: 'Orbitron', Arial, sans-serif; font-weight: bold; color: #222; letter-spacing: 1px;">LEVIK<span style='color:#e11d48'>.DEV</span></span>
            </span>
          </div>
          <div style="background: #222; color: #fff; padding: 16px 24px; border-radius: 6px 6px 0 0; text-align: center;">
            <h2 style="margin: 0; font-size: 1.5rem;">New Contact Form Submission</h2>
          </div>
          <div style="padding: 24px; background: #fff; border-radius: 0 0 6px 6px;">
            <p style="margin: 0 0 16px 0;"><strong>Name:</strong> <span style="color: #222;">${name}</span></p>
            <p style="margin: 0 0 16px 0;"><strong>Email:</strong> <span style="color: #222;">${email}</span></p>
            <p style="margin: 0 0 16px 0;"><strong>Subject:</strong> <span style="color: #222;">${subject}</span></p>
            <div style="margin: 24px 0; padding: 16px; background: #f5f5f5; border-left: 4px solid #e11d48; border-radius: 4px;">
              <strong style="display: block; margin-bottom: 8px; color: #e11d48;">Message:</strong>
              <div style="color: #222; white-space: pre-line;">${message.replace(/\n/g, '<br/>')}</div>
            </div>
            <hr style="margin: 32px 0 16px 0; border: none; border-top: 1px solid #eee;" />
            <p style="font-size: 0.95rem; color: #888;">Sent on: ${new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })}</p>
          </div>
        </div>
      `,
    });

    // Send confirmation email to the sender
    await resend.emails.send({
      from: 'LEVIK.DEV <contact@levik.dev>',
      to: [email],
      subject: `Received your message at levik.dev!`,
      html: `
        <div style="font-family: Arial, sans-serif; background: #f9f9f9; padding: 32px; border-radius: 8px; max-width: 600px; margin: auto; border: 1px solid #eee;">
          <div style="text-align: center; margin-bottom: 24px;">
            <span style="display: inline-flex; align-items: center; gap: 10px;">
              <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"36\" height=\"36\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#e11d48\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><polyline points=\"16 18 22 12 16 6\"></polyline><polyline points=\"8 6 2 12 8 18\"></polyline></svg>
              <span style="font-size: 1.7rem; font-family: 'Orbitron', Arial, sans-serif; font-weight: bold; color: #222; letter-spacing: 1px;">LEVIK<span style='color:#e11d48'>.DEV</span></span>
            </span>
          </div>
          <div style="background: #e11d48; color: #fff; padding: 16px 24px; border-radius: 6px 6px 0 0; text-align: center;">
            <h2 style="margin: 0; font-size: 1.4rem;">Thank you for reaching out!</h2>
          </div>
          <div style="padding: 24px; background: #fff; border-radius: 0 0 6px 6px;">
            <p style="margin: 0 0 16px 0; color: #222;">Hi <strong>${name}</strong>,</p>
            <p style="margin: 0 0 16px 0; color: #222;">I've received your message and will get back to you as soon as possible.</p>
            <div style="margin: 24px 0; padding: 16px; background: #f5f5f5; border-left: 4px solid #e11d48; border-radius: 4px;">
              <strong style="display: block; margin-bottom: 8px; color: #e11d48;">Your Message:</strong>
              <div style="color: #222; white-space: pre-line;">${message.replace(/\n/g, '<br/>')}</div>
            </div>
            <p style="margin: 24px 0 0 0; color: #888; font-size: 0.95rem;">If you didn't submit this message, you can ignore this email.</p>
            <hr style="margin: 32px 0 16px 0; border: none; border-top: 1px solid #eee;" />
            <p style="font-size: 0.95rem; color: #888;">Sent on: ${new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })}</p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
} 