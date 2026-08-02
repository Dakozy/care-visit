import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveAuth } from '../services/localStorage.js';
import LoadingSpinner from './LoadingSpinner.jsx';

export default function Login() {
  const navigate = useNavigate();
  const [caregiverId, setCaregiverId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!caregiverId || !password) {
      setError('Please enter both Caregiver ID and Password.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}caregivers.json`);
      const caregivers = await res.json();
      const match = caregivers.find(
        (c) => c.caregiverId.toLowerCase() === caregiverId.trim().toLowerCase() && c.password === password
      );
      if (!match) {
        setError('Invalid Caregiver ID or Password.');
        setLoading(false);
        return;
      }
      saveAuth({
        caregiverId: match.caregiverId,
        name: match.name,
        category: match.category,
      });
      navigate('/dashboard');
    } catch (err) {
      setError('Unable to verify credentials. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell">
      <div className="container">
        <div className="login-hero">
          <div className="logo-circle">OB</div>
          <h2 style={{ marginBottom: 2 }}>O. B. Lulu-Briggs Foundation</h2>
          <p style={{ color: 'var(--muted)', marginTop: 0 }}>Senior Citizen Daily Care Visit Report</p>
        </div>
        <form className="card" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="caregiverId">Caregiver ID</label>
            <input
              id="caregiverId"
              type="text"
              value={caregiverId}
              onChange={(e) => setCaregiverId(e.target.value)}
              placeholder="e.g. CG-001"
              autoComplete="username"
            />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
            />
          </div>
          {error && <p className="error-text">{error}</p>}
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <LoadingSpinner label="Signing in..." /> : 'Sign In'}
          </button>
        </form>
        <p className="hint" style={{ textAlign: 'center' }}>
          Contact your program coordinator if you have forgotten your credentials.
        </p>
      </div>
    </div>
  );
}
