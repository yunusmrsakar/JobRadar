import { Job } from '../types';

interface AdzunaResult {
  id: string;
  title: string;
  company: { display_name: string };
  location: { display_name: string; area: string[] };
  description: string;
  redirect_url: string;
  salary_min?: number;
  salary_max?: number;
  created: string;
  latitude?: number;
  longitude?: number;
}

export async function searchAdzuna(query: string, location: string): Promise<Job[]> {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;

  if (!appId || !appKey) {
    console.warn('Adzuna API keys not configured');
    return [];
  }

  try {
    const url = `https://api.adzuna.com/v1/api/jobs/de/search/1?app_id=${appId}&app_key=${appKey}&results_per_page=25&what=${encodeURIComponent(query)}&where=${encodeURIComponent(location)}&content-type=application/json`;

    const res = await fetch(url);
    if (!res.ok) return [];

    const data = await res.json();
    const results: AdzunaResult[] = data.results || [];

    return results.map((r) => ({
      id: `adzuna-${r.id}`,
      title: r.title,
      company: r.company?.display_name || 'Unknown',
      location: r.location?.display_name || '',
      description: r.description || '',
      url: r.redirect_url,
      salary: formatSalary(r.salary_min, r.salary_max),
      postedDate: r.created,
      source: 'adzuna' as const,
      latitude: r.latitude,
      longitude: r.longitude,
    }));
  } catch (error) {
    console.error('Adzuna search error:', error);
    return [];
  }
}

function formatSalary(min?: number, max?: number): string | undefined {
  if (!min && !max) return undefined;
  if (min && max) return `€${Math.round(min).toLocaleString()} - €${Math.round(max).toLocaleString()}`;
  if (min) return `ab €${Math.round(min).toLocaleString()}`;
  if (max) return `bis €${Math.round(max).toLocaleString()}`;
  return undefined;
}
