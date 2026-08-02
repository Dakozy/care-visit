# Daily Senior Beneficiary Visit Report

A mobile-first field data collection app for caregivers conducting daily home
visits to senior citizens. Built for the O.B. Lulu-Briggs Foundation and
similar NGO / community health programmes.

Submissions are written directly into a Google Sheet — no server, database,
or hosting cost beyond GitHub Pages (free) and Google Workspace (already in
use).

## How it works

```
Caregiver's phone (GitHub Pages form)
        │  fills form, form autosaves draft locally
        ▼
   fetch() POST (JSON)
        │
        ▼
Google Apps Script Web App  ──▶  Google Sheet ("Visits" tab)
        │
        └──▶ Google Drive folder (signatures & photos, linked from the sheet)
```

## Folder structure

```
senior-visit-form/
├── index.html              Main form (all 19 sections)
├── manifest.json           PWA manifest
├── sw.js                   Service worker (offline app shell)
├── css/
│   └── styles.css          All styling, light + dark mode
├── js/
│   └── app.js              Form logic, validation, GPS, signatures, submit
├── apps-script/
│   └── Code.gs             Backend: writes submissions to Google Sheets
└── docs/
    ├── DEPLOYMENT.md        Deploy the form on GitHub Pages
    ├── SHEETS_SETUP.md      Set up the Sheet + Apps Script backend
    ├── USER_GUIDE.md        For caregivers using the form
    └── ADMIN_GUIDE.md       For whoever maintains the sheet/system
```

## Quick start

1. Read **docs/SHEETS_SETUP.md** first — you need the Apps Script Web App
   URL before the form can submit anywhere.
2. Paste that URL into `js/app.js` (`APPS_SCRIPT_URL`).
3. Read **docs/DEPLOYMENT.md** to publish the form on GitHub Pages.
4. Share the live link with caregivers. See **docs/USER_GUIDE.md**.

## Design notes

- Built with plain HTML5 / CSS3 / vanilla JavaScript — no build step, no
  frameworks, so any future maintainer can edit it with just a text editor.
- Uses `<details>/<summary>` for collapsible sections — accessible and
  keyboard-operable without custom JS.
- Signatures and photos are compressed client-side and stored in Drive
  (not as raw base64 in the sheet) to keep the spreadsheet usable.
- Section toggles (medication table, referral fields, risk warning) are
  built to be easy to hide entirely later if a lighter version is needed —
  see the "Future enhancements" section in `docs/ADMIN_GUIDE.md`.
