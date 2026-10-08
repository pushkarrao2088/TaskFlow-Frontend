import React from 'react';

export const StatusBadge = ({ status }) => {
  const styles = {
    TODO: 'bg-slate-100 text-slate-700 border-slate-300',
    IN_PROGRESS: 'bg-blue-50 text-blue-700 border-blue-200',
    IN_REVIEW: 'bg-amber-50 text-amber-700 border-amber-200',
    DONE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  };

  const labels = {
    TODO: 'To Do',
    IN_PROGRESS: 'In Progress',
    IN_REVIEW: 'In Review',
    DONE: 'Done',
  };

  const currentStyle = styles[status] || 'bg-slate-100 text-slate-700 border-slate-300';
  const label = labels[status] || status;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${currentStyle}`}>
      <span className="w-1.5 h-1.5 mr-1.5 rounded-full fill-current opacity-75 bg-current"></span>
      {label}
    </span>
  );
};
