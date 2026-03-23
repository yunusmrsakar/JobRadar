'use client';

import { JobSource } from '@/lib/types';

const SOURCE_LABELS: Record<JobSource, string> = {
  adzuna: 'Adzuna',
  arbeitnow: 'Arbeitnow',
  himalayas: 'Himalayas',
  themuse: 'The Muse',
  remoteok: 'RemoteOK',
};

type SortOption = 'matchScore' | 'date' | 'distance';

interface FilterBarProps {
  sources: { source: JobSource; count: number }[];
  activeSources: JobSource[];
  onToggleSource: (source: JobSource) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  totalCount: number;
}

export default function FilterBar({
  sources,
  activeSources,
  onToggleSource,
  sortBy,
  onSortChange,
  totalCount,
}: FilterBarProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm font-semibold text-gray-700">
            {totalCount} jobs found
          </span>
          <div className="h-4 w-px bg-gray-300 hidden sm:block" />
          <div className="flex flex-wrap gap-2">
            {sources.map(({ source, count }) => (
              <button
                key={source}
                onClick={() => onToggleSource(source)}
                className={`text-xs font-medium px-3 py-1.5 rounded-full transition-all ${
                  activeSources.includes(source)
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {SOURCE_LABELS[source] || source} ({count})
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="matchScore">AI Match Score</option>
            <option value="date">Newest First</option>
            <option value="distance">Nearest First</option>
          </select>
        </div>
      </div>
    </div>
  );
}
