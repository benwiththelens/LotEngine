import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function POST(req: Request) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const { data, error } = await resend.emails.send({
      from: 'LotEngine Terminal <onboarding@resend.dev>',
      to: ['ben@benwiththelens.com'],
      subject: 'New LotEngine Demo Request',
      text: `New demo request received.\n\nEmail: ${email}\nTimestamp: ${new Date().toISOString()}\n\n---\nLotEngine Infrastructure Monitor`,
    });

    if (error) {
      console.error('Resend Error:', error);
      return NextResponse.json({ error: 'Failed to send request' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error('API Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
