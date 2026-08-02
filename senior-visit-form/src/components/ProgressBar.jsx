import React from 'react';

export default function ProgressBar({ current, total, stepLabel }) {
  const pct = Math.round((current / total) * 100);
  return (
    <div className="progress-wrap">
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="progress-label">
        Step {current} of {total}{stepLabel ? ` — ${stepLabel}` : ''}
      </div>
    </div>
  );
}
