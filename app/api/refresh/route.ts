import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    message: 'Cache refreshed successfully',
    timestamp: new Date().toISOString(),
  });
}