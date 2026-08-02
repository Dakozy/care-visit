import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function Success() {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state) {
    navigate('/dashboard');
    return null;
  }

  const { submissionId, form } = state;

  const handlePrint = () => window.print();

  return (
    <div className="app-shell">
      <div className="container">
        <div className="success-check">✓</div>
        <h2 style={{ textAlign: 'center' }}>Report Submitted Successfully</h2>
        <p style={{ textAlign: 'center', color: 'var(--muted)' }}>Submission ID: {submissionId}</p>

        <div className="card" id="printable-summary">
          <h3>Visit Summary</h3>
          <p><strong>Senior:</strong> {form.seniorName} ({form.seniorId})</p>
          <p><strong>Community / LGA:</strong> {form.community}, {form.lga}</p>
          <p><strong>Visit Date/Time:</strong> {form.visitDate} at {form.visitTime}</p>
          <p><strong>Caregiver:</strong> {form.caregiverName} ({form.caregiverCategory})</p>
          <p><strong>General Mood:</strong> {form.generalMood}</p>
          <p><strong>Mobility:</strong> {form.mobility}</p>
          <p><strong>Emergency Flagged:</strong> {form.emergency}</p>
          {form.caregiverCategory === 'Medical' && (
            <p><strong>Vitals:</strong> BP {form.bloodPressure}, Pulse {form.pulse}, Temp {form.temperature}°C</p>
          )}
        </div>

        <div className="btn-row">
          <button className="btn btn-outline" onClick={handlePrint}>Print / Save PDF</button>
          <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
        </div>
      </div>
    </div>
  );
}
