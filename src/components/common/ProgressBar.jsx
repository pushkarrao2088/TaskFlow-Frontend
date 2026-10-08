import React from 'react';

export const ProgressBar = ({ progress = 0, size = 'md', showText = true }) => {
  const percentage = Math.min(100, Math.max(0, Math.round(progress)));

  let colorClass = 'bg-blue-600';
  if (percentage === 100) {
    colorClass = 'bg-emerald-500';
  } else if (percentage < 30) {
    colorClass = 'bg-rose-500';
  } else if (percentage < 70) {
    colorClass = 'bg-amber-500';
  }

  const heights = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  return (
    <div className="w-full">
      {showText && (
        <div className="flex justify-between items-center mb-1 text-xs font-semibold text-slate-700">
          <span>Progress</span>
          <span>{percentage}%</span>
        </div>
      )}
      <div className={`w-full bg-slate-200 rounded-full overflow-hidden ${heights[size]}`}>
        <div
          className={`h-full transition-all duration-500 ease-out ${colorClass}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
