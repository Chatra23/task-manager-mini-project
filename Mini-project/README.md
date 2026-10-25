# Task Manager Mini Project

A full-stack task manager using React + Vite, Node.js + Express, and an in-memory REST API.

## Features
- Add tasks
- View tasks
- Mark tasks complete/incomplete
- Delete tasks
- Filter all/active/completed tasks
- API health endpoint
- Environment-based frontend API URL and backend CORS origin
- Production build via Vite

## Requirements
Node.js 20+ recommended.

## Run locally

### Backend
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```
On Windows PowerShell, copy the environment template with:
```powershell
Copy-Item .env.example .env
```

### Frontend (new terminal)
```bash
cd frontend
npm install
Copy-Item .env.example .env
npm run dev
```
Open the URL printed by Vite, usually http://localhost:5173.

## Deployment
1. Push this repository to GitHub.
2. Deploy `backend` as a Render Web Service:
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment variable: `CLIENT_ORIGIN=https://YOUR-FRONTEND.vercel.app`
3. Deploy `frontend` on Vercel:
   - Root Directory: `frontend`
   - Framework preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Environment variable: `VITE_API_URL=https://YOUR-BACKEND.onrender.com`
4. Redeploy the backend after setting the real Vercel URL in `CLIENT_ORIGIN`, if needed.

## Important data note
This starter stores tasks in server memory, so tasks reset when the backend restarts or redeploys. For durable production storage, connect a database such as MongoDB Atlas or PostgreSQL.
