import { NextRequest, NextResponse } from 'next/server';
import { searchLocations } from '@/lib/geocoding';

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q');

  if (!query || query.length < 2) {
    return NextResponse.json([]);
  }

  const results = await searchLocations(query);
  return NextResponse.json(results);
}
