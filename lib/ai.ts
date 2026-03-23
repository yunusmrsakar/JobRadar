import { Job, UserProfile, MatchResult } from './types';

// Smart local matching algorithm - no API needed, completely free
export async function scoreJobs(jobs: Job[], profile: UserProfile): Promise<MatchResult[]> {
  return jobs.map((job) => {
    const { score, reasons } = calculateMatchScore(job, profile);
    return {
      jobId: job.id,
      score,
      reasons,
    };
  });
}

function calculateMatchScore(job: Job, profile: UserProfile): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  // 1. Title relevance (max 40 points)
  const titleScore = calculateTitleScore(job.title, profile.title);
  score += titleScore;
  if (titleScore >= 30) reasons.push('Strong title match');
  else if (titleScore >= 15) reasons.push('Partial title match');

  // 2. Language match (max 25 points)
  const langScore = calculateLanguageScore(job, profile.languages);
  score += langScore;
  if (langScore >= 15) reasons.push(`Language match: ${profile.languages.filter(l => jobMentionsLanguage(job, l)).join(', ')}`);

  // 3. Experience level fit (max 15 points)
  const expScore = calculateExperienceScore(job, profile.experienceYears);
  score += expScore;
  if (expScore >= 10) reasons.push('Experience level fits');

  // 4. Location/distance (max 20 points)
  const locScore = calculateLocationScore(job, profile);
  score += locScore;
  if (locScore >= 15) reasons.push('Great location match');
  else if (job.location?.toLowerCase().includes('remote')) reasons.push('Remote position available');

  score = Math.min(100, Math.max(0, Math.round(score)));

  if (reasons.length === 0) {
    reasons.push(score >= 50 ? 'Reasonable overall match' : 'Limited match with your profile');
  }

  return { score, reasons };
}

function calculateTitleScore(jobTitle: string, profileTitle: string): number {
  const jobLower = jobTitle.toLowerCase();
  const profileLower = profileTitle.toLowerCase();

  // Exact match
  if (jobLower.includes(profileLower) || profileLower.includes(jobLower)) return 40;

  // Word-level matching
  const profileWords = profileLower.split(/\s+/).filter(w => w.length > 2);
  const jobWords = jobLower.split(/\s+/);

  let matchedWords = 0;
  for (const pWord of profileWords) {
    if (jobWords.some(jWord => jWord.includes(pWord) || pWord.includes(jWord))) {
      matchedWords++;
    }
  }

  if (profileWords.length === 0) return 10;
  const ratio = matchedWords / profileWords.length;

  // Check related titles
  const relatedTitles = getRelatedTitles(profileLower);
  for (const related of relatedTitles) {
    if (jobLower.includes(related)) return Math.max(ratio * 40, 25);
  }

  return Math.round(ratio * 40);
}

function getRelatedTitles(title: string): string[] {
  const titleMap: Record<string, string[]> = {
    'product manager': ['product owner', 'product lead', 'pm', 'product director', 'head of product'],
    'product owner': ['product manager', 'po', 'scrum master', 'agile coach', 'product lead'],
    'project manager': ['program manager', 'project lead', 'delivery manager', 'pmo'],
    'software engineer': ['developer', 'programmer', 'software developer', 'swe'],
    'data scientist': ['data analyst', 'ml engineer', 'machine learning', 'data engineer'],
    'designer': ['ux designer', 'ui designer', 'product designer', 'ux/ui'],
    'marketing manager': ['growth manager', 'digital marketing', 'marketing lead'],
  };

  for (const [key, related] of Object.entries(titleMap)) {
    if (title.includes(key) || related.some(r => title.includes(r))) {
      return [key, ...related];
    }
  }
  return [];
}

function calculateLanguageScore(job: Job, languages: string[]): number {
  if (!languages.length) return 10;

  let score = 0;
  const matchedLangs: string[] = [];

  for (const lang of languages) {
    if (jobMentionsLanguage(job, lang)) {
      matchedLangs.push(lang);
      // German and English are most important in Germany
      if (['german', 'deutsch'].includes(lang.toLowerCase())) score += 12;
      else if (['english', 'englisch'].includes(lang.toLowerCase())) score += 8;
      else score += 5;
    }
  }

  return Math.min(25, score);
}

