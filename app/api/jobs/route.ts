import { NextRequest, NextResponse } from 'next/server';
import { searchAllSources } from '@/lib/jobSources';
import { SearchParams } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body: SearchParams = await request.json();

    if (!body.title || !body.location) {
      return NextResponse.json(
        { error: 'Title and location are required' },
        { status: 400 }
      );
    }

    const params: SearchParams = {
      title: body.title,
      location: body.location,
      distanceKm: body.distanceKm || 50,
      languages: body.languages || [],
      experienceYears: body.experienceYears || 0,
    };

    const result = await searchAllSources(params);

    return NextResponse.json({
      jobs: result.jobs,
      totalCount: result.jobs.length,
      sources: result.sources,
    });
  } catch (error) {
    console.error('Job search error:', error);
    return NextResponse.json(
      { error: 'Failed to search jobs' },
      { status: 500 }
    );
  }
}
