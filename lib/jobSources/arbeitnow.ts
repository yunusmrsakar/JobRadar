import { Job } from '../types';

interface ArbeitnowResult {
  slug: string;
  title: string;
  company_name: string;
  location: string;
  description: string;
  url: string;
  tags: string[];
  created_at: string;
  remote: boolean;
}

export async function searchArbeitnow(query: string): Promise<Job[]> {
  try {
    const url = `https://www.arbeitnow.com/api/job-board-api?search=${encodeURIComponent(query)}`;

    const res = await fetch(url);
    if (!res.ok) return [];

    const data = await res.json();
    const results: ArbeitnowResult[] = data.data || [];

    return results.map((r) => ({
      id: `arbeitnow-${r.slug}`,
      title: r.title,
      company: r.company_name || 'Unknown',
      location: r.remote ? `${r.location} (Remote)` : r.location,
      description: stripHtml(r.description || ''),
      url: r.url,
      postedDate: r.created_at,
      source: 'arbeitnow' as const,
      languages: r.tags?.filter((t) => ['english', 'german', 'deutsch', 'englisch'].includes(t.toLowerCase())),
    }));
  } catch (error) {
    console.error('Arbeitnow search error:', error);
    return [];
  }
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}
