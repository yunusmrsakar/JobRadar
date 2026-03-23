import { Job } from '../types';

interface HimalayasJob {
  slug?: string;
  title: string;
  companyName: string;
  companySlug?: string;
  locationRestrictions?: string[];
  excerpt?: string;
  description?: string;
  applicationLink?: string;
  pubDate?: string;
  seniority?: string[];
  categories?: string[];
}

export async function searchHimalayas(query: string): Promise<Job[]> {
  try {
    const url = `https://himalayas.app/jobs/api?q=${encodeURIComponent(query)}&country=Germany&limit=25`;

    const res = await fetch(url);
    if (!res.ok) return [];

    const data = await res.json();
    const results: HimalayasJob[] = data.jobs || [];

    return results.map((r, index) => ({
      id: `himalayas-${index}-${r.title.replace(/\s+/g, '-').substring(0, 30)}`,
      title: r.title,
      company: r.companyName || 'Unknown',
      location: r.locationRestrictions?.join(', ') || 'Remote',
      description: stripHtml(r.excerpt || r.description || ''),
      url: r.applicationLink || `https://himalayas.app/jobs/${r.companySlug}`,
      postedDate: r.pubDate,
      source: 'himalayas' as const,
      experienceRequired: r.seniority?.join(', '),
    }));
  } catch (error) {
    console.error('Himalayas search error:', error);
    return [];
  }
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}
