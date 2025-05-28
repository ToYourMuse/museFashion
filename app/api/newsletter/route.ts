import { NextRequest, NextResponse } from 'next/server';

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
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
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

    const brevoRequest: BrevoEmailRequest = {
      sender: {
        name: process.env.BREVO_SENDER_NAME || 'Muse Newsletter',
        email: process.env.BREVO_SENDER_EMAIL || 'noreply@muse.com',
      },
      to: [
        {
          email: email,
        },
      ],
      subject: 'Welcome to Muse Newsletter!',
      htmlContent: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to Muse Newsletter</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f9f9f9;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 40px 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #800000; font-size: 32px; margin: 0;">Welcome to Muse!</h1>
            </div>
            
            <div style="background-color: #f8f8f8; padding: 30px; border-radius: 8px; margin-bottom: 30px;">
              <h2 style="color: #333; font-size: 24px; margin: 0 0 15px 0;">Thank you for subscribing!</h2>
              <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0;">
                Thank you for subscribing to our newsletter. We will send you updates whenever we have exciting news, new product launches, exclusive offers, and the latest fashion trends.
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 40px; padding-top: 30px; border-top: 1px solid #eee;">
              <p style="color: #999; font-size: 14px; margin: 0;">
                Best regards,<br>
                Muse Team
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
        { error: 'Failed to send email' },
        { status: 500 }
      );
    }

    const result = await response.json();
    
    return NextResponse.json({
      success: true,
      message: 'Newsletter subscription successful!',
      messageId: result.messageId,
    });

  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// <div style="margin-bottom: 30px;">
//               <h3 style="color: #800000; font-size: 20px; margin: 0 0 15px 0;">What to expect:</h3>
//               <ul style="color: #666; font-size: 16px; line-height: 1.6; padding-left: 20px;">
//                 <li>Latest fashion trends and style tips</li>
//                 <li>New product announcements</li>
//                 <li>Exclusive subscriber-only discounts</li>
//                 <li>Behind-the-scenes content</li>
//               </ul>
//             </div>