# BellaShop

Simple e-commerce demo (frontend + backend). This repo contains a Vite React frontend and an Express backend.

## Quick start (Codespaces)

- Open the repository in GitHub and click **Code → Codespaces → Create codespace**. The included `.devcontainer` config installs Node and runs `npm install` for frontend and backend.
- Forwarded ports: `5000` (backend) and `5173` (frontend).

## Local development

Frontend
```bash
cd frontend
npm install
npm run dev
```

Backend
```powershell
cd backend
npm install
$env:DATABASE_URL = '<your-db-url>'
npm start
```

## Push existing repo to GitHub (example)
```bash
git remote add origin https://github.com/hkeir780-beep/BellaShop.git
git branch -M main
git push -u origin main
```

## Add collaborators
Use the GitHub web UI (Settings → Collaborators & teams) or the `gh` CLI:

```bash
gh repo add-collaborator hkeir780-beep/BellaShop --user USERNAME
gh repo add-collaborator hkeir780-beep/BellaShop --email user@example.com
```

## Deployment (recommended)
- Backend: Render (set `DATABASE_URL` env var)
- Frontend: Vercel (point to `frontend` folder)

## Files added
- `.devcontainer/` — Codespaces/devcontainer configuration
- `README.md` — this file
- `LICENSE` — MIT license
- `.gitignore` — ignores node_modules, build artifacts, secrets

If you want, I can push these changes to your GitHub remote and create a Codespace for you. Tell me whether to push now.
