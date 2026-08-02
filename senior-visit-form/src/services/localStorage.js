// Centralized localStorage helper so keys are consistent across the app.

const KEYS = {
  AUTH: 'scv_auth',
  DRAFT: 'scv_draft',
  THEME: 'scv_theme',
  SUBMITTED_IDS: 'scv_submitted_ids',
};

export function saveAuth(auth) {
  localStorage.setItem(KEYS.AUTH, JSON.stringify(auth));
}

export function getAuth() {
  try {
    const raw = localStorage.getItem(KEYS.AUTH);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearAuth() {
  localStorage.removeItem(KEYS.AUTH);
}

export function saveDraft(draft) {
  localStorage.setItem(KEYS.DRAFT, JSON.stringify({ ...draft, savedAt: new Date().toISOString() }));
}

export function getDraft() {
  try {
    const raw = localStorage.getItem(KEYS.DRAFT);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearDraft() {
  localStorage.removeItem(KEYS.DRAFT);
}

export function getTheme() {
  return localStorage.getItem(KEYS.THEME) || 'light';
}

export function setTheme(theme) {
  localStorage.setItem(KEYS.THEME, theme);
}

// Prevents duplicate submissions if a network retry happens after a
// submission actually succeeded server-side.
export function markSubmitted(submissionId) {
  const list = JSON.parse(localStorage.getItem(KEYS.SUBMITTED_IDS) || '[]');
  list.push(submissionId);
  localStorage.setItem(KEYS.SUBMITTED_IDS, JSON.stringify(list.slice(-50)));
}

export function wasSubmitted(submissionId) {
  const list = JSON.parse(localStorage.getItem(KEYS.SUBMITTED_IDS) || '[]');
  return list.includes(submissionId);
}
