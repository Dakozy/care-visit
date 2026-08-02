# Local Testing Guide

## Prerequisites
- Node.js 18+ and npm installed

## 1. Install dependencies
```bash
npm install
```

## 2. Start the dev server
```bash
npm run dev
```
Open the URL shown (typically `http://localhost:5173`).

## 3. Test login
Use one of the sample accounts in `public/caregivers.json`:

| Caregiver ID | Password | Category |
|---|---|---|
| CG-001 | welcome123 | Medical |
| CG-002 | welcome123 | Medical |
| CG-003 | welcome123 | Non-Medical |
| CG-004 | welcome123 | Non-Medical |

Log in with a Medical account first to confirm the Medical Assessment step appears; log in with a Non-Medical account to confirm it's hidden.

## 4. Test offline behavior
1. Start filling out a Daily Visit Report.
2. Open browser DevTools → Network tab → set throttling to "Offline".
3. Continue filling the form — you should see the offline banner.
4. Wait 10+ seconds, then refresh the page and go back to the form (or use "Previous Draft" on the dashboard) to confirm your progress was restored.
5. Set the network back to "Online" and submit.

## 5. Test GPS capture
Your browser will prompt for location permission on the first step of the visit form — allow it to confirm latitude/longitude populate. If denied, the app should show "Unavailable" but let you continue.

## 6. Test image upload
Use the Photo Upload step to attach a photo from your device/webcam. Confirm a thumbnail appears and can be removed.

## 7. Test signature pad
On the last step, draw a signature with your mouse or finger (on a touch device) and confirm "Clear Signature" works.

## 8. Test submission
Before you have a live Apps Script URL, submission will fail with a network/Fetch error — this is expected. Once you've deployed the backend (see `APPS_SCRIPT_DEPLOYMENT_GUIDE.md`) and updated `WEB_APP_URL` in `src/services/googleSheets.js`, re-test:
1. Submit a full report.
2. Confirm a new row appears in your Google Sheet's "Visit Reports" tab.
3. Confirm the app navigates to the Success screen and the draft is cleared from the dashboard.

## 9. Build for production
```bash
npm run build
npm run preview
```
`preview` serves the production build locally so you can sanity-check it before deploying to GitHub Pages.
