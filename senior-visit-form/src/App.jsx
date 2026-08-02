import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './components/Login.jsx';
import Dashboard from './components/Dashboard.jsx';
import VisitForm from './pages/VisitForm.jsx';
import Success from './pages/Success.jsx';
import Instructions from './pages/Instructions.jsx';
import { getTheme } from './services/localStorage.js';

export default function App() {
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', getTheme());
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/visit" element={<VisitForm />} />
      <Route path="/success" element={<Success />} />
      <Route path="/instructions" element={<Instructions />} />
    </Routes>
  );
}
