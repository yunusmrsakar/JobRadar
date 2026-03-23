import { Job } from '../types';

interface TheMuseResult {
  id: number;
  name: string;
  company: { name: string };
  locations: { name: string }[];
  contents: string;
  refs: { landing_page: string };
  publication_date: string;
  levels: { name: string }[];
}

export async function searchTheMuse(query: string): Promise<Job[]> {
  try {
    const url = `https://www.themuse.com/api/public/jobs?category=Product%20Management&location=Germany&page=1&descending=true`;

    const res = await fetch(url);
    if (!res.ok) return [];

    const data = await res.json();
    const results: TheMuseResult[] = data.results || [];

    return results
      .filter((r) => {
        const titleLower = r.name.toLowerCase();
        const queryLower = query.toLowerCase();
        const queryWords = queryLower.split(/\s+/);
        return queryWords.some((word) => titleLower.includes(word));
      })
      .map((r) => ({
        id: `themuse-${r.id}`,
        title: r.name,
        company: r.company?.name || 'Unknown',
        location: r.locations?.map((l) => l.name).join(', ') || 'Germany',
        description: stripHtml(r.contents || ''),
        url: r.refs?.landing_page || '',
        postedDate: r.publication_date,
        source: 'themuse' as const,
        experienceRequired: r.levels?.map((l) => l.name).join(', '),
      }));
  } catch (error) {
    console.error('The Muse search error:', error);
    return [];
  }
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}
