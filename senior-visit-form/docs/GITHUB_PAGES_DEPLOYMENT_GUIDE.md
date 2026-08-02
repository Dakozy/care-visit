# GitHub Pages Deployment Guide

## 1. Create a GitHub repository
1. Go to https://github.com/new
2. Name it, for example, `senior-care-visit-app`
3. Keep it Public (GitHub Pages free tier requires a public repo, unless you have GitHub Pro/Team/Enterprise)
4. Do not initialize with a README (we already have one)

## 2. Push the project
From inside the `senior-care-visit-app` folder:
```bash
git init
git add .
git commit -m "Initial commit: Senior Care Visit App"
git branch -M main
git remote add origin https://github.com/<your-username>/senior-care-visit-app.git
git push -u origin main
```

## 3. Set the correct base path
Open `vite.config.js` and confirm the `base` matches your repository name exactly:
```js
base: '/senior-care-visit-app/',
```
If your repository is named differently, change this value to `/<your-repo-name>/`.

Also update `homepage` in `package.json` to:
```
https://<your-username>.github.io/senior-care-visit-app
```

## 4. Install the GitHub Pages deploy tool
```bash
npm install --save-dev gh-pages
```
(This is already listed in `package.json` devDependencies — just run `npm install`.)

## 5. Build and deploy
```bash
npm run deploy
```
This runs `vite build` and pushes the `dist/` folder to a `gh-pages` branch.

## 6. Enable GitHub Pages
1. Go to your repository → **Settings** → **Pages**
2. Under "Build and deployment", set **Source** to `Deploy from a branch`
3. Set **Branch** to `gh-pages` / `root`
4. Save. Your app will be live at:
```
https://<your-username>.github.io/senior-care-visit-app/
```
It may take 1–2 minutes to go live after the first deploy.

## 7. Re-deploying after changes
Whenever you update the code:
```bash
git add .
git commit -m "Update"
git push
npm run deploy
```

## Troubleshooting
- **Blank white page / 404 on assets:** the `base` in `vite.config.js` doesn't match your repo name. Fix it and re-run `npm run deploy`.
- **Routing issues (page not found on refresh):** this project uses `HashRouter` (URLs like `#/dashboard`) specifically to avoid GitHub Pages 404s on refresh — no extra configuration needed.
- **Changes not appearing:** GitHub Pages can cache aggressively; hard-refresh (Ctrl/Cmd+Shift+R) or wait a few minutes.
