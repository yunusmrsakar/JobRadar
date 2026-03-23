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
    // Fetch multiple pages and search variations for better coverage
    const searchTerms = getSearchVariations(query);
    const allResults: ArbeitnowResult[] = [];
    const seenSlugs = new Set<string>();

    for (const term of searchTerms) {
      const url = `https://www.arbeitnow.com/api/job-board-api?search=${encodeURIComponent(term)}`;
      const res = await fetch(url);
      if (!res.ok) continue;

      const data = await res.json();
      const results: ArbeitnowResult[] = data.data || [];

      for (const r of results) {
        if (!seenSlugs.has(r.slug)) {
          seenSlugs.add(r.slug);
          allResults.push(r);
        }
      }
    }

    return allResults.slice(0, 50).map((r) => ({
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

function getSearchVariations(query: string): string[] {
  const variations = [query];
  const lowerQuery = query.toLowerCase();

  // Add related search terms for common titles
  if (lowerQuery.includes('product manager')) {
    variations.push('Product Owner', 'Product Lead');
  } else if (lowerQuery.includes('product owner')) {
    variations.push('Product Manager', 'Scrum Master');
  } else if (lowerQuery.includes('project manager')) {
    variations.push('Program Manager', 'Delivery Manager');
  }

  return variations.slice(0, 3); // Max 3 API calls
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}
