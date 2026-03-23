import { Job } from '../types';

interface RemoteOKResult {
  id: string;
  position: string;
  company: string;
  location: string;
  description: string;
  url: string;
  salary_min?: number;
  salary_max?: number;
  date: string;
  tags: string[];
}

export async function searchRemoteOK(query: string): Promise<Job[]> {
  try {
    const url = `https://remoteok.com/api?tag=${encodeURIComponent(query)}`;

    const res = await fetch(url, {
      headers: { 'User-Agent': 'JobAggregator/1.0' },
    });

    if (!res.ok) return [];

    const data = await res.json();
    // First element is metadata, skip it
    const results: RemoteOKResult[] = Array.isArray(data) ? data.slice(1) : [];

    return results
      .filter((r) => r.position && r.company)
      .slice(0, 20)
      .map((r) => ({
        id: `remoteok-${r.id}`,
        title: r.position,
        company: r.company || 'Unknown',
        location: r.location || 'Remote',
        description: stripHtml(r.description || ''),
        url: r.url ? `https://remoteok.com${r.url}` : `https://remoteok.com/remote-jobs/${r.id}`,
        salary: formatRemoteOKSalary(r.salary_min, r.salary_max),
        postedDate: r.date,
        source: 'remoteok' as const,
        languages: r.tags,
      }));
  } catch (error) {
    console.error('RemoteOK search error:', error);
    return [];
  }
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function formatRemoteOKSalary(min?: number, max?: number): string | undefined {
  if (!min && !max) return undefined;
  if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
  if (min) return `ab $${min.toLocaleString()}`;
  return undefined;
}
