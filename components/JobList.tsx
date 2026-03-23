'use client';

import { useState, useMemo } from 'react';
import { Job, JobSource, MatchResult } from '@/lib/types';
import JobCard from './JobCard';
import FilterBar from './FilterBar';

type SortOption = 'matchScore' | 'date' | 'distance';

interface JobListProps {
  jobs: Job[];
  matchResults: MatchResult[];
  sources: { source: JobSource; count: number }[];
}

export default function JobList({ jobs, matchResults, sources }: JobListProps) {
  const [activeSources, setActiveSources] = useState<JobSource[]>(sources.map((s) => s.source));
  const [sortBy, setSortBy] = useState<SortOption>('matchScore');

  const matchMap = useMemo(() => {
    const map = new Map<string, MatchResult>();
    for (const result of matchResults) {
      map.set(result.jobId, result);
    }
    return map;
  }, [matchResults]);

  const enrichedJobs = useMemo(() => {
    return jobs.map((job) => {
      const match = matchMap.get(job.id);
      return {
        ...job,
        matchScore: match?.score ?? job.matchScore,
        matchReasons: match?.reasons,
      };
    });
  }, [jobs, matchMap]);

  const filteredAndSortedJobs = useMemo(() => {
    let result = enrichedJobs.filter((job) => activeSources.includes(job.source));

    result.sort((a, b) => {
      switch (sortBy) {
        case 'matchScore':
          return (b.matchScore ?? 0) - (a.matchScore ?? 0);
        case 'date':
          return new Date(b.postedDate || 0).getTime() - new Date(a.postedDate || 0).getTime();
        case 'distance':
          return (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999);
        default:
          return 0;
      }
    });

    return result;
  }, [enrichedJobs, activeSources, sortBy]);

  const toggleSource = (source: JobSource) => {
    setActiveSources((prev) =>
      prev.includes(source) ? prev.filter((s) => s !== source) : [...prev, source]
    );
  };

  if (!jobs.length) return null;

  return (
    <div className="space-y-4">
      <FilterBar
        sources={sources}
        activeSources={activeSources}
        onToggleSource={toggleSource}
        sortBy={sortBy}
        onSortChange={setSortBy}
        totalCount={filteredAndSortedJobs.length}
      />

      <div className="space-y-3">
        {filteredAndSortedJobs.map((job) => (
          <JobCard key={job.id} job={job} matchReasons={job.matchReasons} />
        ))}
      </div>

      {filteredAndSortedJobs.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg font-medium">No jobs match your filters</p>
          <p className="text-sm mt-1">Try enabling more sources or adjusting your search</p>
        </div>
      )}
    </div>
  );
}
