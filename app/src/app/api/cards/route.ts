import { NextResponse } from 'next/server';
import { getCards } from '@/lib/data';

// Static export compatibility
export const dynamic = 'force-static';
export const revalidate = 3600;

export async function GET() {
  try {
    const cards = await getCards();
    return NextResponse.json(cards);
  } catch (error) {
    console.error('Error fetching cards:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cards' },
      { status: 500 }
    );
  }
}