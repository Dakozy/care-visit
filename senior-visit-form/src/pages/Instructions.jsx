import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Instructions() {
  const navigate = useNavigate();
  return (
    <div className="app-shell">
      <div className="topbar">
        <h1>Instructions</h1>
      </div>
      <div className="container">
        <div className="card">
          <h3>Before you begin</h3>
          <ul>
            <li>Ensure GPS/Location is enabled on your device.</li>
            <li>You can work offline — your report saves as a draft automatically every 10 seconds.</li>
            <li>Complete every required field marked with an asterisk.</li>
          </ul>
          <h3>During the visit</h3>
          <ul>
            <li>Move through each section using the Next / Back buttons.</li>
            <li>Non-Medical caregivers will not see the Medical Assessment section.</li>
            <li>Take clear photos of the senior, their living environment, and medication.</li>
            <li>Ask the senior citizen (or their family) to review before you sign.</li>
          </ul>
          <h3>Submitting</h3>
          <ul>
            <li>Tap Submit Report once — it will disable automatically to prevent duplicates.</li>
            <li>If you are offline, the report is queued and can be retried later.</li>
            <li>A confirmation screen and PDF summary are shown after a successful submission.</li>
          </ul>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
      </div>
    </div>
  );
}
