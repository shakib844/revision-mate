# Revision Mate

A responsive spaced-repetition planner. Add a topic and the app schedules four checkpoints:

- Day 1: the day you studied the topic
- Day 3: two days after the study date
- Day 7: six days after the study date
- Day 21: twenty days after the study date

Mark sessions complete, track progress, search/filter topics, and view your schedule.

## Run locally

Install Node.js 20 or later, then:

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

## Deploy to GitHub Pages

1. Create a new **public** GitHub repository, for example `revision-mate`.
2. Extract this ZIP file on your computer.
3. Open the extracted folder in VS Code.
4. Open the terminal in that folder and run:

   ```bash
   npm install
   ```

5. Create your first local build to check it:

   ```bash
   npm run build
   ```

6. In the terminal, run these commands (replace YOUR-USERNAME and YOUR-REPO):

   ```bash
   git init
   git add .
   git commit -m "Initial Revision Mate app"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
   git push -u origin main
   ```

7. On GitHub, open your repository → **Settings** → **Pages**.
8. Under **Build and deployment**, set **Source** to **GitHub Actions**.
9. Open the **Actions** tab and wait for “Deploy to GitHub Pages” to finish with a green check.
10. Your website will be available at:

   `https://YOUR-USERNAME.github.io/YOUR-REPO/`

Every push to `main` will automatically rebuild and redeploy the site.

## Data and notifications

- Topics and completion status are stored in this browser's local storage. They stay on this device/browser and are not synced to another device.
- Use the bell button and allow notifications. The app can show a browser notification for due sessions when you open the site.
- This starter version does **not** guarantee background notifications when the browser is closed. Reliable closed-browser reminders require a push service, a service worker, and a backend or scheduled notification provider.
- Export/backup is not yet included. Clearing browser data can remove locally stored topics, so keep a separate record until cloud backup is added.

## Change the revision cycle

Edit `CYCLE` near the top of `src/main.jsx`. The current values are `[1, 3, 7, 21]`.
