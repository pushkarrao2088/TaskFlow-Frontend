import React from 'react';

export const HealthBadge = ({ health }) => {
  const styles = {
    ON_TRACK: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    AT_RISK: 'bg-amber-100 text-amber-800 border-amber-300',
    DELAYED: 'bg-rose-100 text-rose-800 border-rose-300',
  };

  const labels = {
    ON_TRACK: 'On Track',
    AT_RISK: 'At Risk',
    DELAYED: 'Delayed',
  };

  const currentStyle = styles[health] || 'bg-slate-100 text-slate-700 border-slate-300';
  const label = labels[health] || health;

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${currentStyle}`}>
      {label}
    </span>
  );
};
