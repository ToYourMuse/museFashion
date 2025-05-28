import { NextRequest, NextResponse } from 'next/server';

interface ContactRequest {
  firstName: string;
  lastName: string;
  email: string;
  message: string;
}

interface BrevoEmailRequest {
  sender: {
    name: string;
    email: string;
  };
  to: Array<{
    email: string;
    name?: string;
  }>;
  subject: string;
  htmlContent: string;
  replyTo?: {
    email: string;
    name?: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const { firstName, lastName, email, message }: ContactRequest = await request.json();

    // Validation
    if (!firstName || !lastName || !email || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    const fullName = `${firstName} ${lastName}`;

    const brevoRequest: BrevoEmailRequest = {
      sender: {
        name: process.env.BREVO_SENDER_NAME || 'Muse Contact Form',
        email: process.env.BREVO_SENDER_EMAIL || 'noreply@muse.com',
      },
      to: [
        {
          email: process.env.BREVO_SENDER_EMAIL || 'toyourmuse@gmail.com', // Your email to receive messages
          name: 'Muse Team',
        },
      ],
      replyTo: {
        email: email,
        name: fullName,
      },
      subject: `New Contact Form Message from ${fullName}`,
      htmlContent: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Contact Form Message</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f9f9f9;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 40px 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #800000; font-size: 28px; margin: 0;">New Contact Form Message</h1>
            </div>
            
            <div style="background-color: #f8f8f8; padding: 30px; border-radius: 8px; margin-bottom: 30px;">
              <h2 style="color: #333; font-size: 22px; margin: 0 0 20px 0;">Contact Details</h2>
              <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 10px 0;">
                <strong>Name:</strong> ${fullName}
              </p>
              <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 10px 0;">
                <strong>Email:</strong> ${email}
              </p>
            </div>
            
            <div style="margin-bottom: 30px;">
              <h3 style="color: #800000; font-size: 20px; margin: 0 0 15px 0;">Message:</h3>
              <div style="background-color: white; border: 2px solid #eee; padding: 20px; border-radius: 8px;">
                <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0; white-space: pre-wrap;">${message}</p>
              </div>
            </div>
            
            <div style="text-align: center; margin-top: 40px; padding-top: 30px; border-top: 1px solid #eee;">
              <p style="color: #999; font-size: 14px; margin: 0;">
                This message was sent from the Muse contact form.<br>
                Reply directly to this email to respond to ${fullName}.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_API_KEY!,
      },
      body: JSON.stringify(brevoRequest),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Brevo API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to send message' },
        { status: 500 }
      );
    }

    const result = await response.json();
    
    return NextResponse.json({
      success: true,
      message: 'Message sent successfully!',
      messageId: result.messageId,
    });

  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}