function jobMentionsLanguage(job: Job, language: string): boolean {
  const searchText = `${job.title} ${job.description} ${job.languages?.join(' ') || ''}`.toLowerCase();
  const langLower = language.toLowerCase();

  const langVariants: Record<string, string[]> = {
    english: ['english', 'englisch', 'en ', 'english-speaking'],
    german: ['german', 'deutsch', 'de ', 'german-speaking'],
    turkish: ['turkish', 'türkisch', 'turkce'],
    french: ['french', 'französisch', 'francais'],
    spanish: ['spanish', 'spanisch', 'español'],
    italian: ['italian', 'italienisch', 'italiano'],
    portuguese: ['portuguese', 'portugiesisch'],
    dutch: ['dutch', 'niederländisch', 'nederlands'],
    polish: ['polish', 'polnisch', 'polski'],
    russian: ['russian', 'russisch'],
    arabic: ['arabic', 'arabisch'],
    chinese: ['chinese', 'chinesisch', 'mandarin'],
  };

  const variants = langVariants[langLower] || [langLower];
  return variants.some(v => searchText.includes(v));
}

function calculateExperienceScore(job: Job, yearsOfExperience: number): number {
  const text = `${job.title} ${job.description} ${job.experienceRequired || ''}`.toLowerCase();

  // Extract years from text
  const yearMatches = text.match(/(\d+)\+?\s*(?:years?|jahre?|yrs?)/);
  const seniorityKeywords = {
    junior: { min: 0, max: 2 },
    entry: { min: 0, max: 2 },
    mid: { min: 2, max: 5 },
    senior: { min: 5, max: 15 },
    lead: { min: 5, max: 15 },
    principal: { min: 8, max: 20 },
    head: { min: 7, max: 20 },
    director: { min: 8, max: 20 },
    vp: { min: 10, max: 25 },
  };

  let requiredMin = 0;
  let requiredMax = 20;

  if (yearMatches) {
    const requiredYears = parseInt(yearMatches[1]);
    requiredMin = Math.max(0, requiredYears - 1);
    requiredMax = requiredYears + 5;
  }

  for (const [keyword, range] of Object.entries(seniorityKeywords)) {
    if (text.includes(keyword)) {
      requiredMin = range.min;
      requiredMax = range.max;
      break;
    }
  }

  if (yearsOfExperience >= requiredMin && yearsOfExperience <= requiredMax) return 15;
  if (yearsOfExperience >= requiredMin - 1 && yearsOfExperience <= requiredMax + 2) return 10;
  if (yearsOfExperience < requiredMin) return Math.max(0, 15 - (requiredMin - yearsOfExperience) * 3);
  return 5;
}

function calculateLocationScore(job: Job, profile: UserProfile): number {
  const locationLower = (job.location || '').toLowerCase();

  // Remote jobs are always a good match
  if (locationLower.includes('remote') || locationLower.includes('anywhere')) return 18;

  // If we have distance data
  if (job.distanceKm !== undefined) {
    if (job.distanceKm <= profile.distanceKm * 0.3) return 20;
    if (job.distanceKm <= profile.distanceKm * 0.6) return 15;
    if (job.distanceKm <= profile.distanceKm) return 10;
    return 3;
  }

  // Text-based location matching
  const profileLocationLower = profile.location.toLowerCase();
  const profileCity = profileLocationLower.split(',')[0].trim();

  if (locationLower.includes(profileCity)) return 20;

  // Check if same region/state
  const germanRegions: Record<string, string[]> = {
    'bayern': ['münchen', 'munich', 'nürnberg', 'nuremberg', 'augsburg', 'regensburg'],
    'berlin': ['berlin', 'potsdam'],
    'hamburg': ['hamburg'],
    'nrw': ['köln', 'cologne', 'düsseldorf', 'dortmund', 'essen', 'bonn'],
    'hessen': ['frankfurt', 'wiesbaden', 'darmstadt', 'kassel'],
    'baden-württemberg': ['stuttgart', 'karlsruhe', 'mannheim', 'heidelberg', 'freiburg'],
    'sachsen': ['dresden', 'leipzig', 'chemnitz'],
    'niedersachsen': ['hannover', 'hanover', 'braunschweig', 'osnabrück'],
  };

  for (const cities of Object.values(germanRegions)) {
    const profileInRegion = cities.some(c => profileCity.includes(c));
    const jobInRegion = cities.some(c => locationLower.includes(c));
    if (profileInRegion && jobInRegion) return 14;
  }

  // At least in Germany
  if (locationLower.includes('germany') || locationLower.includes('deutschland')) return 8;

  return 5;
}
