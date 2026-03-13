import { NextRequest, NextResponse } from 'next/server';

// Simple email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, location, source } = body;

    // Validate email
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Store subscriber data (in production, save to database)
    const subscriber = {
      email: email.toLowerCase().trim(),
      location,
      source: source || 'unknown',
      subscribedAt: new Date().toISOString(),
      userAgent: request.headers.get('user-agent') || 'unknown',
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
    };

    // Here you would typically:
    // 1. Save to database (Supabase, PlanetScale, etc.)
    // 2. Add to Hostinger mailing list via their API
    // 3. Send confirmation email
    // 4. Add to ConvertKit, Mailchimp, etc.

    console.log('New subscriber:', subscriber);

    // TODO: Integrate with Hostinger Email Service
    // Hostinger typically provides SMTP settings:
    // - SMTP Host: smtp.hostinger.com
    // - Port: 465 (SSL) or 587 (TLS)
    // - Username: your-hostinger-email@domain.com
    // - Password: your-hostinger-password
    //
    // You can use nodemailer or a similar library to send emails
    
    /*
    EXAMPLE Hostinger Integration:
    
    import nodemailer from 'nodemailer';
    
    const transporter = nodemailer.createTransporter({
      host: 'smtp.hostinger.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.HOSTINGER_EMAIL_USER,
        pass: process.env.HOSTINGER_EMAIL_PASS,
      },
    });
    
    await transporter.sendMail({
      from: '"Canadian Credit Card Finder" <noreply@yourdomain.com>',
      to: email,
      subject: 'Welcome to Credit Card Alerts! 🎉',
      html: `<h1>Thanks for subscribing!</h1><p>You'll receive alerts about the best credit card offers.</p>`,
    });
    */

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed!',
      subscriber,
    });

  } catch (error) {
    console.error('Subscription error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process subscription' },
      { status: 500 }
    );
  }
}

// Get subscribers (admin only - would need auth in production)
export async function GET(request: NextRequest) {
  // In production, add authentication here
  // const token = request.headers.get('authorization');
  // if (!token || !isValidToken(token)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  return NextResponse.json({
    message: 'Export subscribers by sending a POST request with action: "export"',
    note: 'Authentication required in production',
  });
}