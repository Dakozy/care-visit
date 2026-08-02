# Setting up Google Sheets + Apps Script

Do this before deploying the form — the form needs the Web App URL from
Step 4 to be able to submit anywhere.

## 1. Create the spreadsheet

1. Go to [sheets.google.com](https://sheets.google.com) → **Blank spreadsheet**.
2. Rename it something like `Senior Visit Reports — Master Sheet`.
3. You don't need to create any tabs or headers manually — the script
   creates a `Visits` tab with headers automatically on first submission.

## 2. Add the Apps Script

1. In the sheet, go to **Extensions → Apps Script**.
2. Delete the placeholder `Code.gs` content.
3. Copy the entire contents of `apps-script/Code.gs` from this project and
   paste it in.
4. Click the **Save** icon (or Ctrl/Cmd+S).

## 3. Test it (optional but recommended)

1. In the Apps Script editor, select the `doGet` function from the function
   dropdown near the "Run" button.
2. Click **Run**. The first time, Google will ask you to authorize the
   script — click through **Review permissions → (your account) → Advanced
   → Go to (project name) → Allow**. This is expected; it's just Google's
   standard warning for scripts you write yourself.

## 4. Deploy as a Web App

1. Click **Deploy → New deployment**.
2. Click the gear icon next to "Select type" → choose **Web app**.
3. Fill in:
   - **Description**: `Visit report intake` (or anything)
   - **Execute as**: **Me** (your account)
   - **Who has access**: **Anyone**
     *(This does not expose your sheet — it only allows the form to send
     data in. No one can read the sheet without you sharing it separately.)*
4. Click **Deploy**.
5. Copy the **Web app URL** shown (looks like
   `https://script.google.com/macros/s/AKfycb.../exec`).

## 5. Connect the form

1. Open `js/app.js` in this project.
2. Find this line near the top:
   ```js
   const APPS_SCRIPT_URL = "PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE";
   ```
3. Replace the placeholder with the URL you copied.
4. Save, then re-deploy/re-upload to GitHub Pages (see `DEPLOYMENT.md`).

## 6. Re-deploying after future script edits

Any time you edit `Code.gs`, you must create a **new deployment** (or a new
version of the existing one) for changes to take effect:

1. **Deploy → Manage deployments**.
2. Click the pencil/edit icon on the active deployment.
3. Under **Version**, choose **New version** → **Deploy**.

The Web App URL stays the same, so you don't need to update `app.js` again
unless you create a brand-new deployment instead of a new version.

## What gets created automatically

- A **`Visits`** tab in your spreadsheet, with one row per submission and
  one column per form field (headers are added automatically).
- A Google Drive folder named **`Senior Visit Report Photos`**, containing
  signatures and any uploaded photos. The sheet stores a link to each file
  rather than the image itself.

## Notes on the CORS workaround

Google Apps Script Web Apps don't return the headers browsers need to read
a `fetch()` response from a different origin (like your GitHub Pages site).
The form works around this by sending the request in `no-cors` mode — the
data still arrives and is written to the sheet, but the browser can't
confirm success by reading a response. The form shows a success message
optimistically after the request is sent without a network error. If you
want guaranteed delivery confirmation, check the "Future enhancements"
section in `ADMIN_GUIDE.md` for alternatives.
