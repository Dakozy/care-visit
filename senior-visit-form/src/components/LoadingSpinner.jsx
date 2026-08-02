import React from 'react';

export default function LoadingSpinner({ label }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <span className="spinner" aria-hidden="true" />
      {label && <span>{label}</span>}
    </span>
  );
}
