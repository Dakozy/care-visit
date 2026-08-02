// ============================================================================
// IMPORTANT: Replace WEB_APP_URL below with your deployed Google Apps Script
// Web App URL. See docs/APPS_SCRIPT_DEPLOYMENT_GUIDE.md for instructions.
// ============================================================================
export const WEB_APP_URL = 'https://script.google.com/macros/s/REPLACE_WITH_YOUR_DEPLOYMENT_ID/exec';

function detectBrowser() {
  const ua = navigator.userAgent;
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Safari')) return 'Safari';
  if (ua.includes('Edge')) return 'Edge';
  return 'Unknown';
}

function detectOS() {
  const ua = navigator.userAgent;
  if (ua.includes('Android')) return 'Android';
  if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
  if (ua.includes('Windows')) return 'Windows';
  if (ua.includes('Mac')) return 'macOS';
  return 'Unknown';
}

export function generateSubmissionId() {
  return `SUB-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

/**
 * Submits the visit report payload to the Apps Script backend.
 * Apps Script Web Apps do not support custom request headers with simple
 * fetch + no-cors reliably, so we send a standard POST with a text/plain
 * body containing JSON — this avoids CORS preflight issues with Apps Script.
 */
export async function submitVisitReport(payload) {
  const enriched = {
    ...payload,
    submissionId: payload.submissionId || generateSubmissionId(),
    timestamp: new Date().toISOString(),
    browser: detectBrowser(),
    operatingSystem: detectOS(),
  };

  if (!navigator.onLine) {
    return { ok: false, offline: true, submissionId: enriched.submissionId, payload: enriched };
  }

  try {
    const response = await fetch(WEB_APP_URL, {
      method: 'POST',
      body: JSON.stringify(enriched),
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    });

    if (!response.ok) {
      throw new Error(`Server responded with status ${response.status}`);
    }

    const data = await response.json();
    if (data.status !== 'success') {
      throw new Error(data.message || 'Validation error from server.');
    }

    return { ok: true, submissionId: enriched.submissionId, data };
  } catch (err) {
    return { ok: false, offline: false, error: err.message, submissionId: enriched.submissionId, payload: enriched };
  }
}
