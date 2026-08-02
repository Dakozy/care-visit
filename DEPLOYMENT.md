# Deploying to GitHub Pages

> Complete `SHEETS_SETUP.md` first and paste your Apps Script URL into
> `js/app.js` before deploying — otherwise the live form can't submit
> anywhere yet.

## 1. Create a repository

1. Go to [github.com](https://github.com) and sign in (or create a free
   account).
2. Click **+ → New repository**.
3. Name it, e.g. `senior-visit-form`.
4. Set it to **Public** (required for free GitHub Pages).
5. Click **Create repository**.

## 2. Upload the project files

Upload the **entire folder structure**, keeping it intact:

```
index.html
manifest.json
sw.js
css/styles.css
js/app.js
```

You can skip uploading `apps-script/` and `docs/` to the live site if you'd
rather keep those private — they're for your own reference and aren't
needed for the form to run. If you do upload them, they're just inert files
sitting in the repo; they won't affect the form.

**Easiest method (no Git required):**
- On the repo page, click **Add file → Upload files**.
- Drag in `index.html`, `manifest.json`, `sw.js` at the root.
- Repeat for the `css` and `js` folders — GitHub preserves folder structure
  when you drag a folder in, or you can create the folders manually by
  naming a file `css/styles.css` during upload.
- Click **Commit changes**.

## 3. Enable GitHub Pages

1. Go to the repo's **Settings** tab.
2. In the left sidebar, click **Pages**.
3. Under **Build and deployment → Source**, choose **Deploy from a branch**.
4. **Branch**: `main`, folder: `/ (root)` → **Save**.
5. Wait 1–2 minutes. GitHub will show your live URL, e.g.:
   ```
   https://<your-username>.github.io/senior-visit-form/
   ```

Because this project's homepage is `index.html` (not `README.md`), it will
load directly at that root URL — no extra filename needed.

## 4. Test it

1. Open the live URL on a phone.
2. Fill out a test entry, submit it.
3. Check your Google Sheet's `Visits` tab — a new row should appear within
   a few seconds.
4. Delete the test row from the sheet when you're done.

## 5. Updating the form later

Any time you edit `index.html`, `styles.css`, or `app.js`:
1. Go to the file in the GitHub repo.
2. Click the pencil (edit) icon, or delete and re-upload.
3. Commit the change — GitHub Pages redeploys automatically within a
   minute or two.

## Installing it like an app (PWA)

Because this project includes a `manifest.json` and `sw.js`, caregivers can
add it to their home screen for a more app-like experience:

- **Android (Chrome)**: open the live link → menu (⋮) → **Add to Home
  screen**.
- **iOS (Safari)**: open the live link → Share icon → **Add to Home
  Screen**.

This gives a full-screen icon and lets the form shell (not new
submissions) load without a connection.
