import { NextRequest, NextResponse } from 'next/server';

// This would need proper authentication in production
// For now, requiring a secret token in the query string

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  // Simple token check - in production use proper auth
  if (token !== process.env.ADMIN_TOKEN && token !== 'dev-token-123') {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // Note: In a real app, this would fetch from a database
  // For now, returning a message about where subscribers are stored
  return NextResponse.json({
    message: 'Subscriber export endpoint',
    note: 'In static export mode, subscribers are stored in browser localStorage.',
    instructions: [
      '1. Open browser DevTools (F12)',
      '2. Go to Application > Local Storage',
      '3. Find your domain',
      '4. Look for "emailSubscribers" key',
      '5. Copy the value and parse as JSON',
    ],
    // When using a real database, return:
    // subscribers: await db.subscribers.findMany(),
    // csv: generateCSV(subscribers),
  });
}

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (token !== process.env.ADMIN_TOKEN && token !== 'dev-token-123') {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { subscribers } = body;

    // Generate CSV
    const headers = ['Email', 'Location', 'Subscribed At', 'Source'];
    const rows = subscribers.map((sub: any) => [
      sub.email,
      sub.location,
      sub.subscribedAt,
      sub.source,
    ]);

    const csv = [headers.join(','), ...rows.map((row: any[]) => row.join(','))].join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="subscribers.csv"',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to generate CSV' },
      { status: 500 }
    );
  }
}
