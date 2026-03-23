'use client';

interface MatchScoreProps {
  score: number;
  reasons?: string[];
}

export default function MatchScore({ score, reasons }: MatchScoreProps) {
  const getColor = () => {
    if (score >= 80) return 'from-green-500 to-emerald-600';
    if (score >= 60) return 'from-yellow-500 to-orange-500';
    if (score >= 40) return 'from-orange-500 to-red-500';
    return 'from-red-500 to-red-700';
  };

  const getLabel = () => {
    if (score >= 80) return 'Excellent Match';
    if (score >= 60) return 'Good Match';
    if (score >= 40) return 'Partial Match';
    return 'Low Match';
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <div
        className={`bg-gradient-to-r ${getColor()} text-white text-sm font-bold px-3 py-1.5 rounded-lg shadow-sm`}
        title={reasons?.join(', ')}
      >
        {score}% - {getLabel()}
      </div>
      {reasons && reasons.length > 0 && (
        <p className="text-xs text-gray-400 max-w-48 text-right truncate" title={reasons.join(', ')}>
          {reasons[0]}
        </p>
      )}
    </div>
  );
}
