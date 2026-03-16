import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import connectMongoDB from "@/lib/mongodb";
import Contact from "@/models/Contact";

export const runtime = "nodejs";

type ContactRequestBody = {
  name?: string;
  email?: string;
  message?: string;
};

const escapeHtml = (value: string) => {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/'/g, '&#39;');
};

export async function POST(request: NextRequest) {
  try {
    console.log('Contact POST: starting...');
    const body = (await request.json()) as ContactRequestBody;
    const name = body.name?.trim();
    const email = body.email?.trim();
    const message = body.message?.trim();

    console.log('Contact POST: parsed body', { name: name?.substring(0,20)+'..', email, messageLen: message?.length });

    if (!name || !email || !message) {
      console.log('Contact POST: missing fields');
      return NextResponse.json(
        { success: false, error: "Name, email, and message are required." },
        { status: 400 }
      );
    }

    console.log('Contact POST: connecting to MongoDB...');
    await connectMongoDB();
    console.log('Contact POST: MongoDB connected');

    console.log('Contact POST: saving to Contact model...');
    const savedContact = await Contact.create({ name, email, message });
    console.log('Contact POST: saved contact ID:', savedContact._id);

    let emailSent = false;
    if (process.env.RESEND_API_KEY) {
      console.log('Contact POST: sending email via Resend...');
      const resend = new Resend(process.env.RESEND_API_KEY);
      const { error } = await resend.emails.send({
        from: "Food Donation Website <onboarding@resend.dev>",
        to: "harshcu2@gmail.com",
        subject: "New Contact Message from Website",
        replyTo: email,
        html: `
          <div>
            <p><strong>Name:</strong> ${escapeHtml(name)}</p>
            <p><strong>Email:</strong> ${escapeHtml(email)}</p>
            <p><strong>Message:</strong></p>
            <p>${escapeHtml(message).replace(/\\n/g, "<br />")}</p>
          </div>
        `,
      });

      if (error) {
        console.error("Contact POST: Resend error:", error);
      } else {
        emailSent = true;
        console.log('Contact POST: email sent successfully');
      }
    } else {
      console.warn('Contact POST: RESEND_API_KEY missing, skipping email');
    }

    console.log('Contact POST: success, emailSent:', emailSent);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact POST full error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Something went wrong while sending the message." },
      { status: 500 }
    );
  }
}
