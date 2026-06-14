import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function POST(req: Request) {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'INFRASTRUCTURE_ERROR: API_KEY_MISSING' }, { status: 500 });
    }

    const resend = new Resend(apiKey);
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'VALIDATION_ERROR: EMAIL_REQUIRED' }, { status: 400 });
    }

    const { data, error } = await resend.emails.send({
      from: 'LotEngine Terminal <onboarding@resend.dev>',
      to: ['benearlweber@gmail.com'],
      subject: 'New LotEngine Demo Request',
      text: `New demo request received.\n\nEmail: ${email}\nTimestamp: ${new Date().toISOString()}\n\n---\nLotEngine Infrastructure Monitor`,
    });

    if (error) {
      console.error('Resend Error:', error);
      return NextResponse.json({ error: `PROTOCOL_ERROR: ${error.name.toUpperCase()}` }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error('API Error:', err);
    return NextResponse.json({ error: 'SYSTEM_ERROR: INTERNAL_FAILURE' }, { status: 500 });
  }
}
