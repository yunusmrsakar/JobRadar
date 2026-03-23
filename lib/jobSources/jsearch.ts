import { Job, JobSource } from '../types';

interface JSearchResult {
  job_id: string;
  job_title: string;
  employer_name: string;
  employer_logo?: string;
  job_city: string;
  job_state: string;
  job_country: string;
  job_description: string;
  job_apply_link: string;
  job_min_salary?: number;
  job_max_salary?: number;
  job_salary_currency?: string;
  job_posted_at_datetime_utc: string;
  job_latitude?: number;
  job_longitude?: number;
  job_is_remote?: boolean;
  job_publisher?: string;
}

export async function searchJSearch(query: string, location: string): Promise<Job[]> {
  const apiKey = process.env.RAPIDAPI_KEY;

  if (!apiKey) {
    console.warn('RapidAPI key not configured');
    return [];
  }

  try {
    const searchQuery = `${query} in ${location}, Germany`;
    const url = `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(searchQuery)}&num_pages=1&page=1&date_posted=month`;

    const res = await fetch(url, {
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': 'jsearch.p.rapidapi.com',
      },
    });

    if (!res.ok) {
      console.warn('JSearch API error:', res.status);
      return [];
    }

    const data = await res.json();
    const results: JSearchResult[] = data.data || [];

    return results.map((r) => {
      const source = detectSource(r.job_publisher);
      return {
        id: `${source}-${r.job_id}`,
        title: r.job_title,
        company: r.employer_name || 'Unknown',
        location: r.job_is_remote
          ? `${r.job_city || r.job_state || ''} (Remote)`
          : [r.job_city, r.job_state].filter(Boolean).join(', ') || 'Germany',
        description: (r.job_description || '').substring(0, 500),
        url: r.job_apply_link,
        salary: formatSalary(r.job_min_salary, r.job_max_salary, r.job_salary_currency),
        postedDate: r.job_posted_at_datetime_utc,
        source,
        latitude: r.job_latitude,
        longitude: r.job_longitude,
      };
    });
  } catch (error) {
    console.error('JSearch error:', error);
    return [];
  }
}

function detectSource(publisher?: string): JobSource {
  if (!publisher) return 'linkedin';
  const pub = publisher.toLowerCase();
  if (pub.includes('indeed')) return 'indeed';
  if (pub.includes('linkedin')) return 'linkedin';
  return 'linkedin';
}

function formatSalary(min?: number, max?: number, currency?: string): string | undefined {
  const sym = currency === 'EUR' ? '€' : currency === 'USD' ? '$' : currency || '€';
  if (!min && !max) return undefined;
  if (min && max) return `${sym}${min.toLocaleString()} - ${sym}${max.toLocaleString()}`;
  if (min) return `ab ${sym}${min.toLocaleString()}`;
  return undefined;
}
