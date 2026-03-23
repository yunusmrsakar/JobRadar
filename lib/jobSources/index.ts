import { Job, JobSource, SearchParams } from '../types';
import { searchAdzuna } from './adzuna';
import { searchArbeitnow } from './arbeitnow';
import { searchHimalayas } from './himalayas';
import { searchTheMuse } from './themuse';
import { searchRemoteOK } from './remoteok';
import { searchStepStone } from './stepstone';
import { searchJSearch } from './jsearch';
import { geocodeLocation, calculateDistance } from '../geocoding';

export async function searchAllSources(params: SearchParams): Promise<{
  jobs: Job[];
  sources: { source: JobSource; count: number }[];
}> {
  const geo = await geocodeLocation(params.location);

  const [adzunaJobs, arbeitnowJobs, himalayasJobs, museJobs, remoteokJobs, stepstoneJobs, jsearchJobs] = await Promise.allSettled([
    searchAdzuna(params.title, params.location),
    searchArbeitnow(params.title),
    searchHimalayas(params.title),
    searchTheMuse(params.title),
    searchRemoteOK(params.title),
    searchStepStone(params.title, params.location),
    searchJSearch(params.title, params.location),
  ]);

  const allJobs: Job[] = [
    ...(adzunaJobs.status === 'fulfilled' ? adzunaJobs.value : []),
    ...(arbeitnowJobs.status === 'fulfilled' ? arbeitnowJobs.value : []),
    ...(himalayasJobs.status === 'fulfilled' ? himalayasJobs.value : []),
    ...(museJobs.status === 'fulfilled' ? museJobs.value : []),
    ...(remoteokJobs.status === 'fulfilled' ? remoteokJobs.value : []),
    ...(stepstoneJobs.status === 'fulfilled' ? stepstoneJobs.value : []),
    ...(jsearchJobs.status === 'fulfilled' ? jsearchJobs.value : []),
  ];

  // Calculate distances if we have geocoding
  if (geo) {
    for (const job of allJobs) {
      if (job.latitude && job.longitude) {
        job.distanceKm = calculateDistance(geo.lat, geo.lon, job.latitude, job.longitude);
      }
    }
  }

  // Filter by distance if applicable
  const filteredJobs = params.distanceKm > 0
    ? allJobs.filter((job) => {
        if (job.distanceKm !== undefined) return job.distanceKm <= params.distanceKm;
        // Keep jobs without coordinates (can't determine distance)
        return true;
      })
    : allJobs;

  // Remove duplicates by similar title + company
  const uniqueJobs = deduplicateJobs(filteredJobs);

  // Count per source
  const sourceCounts = new Map<JobSource, number>();
  for (const job of uniqueJobs) {
    sourceCounts.set(job.source, (sourceCounts.get(job.source) || 0) + 1);
  }

  const sources = Array.from(sourceCounts.entries()).map(([source, count]) => ({ source, count }));

  return { jobs: uniqueJobs, sources };
}

function deduplicateJobs(jobs: Job[]): Job[] {
  const seen = new Set<string>();
  return jobs.filter((job) => {
    const key = `${job.title.toLowerCase().trim()}-${job.company.toLowerCase().trim()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
