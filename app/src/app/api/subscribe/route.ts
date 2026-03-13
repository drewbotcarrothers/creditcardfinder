import { NextRequest, NextResponse } from 'next/server';

// Static export compatibility - API routes must be static
export const dynamic = 'force-static';

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
    // 2. Send welcome email
    // 3. Add to newsletter service (Mailchimp, ConvertKit, etc.)
    // 4. Trigger webhook notifications

    console.log('New subscriber:', subscriber);

    // For now, we'll just return success
    // In production, you should:
    // - Save to database
    // - Handle duplicates
    // - Send confirmation email
    // - Add to email service

    return NextResponse.json({
      success: true,
      message: 'Subscription successful!',
      subscriber: {
        email: subscriber.email,
        location: subscriber.location,
        subscribedAt: subscriber.subscribedAt,
      },
    });

  } catch (error) {
    console.error('Subscription error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process subscription' },
      { status: 500 }
    );
  }
}