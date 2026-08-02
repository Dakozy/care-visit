import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, clearAuth, getDraft, getTheme, setTheme } from '../services/localStorage.js';

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [auth, setAuth] = useState(null);
  const [hasDraft, setHasDraft] = useState(false);
  const [theme, setThemeState] = useState(getTheme());
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const a = getAuth();
    if (!a) {
      navigate('/');
      return;
    }
    setAuth(a);
    setHasDraft(!!getDraft());
    document.documentElement.setAttribute('data-theme', theme);

    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setThemeState(next);
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
  };

  const handleLogout = () => {
    clearAuth();
    navigate('/');
  };

  if (!auth) return null;

  return (
    <div className="app-shell">
      <div className="topbar">
        <h1>Care Visit Report</h1>
        <button className="icon-btn" onClick={toggleTheme} aria-label="Toggle dark mode">
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
      </div>
      <div className="container">
        {!online && <div className="banner offline">⚠ You are offline. Drafts save locally and can be submitted once you're back online.</div>}

        <h2 style={{ marginBottom: 0 }}>{greeting()},</h2>
        <p style={{ marginTop: 4, fontSize: '1.1rem', fontWeight: 600 }}>Welcome back, {auth.name}</p>
        <p className="hint">{auth.category} Caregiver · ID: {auth.caregiverId}</p>

        <div className="dashboard-grid" style={{ marginTop: 20 }}>
          <div className="dash-card" onClick={() => navigate('/visit')} role="button">
            <div className="dash-icon">📋</div>
            <div>
              <strong>Daily Visit Report</strong>
              <p className="hint" style={{ margin: 0 }}>Start a new visit report</p>
            </div>
          </div>

          {hasDraft && (
            <div className="dash-card" onClick={() => navigate('/visit?resume=1')} role="button">
              <div className="dash-icon">📝</div>
              <div>
                <strong>Previous Draft</strong>
                <p className="hint" style={{ margin: 0 }}>Resume unfinished report</p>
              </div>
            </div>
          )}

          <div className="dash-card" onClick={() => navigate('/instructions')} role="button">
            <div className="dash-icon">ℹ️</div>
            <div>
              <strong>Instructions</strong>
              <p className="hint" style={{ margin: 0 }}>How to complete a visit</p>
            </div>
          </div>

          <div className="dash-card" onClick={handleLogout} role="button">
            <div className="dash-icon">🚪</div>
            <div>
              <strong>Logout</strong>
              <p className="hint" style={{ margin: 0 }}>End your session</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
