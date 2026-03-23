import { Job } from '../types';

export async function searchStepStone(query: string, location: string): Promise<Job[]> {
  try {
    const slug = query.toLowerCase().replace(/\s+/g, '-');
    const locSlug = location.toLowerCase().replace(/\s+/g, '-');
    const url = `https://www.stepstone.de/work/${encodeURIComponent(slug)}/in-${encodeURIComponent(locSlug)}?radius=50`;

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-DE,en;q=0.9,de;q=0.8',
      },
    });

    if (!res.ok) return [];

    const html = await res.text();
    return parseJobListings(html);
  } catch (error) {
    console.error('StepStone search error:', error);
    return [];
  }
}

function parseJobListings(html: string): Job[] {
  const jobs: Job[] = [];

  // Split by job-item markers
  const blocks = html.split(/data-at="job-item"/);
  // Skip first block (before first job)
  const jobBlocks = blocks.slice(1);

  for (const block of jobBlocks) {
    const truncated = block.substring(0, 10000);

    // Extract visible texts (filter out CSS)
    const allTexts = extractVisibleTexts(truncated);

    // Extract title (first meaningful text after job-item-title)
    const titleSection = truncated.match(/data-at="job-item-title"(.*?)data-at="job-item-company-name"/s);
    const title = titleSection
      ? extractFirstVisibleText(titleSection[1])
      : allTexts[0] || '';

    // Extract company
    const companySection = truncated.match(/data-at="job-item-company-name"(.*?)(?:data-at="job-item-location"|data-at="job-item-middle"|data-at="job-item-badge")/s);
    const company = companySection
      ? extractFirstVisibleText(companySection[1])
      : '';

    // Extract location
    const locationSection = truncated.match(/data-at="job-item-location"(.*?)(?:data-at="job-item-work-from-home"|data-at="job-item-timeago"|data-at="listing-save"|<\/article)/s);
    const location = locationSection
      ? extractFirstVisibleText(locationSection[1])
      : '';

    // Extract URL - look for /jobs-- pattern
    const jobUrlMatch = truncated.match(/href="(\/jobs--[^"]+\.html)"/);
    const jobUrl = jobUrlMatch
      ? `https://www.stepstone.de${jobUrlMatch[1]}`
      : '';

    if (!title || title.length < 3) continue;

    // Extract ID from URL
    const idMatch = jobUrl.match(/--(\d+)-inline\.html/);
    const id = idMatch ? idMatch[1] : `${Date.now()}-${jobs.length}`;

    jobs.push({
      id: `stepstone-${id}`,
      title: decodeHtmlEntities(title),
      company: decodeHtmlEntities(company) || 'Unknown',
      location: location || 'Germany',
      description: '',
      url: jobUrl || 'https://www.stepstone.de',
      source: 'stepstone' as const,
    });
  }

  return jobs;
}

function extractVisibleTexts(html: string): string[] {
  const matches = html.match(/>([^<]+)</g) || [];
  return matches
    .map(m => m.slice(1, -1).trim())
    .filter(t =>
      t.length > 2 &&
      !t.startsWith('.res-') &&
      !t.startsWith('{') &&
      !t.startsWith('#no-js') &&
      !t.startsWith('box-sizing') &&
      !t.includes('border-box')
    );
}

function extractFirstVisibleText(html: string): string {
  const texts = extractVisibleTexts(html);
  return texts[0] || '';
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}
