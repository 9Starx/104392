# AGENTS.md

## Cursor Cloud specific instructions

### Project Overview

This is a static website project for a Taiwanese International Procurement & Payment Agency Platform (國際採購服務平台). There is **no build step** — the frontend is pure HTML/CSS/JS served as-is. The only server-side component is Firebase Cloud Functions in `functions/`.

### Running the Application

- **Static site**: `npx serve -l 3000 .` from the workspace root (requires Node.js 20+). Both `index.html` (customer storefront) and `admin.html` (admin backend) are served.
- **Firebase Functions**: located in `functions/`. Dependencies managed via `npm install` inside that directory.

### Linting

- ESLint config file is **not committed** to the repo. Run lint on `functions/` with:
  ```
  cd functions && npx eslint --no-eslintrc --env es2020,node --parser-options=ecmaVersion:2020 index.js
  ```

### Key Caveats

- The `functions/` directory is listed in `.gitignore` but its contents are tracked in git (force-added). Be careful not to accidentally untrack these files.
- Firebase config files (`firebase.json`, `firestore.rules`, `storage.rules`, `firestore.indexes.json`) are **gitignored and not present** in the repo. They must be created separately for Firebase deployments.
- The Firebase backend (Firestore, Storage) is a cloud service (`cny-90e4e` project). The static frontend connects to it via hardcoded API keys in the HTML files. Full end-to-end testing of data operations requires Firebase connectivity.
- Node.js 20 is required by `functions/package.json` engine constraint.
