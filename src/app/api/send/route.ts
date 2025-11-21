import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
    try {
        const { contactInfo, message, selectedPackage } = await request.json();

        console.log("Attempting to send email...");
        if (!process.env.RESEND_API_KEY) {
            console.error("RESEND_API_KEY is missing");
            return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
        }

        const { data, error } = await resend.emails.send({
            from: 'Ripple Media <onboarding@resend.dev>',
            to: ['danishrock11@gmail.com'],
            subject: `Ripple Media New Inquiry: ${selectedPackage}`,
            html: `
        <h1>New Inquiry for ${selectedPackage}</h1>
        <p><strong>Contact Info:</strong> ${contactInfo}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
        });

        if (error) {
            console.error("Resend API Error:", error);
            return NextResponse.json({ error }, { status: 500 });
        }

        console.log("Email sent successfully:", data);
        return NextResponse.json(data);
    } catch (error) {
        console.error("Unexpected Error:", error);
        return NextResponse.json({ error }, { status: 500 });
    }
}
