import React from 'react';
import LoadingSpinner from './LoadingSpinner.jsx';

export default function StepNavigation({
  onBack,
  onNext,
  isFirst,
  isLast,
  submitting,
  nextLabel = 'Next',
}) {
  return (
    <div className="btn-row" style={{ marginTop: 20 }}>
      {!isFirst && (
        <button type="button" className="btn btn-secondary" onClick={onBack} disabled={submitting}>
          Back
        </button>
      )}
      <button type="button" className={isLast ? 'btn btn-success' : 'btn btn-primary'} onClick={onNext} disabled={submitting}>
        {submitting ? <LoadingSpinner label="Submitting..." /> : isLast ? 'Submit Report' : nextLabel}
      </button>
    </div>
  );
}
