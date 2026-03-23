'use client';

import { Job } from '@/lib/types';
import MatchScore from './MatchScore';

const SOURCE_CONFIG: Record<string, { label: string; color: string }> = {
  adzuna: { label: 'Adzuna', color: 'bg-green-100 text-green-700' },
  arbeitnow: { label: 'Arbeitnow', color: 'bg-blue-100 text-blue-700' },
  himalayas: { label: 'Himalayas', color: 'bg-purple-100 text-purple-700' },
  themuse: { label: 'The Muse', color: 'bg-pink-100 text-pink-700' },
  remoteok: { label: 'RemoteOK', color: 'bg-orange-100 text-orange-700' },
  stepstone: { label: 'StepStone', color: 'bg-teal-100 text-teal-700' },
  linkedin: { label: 'LinkedIn', color: 'bg-sky-100 text-sky-700' },
  indeed: { label: 'Indeed', color: 'bg-indigo-100 text-indigo-700' },
};

interface JobCardProps {
  job: Job;
  matchReasons?: string[];
}

export default function JobCard({ job, matchReasons }: JobCardProps) {
  const sourceInfo = SOURCE_CONFIG[job.source] || { label: job.source, color: 'bg-gray-100 text-gray-700' };

  const timeAgo = job.postedDate ? getTimeAgo(job.postedDate) : null;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-5 group">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${sourceInfo.color}`}>
              {sourceInfo.label}
            </span>
            {job.distanceKm !== undefined && (
              <span className="text-xs text-gray-400">{job.distanceKm} km</span>
            )}
            {timeAgo && <span className="text-xs text-gray-400">{timeAgo}</span>}
          </div>

          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
            {job.title}
          </h3>

          <p className="text-sm font-medium text-gray-600 mt-0.5">{job.company}</p>

          <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {job.location || 'Not specified'}
            </span>
            {job.salary && (
              <span className="flex items-center gap-1 font-medium text-green-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                {job.salary}
              </span>
            )}
          </div>

          <p className="text-sm text-gray-500 mt-2 line-clamp-2">{job.description}</p>
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          {job.matchScore !== undefined && (
            <MatchScore score={job.matchScore} reasons={matchReasons} />
          )}
          <a
            href={job.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            Apply
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}

function getTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
}
