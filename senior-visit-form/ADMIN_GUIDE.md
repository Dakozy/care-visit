# Administrator Guide

## System overview

- **Front end**: static HTML/CSS/JS hosted free on GitHub Pages.
- **Backend**: a Google Apps Script Web App bound to a Google Sheet.
- **Storage**: one row per visit in the `Visits` tab; photos and
  signatures are stored as files in a Google Drive folder, linked from the
  sheet (not embedded — this keeps the sheet fast and exportable).
- **No database, no server cost, no login system** — access to the *form*
  is open to anyone with the link (by design, so field staff don't need
  accounts); access to the *data* is controlled entirely by who you share
  the Google Sheet and Drive folder with.

## Where the data lives

- Spreadsheet: wherever you created it in Google Sheets (see
  `SHEETS_SETUP.md`). Only people you explicitly share it with can view it.
- Photos/signatures: in the Drive folder `Senior Visit Report Photos`,
  auto-created by the script. Same sharing rules apply — the folder itself
  isn't public, only the individual file links generated for each upload
  are set to "anyone with the link can view," so they display correctly
  when referenced from the sheet.

## Managing access

- **Add a caregiver**: just share the GitHub Pages link — no account
  needed on their end.
- **Give someone sheet access**: share the Google Sheet normally
  (Share button, their email, Viewer or Editor).
- **Revoke form access entirely**: there's no way to "lock" the form itself
  since it's a public static page, but you can rename/delete the GitHub
  repo or the Pages deployment to take it offline, or change the Apps
  Script deployment access if you want to stop new submissions from being
  accepted while keeping the page up.

## Exporting / reporting

Because every submission is a row in a normal Google Sheet:
- Use **File → Download** in Sheets to export to Excel/CSV.
- Build pivot tables or charts directly in the sheet, or connect it to
  Looker Studio for a live dashboard (similar in spirit to the earlier
  Elele Medical Mission report, but auto-updating).
- The `Medications (JSON)` and `Items Distributed (JSON)` columns hold
  structured data for each visit — if you need those broken into their own
  rows/columns for analysis, that's a good candidate for a small Apps
  Script or spreadsheet formula to "explode" later.

## Data quality / validation notes

- Required fields are enforced in the browser (Sections A, B, Q at
  minimum) but a determined user could still bypass client-side JS. If
  this becomes a concern, add matching validation inside `Code.gs`
  (`doPost`) to reject incomplete payloads server-side too.
- Duplicate prevention works by checking the `submissionId` generated when
  the form loads. If someone clears their browser storage and resubmits
  the exact same visit, it would go through as a new row — this is a
  reasonable tradeoff for a public, no-login form.

## Known limitations (by design, for a GitHub Pages + Apps Script setup)

- **No delivery confirmation**: due to how Apps Script Web Apps handle
  CORS, the form can't 100% confirm the sheet received the row — it shows
  success once the request sends without a network error. In practice this
  is reliable, but see "Future enhancements" below for a stronger option.
- **No offline submission queue**: the form saves drafts offline, but
  actual submission needs connectivity. It does not auto-retry in the
  background once reconnected.
- **No built-in authentication**: anyone with the form link can submit.
  Fine for trusted field teams; not suitable if you need to restrict who
  can submit.

## Future enhancement recommendations

Roughly in order of likely value:

1. **Server-side validation** in `Code.gs` to reject malformed/incomplete
   submissions, not just rely on the browser.
2. **A JSONP-style or Google Apps Script `doGet` confirmation ping** so the
   form can verify the row was actually written, instead of assuming
   success from a `no-cors` request.
3. **A searchable beneficiary list**: pre-populate a dropdown in Section B
   from an existing beneficiary roster (kept in a second sheet tab), so
   caregivers pick a beneficiary instead of retyping details each visit.
4. **Background sync / submission queue** using the Background Sync API
   (where supported) so offline submissions send automatically once back
   online, instead of requiring the caregiver to reopen and resubmit.
5. **Simple authentication** (e.g. a shared PIN per caregiver, checked in
   `Code.gs`) if open submission access becomes a concern.
6. **Migrating to Firebase or Supabase** if the programme grows beyond
   what Sheets comfortably handles (thousands of rows, need for
   multi-user editing, real-time dashboards, etc.) — the current form's
   front end would need only the submit function rewritten, not a full
   redesign.
7. **A companion admin dashboard** (a second static page) that reads from
   the sheet via the Sheets API to show recent visits, flagged risk cases,
   and referral follow-ups needing attention — similar in style to the
   Elele dashboard report already built for this foundation.
