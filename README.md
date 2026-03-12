# Eternal Arena

Static browser game with Firebase Realtime Database leaderboard.

## Netlify deployment

This repo is configured for Netlify with a build step that creates `dist/firebase-config.js` from environment variables.

### 1. Connect the repository

Create a new site in Netlify and connect this GitHub repository.

Netlify will auto-detect the settings from `netlify.toml`:

- Build command: `npm run build`
- Publish directory: `dist`

### 2. Add Firebase environment variables

In Netlify, open **Site configuration -> Environment variables** and add these keys:

- `FIREBASE_API_KEY`
- `FIREBASE_AUTH_DOMAIN`
- `FIREBASE_DATABASE_URL`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_STORAGE_BUCKET`
- `FIREBASE_MESSAGING_SENDER_ID`
- `FIREBASE_APP_ID`

`VITE_FIREBASE_*` keys are also supported for local compatibility, but `FIREBASE_*` is the recommended Netlify setup.

If your Realtime Database uses a regional hostname such as `europe-west1.firebasedatabase.app`, set `FIREBASE_DATABASE_URL` explicitly in Netlify. If it is omitted, the build falls back to `https://<project-id>-default-rtdb.firebaseio.com`.

### 3. Deploy

Trigger a deploy from Netlify. During the build, the Firebase config is generated into the published output and the browser app uses that generated file.

Netlify settings expected by this repo:

- Build command: `npm run build`
- Publish directory: `dist`
- Node version: `20`

If you already created the Netlify site before this repo had `netlify.toml`, check **Site configuration -> Build & deploy** and make sure there is no UI override still publishing the repository root. The symptom of a bad override is exactly what you saw: requests going to placeholder hosts like `firebase_project_id-default-rtdb...`.

## Local build

You can keep a local `.env`, `.env.local`, `.env.production`, or `.env.production.local` file with either `FIREBASE_*` or `VITE_FIREBASE_*` variables. Start from `.env.example` and run:

```bash
npm run build
```

The production-ready site will be written to `dist/`.