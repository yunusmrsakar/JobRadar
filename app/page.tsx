'use client';

import { useState } from 'react';
import SearchForm from '@/components/SearchForm';
import JobList from '@/components/JobList';
import { Job, JobSource, MatchResult, SearchParams } from '@/lib/types';

export default function Home() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [matchResults, setMatchResults] = useState<MatchResult[]>([]);
  const [sources, setSources] = useState<{ source: JobSource; count: number }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isScoring, setIsScoring] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (params: SearchParams) => {
    setIsLoading(true);
    setError(null);
    setHasSearched(true);
    setJobs([]);
    setMatchResults([]);

    try {
      const jobsRes = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (!jobsRes.ok) throw new Error('Failed to fetch jobs');

      const jobsData = await jobsRes.json();
      setJobs(jobsData.jobs);
      setSources(jobsData.sources);
      setIsLoading(false);

      if (jobsData.jobs.length > 0) {
        setIsScoring(true);
        try {
          const matchRes = await fetch('/api/match', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              jobs: jobsData.jobs,
              profile: {
                title: params.title,
                languages: params.languages,
                experienceYears: params.experienceYears,
                location: params.location,
                distanceKm: params.distanceKm,
              },
            }),
          });

          if (matchRes.ok) {
            const matchData = await matchRes.json();
            setMatchResults(matchData.results || []);
          }
        } catch {
          console.warn('AI scoring failed, showing results without scores');
        } finally {
          setIsScoring(false);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white">
        <div className="max-w-5xl mx-auto px-4 py-12 md:py-16">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              JobRadar
            </h1>
            <p className="mt-3 text-lg md:text-xl text-blue-100 max-w-2xl mx-auto">
              AI-powered job search across all major platforms in Germany.
              One search, every opportunity.
            </p>
          </div>

          <SearchForm onSearch={handleSearch} isLoading={isLoading} />
        </div>
      </div>

      {/* Results */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
            <p className="font-medium">Error: {error}</p>
            <p className="text-sm mt-1">Please check your API keys and try again.</p>
          </div>
        )}

        {isScoring && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            AI is analyzing job matches...
          </div>
        )}

        {jobs.length > 0 && (
          <JobList jobs={jobs} matchResults={matchResults} sources={sources} />
        )}

        {hasSearched && !isLoading && jobs.length === 0 && !error && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">&#128269;</div>
            <h3 className="text-xl font-semibold text-gray-700">No jobs found</h3>
            <p className="text-gray-500 mt-2 max-w-md mx-auto">
              Try adjusting your search criteria, increasing the distance, or using a different job title.
            </p>
          </div>
        )}

        {!hasSearched && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">&#128640;</div>
            <h3 className="text-xl font-semibold text-gray-700">Ready to find your next role?</h3>
            <p className="text-gray-500 mt-2 max-w-md mx-auto">
              Enter your details above and we will search across LinkedIn, Indeed, StepStone, Adzuna, Arbeitnow, Himalayas, The Muse, and RemoteOK to find the best matches for you.
            </p>
            <div className="flex justify-center gap-3 mt-6 flex-wrap">
              {['LinkedIn', 'Indeed', 'StepStone', 'Adzuna', 'Arbeitnow', 'Himalayas', 'The Muse', 'RemoteOK'].map((platform) => (
                <span
                  key={platform}
                  className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm text-gray-600 shadow-sm"
                >
                  {platform}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-auto border-t border-gray-200 bg-white">
        <div className="max-w-5xl mx-auto px-4 py-6 text-center text-sm text-gray-500">
          <p>JobRadar - AI-Powered Job Aggregator for Germany</p>
          <p className="mt-1">Searches across multiple platforms to find you the best opportunities.</p>
        </div>
      </footer>
    </main>
  );
}
