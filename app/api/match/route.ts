import { NextRequest, NextResponse } from 'next/server';
import { scoreJobs } from '@/lib/ai';
import { Job, UserProfile } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body: { jobs: Job[]; profile: UserProfile } = await request.json();

    if (!body.jobs?.length || !body.profile) {
      return NextResponse.json(
        { error: 'Jobs and profile are required' },
        { status: 400 }
      );
    }

    const results = await scoreJobs(body.jobs, body.profile);

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Match scoring error:', error);
    return NextResponse.json(
      { error: 'Failed to score jobs' },
      { status: 500 }
    );
  }
}
