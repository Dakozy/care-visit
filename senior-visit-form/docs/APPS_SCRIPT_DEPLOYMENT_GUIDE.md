# Google Apps Script Backend Deployment Guide

This turns a Google Sheet into a free API endpoint that receives visit report submissions.

## 1. Create the Google Sheet
1. Go to https://sheets.google.com and create a new blank spreadsheet.
2. Name it, for example, "Senior Care Visit Reports".

## 2. Open the Apps Script editor
1. In the Sheet, go to **Extensions → Apps Script**.
2. Delete any starter code in `Code.gs`.
3. Copy the entire contents of `google-apps-script/Code.gs` from this project and paste it in.
4. Click the **Save** icon (or Ctrl/Cmd+S).

## 3. Run the setup function once
1. In the Apps Script toolbar, use the function dropdown (next to the "Run" ▶ button) and select **setupSheet**.
2. Click **Run**.
3. The first time, Google will ask you to authorize the script:
   - Click **Review permissions**
   - Choose your Google account
   - You may see an "unverified app" warning — click **Advanced** → **Go to (project name) (unsafe)** → **Allow**. This is expected for personal/organizational scripts you wrote yourself.
4. Check your spreadsheet — a "Visit Reports" tab should now appear with bold, blue headers.

## 4. Deploy as a Web App
1. In the Apps Script editor, click **Deploy → New deployment**.
2. Click the gear icon next to "Select type" and choose **Web app**.
3. Fill in:
   - **Description:** Senior Care Visit API v1
   - **Execute as:** Me (your account)
   - **Who has access:** Anyone
4. Click **Deploy**.
5. Authorize again if prompted.
6. Copy the **Web app URL** shown — it looks like:
   ```
   https://script.google.com/macros/s/AKfycb.../exec
   ```

## 5. Connect the frontend
1. Open `src/services/googleSheets.js` in the React project.
2. Replace the placeholder:
   ```js
   export const WEB_APP_URL = 'https://script.google.com/macros/s/REPLACE_WITH_YOUR_DEPLOYMENT_ID/exec';
   ```
   with the URL you copied.
3. Rebuild / redeploy the frontend (see `GITHUB_PAGES_DEPLOYMENT_GUIDE.md`).

## 6. Updating the script later
If you edit `Code.gs` again after your first deployment:
1. Click **Deploy → Manage deployments**.
2. Click the pencil/edit icon on your existing deployment.
3. Under "Version", choose **New version**.
4. Click **Deploy**.

This keeps the same Web App URL, so you don't need to update the frontend again.

## 7. (Optional) Store photos in Google Drive instead of counts
By default, the sheet only records how many photos were attached per section (to stay within Google Sheets' 50,000-character cell limit).

To store actual photo files:
1. Create a Google Drive folder for photo uploads.
2. Copy its folder ID from the URL (`https://drive.google.com/drive/folders/<FOLDER_ID>`).
3. In `Code.gs`, set `DRIVE_FOLDER_ID` to that ID.
4. In the `doPost` function, replace the `imageCellValue(...)` calls with `saveImageToDrive(data.photosSenior[0], 'senior')` (repeat per photo/section as needed, looping over arrays for multiple photos).
5. Redeploy a new version as described in step 6.

## Testing the endpoint directly
You can sanity-check the deployment by opening the Web App URL in a browser — it should return:
```json
{"status":"ok","message":"Senior Care Visit API is running."}
```
