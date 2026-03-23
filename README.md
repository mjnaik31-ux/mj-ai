# MJ AI - Your Personal AI Assistant

Built with React + Vite (frontend) and Python FastAPI (backend).
100% free tools.

---

## Project Structure

```
mj-ai/
  frontend/   -> React + Vite app (deploy to GitHub Pages)
  backend/    -> Python FastAPI server (deploy to Railway)
```

---

## Local Development

### 1. Backend Setup
```bash
cd backend
pip install -r requirements.txt
```
Create a `.env` file:
```
GEMINI_API_KEY=your_gemini_key_here
```
Run backend:
```bash
uvicorn main:app --reload
```
Backend runs at: http://localhost:8000

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at: http://localhost:5173

---

## Deploy Backend to Railway (Free)

1. Go to https://railway.app and sign up free
2. Click "New Project" -> "Deploy from GitHub repo"
3. Select your repo, set root directory to `backend`
4. Add environment variable: `GEMINI_API_KEY=your_key`
5. Deploy - get your URL like: https://mj-ai-backend.railway.app

---

## Deploy Frontend to GitHub Pages (Free)

1. Update `frontend/.env`:
```
VITE_BACKEND_URL=https://your-backend.railway.app
```
2. Build:
```bash
cd frontend
npm run build
```
3. Push `dist/` folder contents to your GitHub Pages repo

---

## Get Free Gemini API Key
1. Go to https://aistudio.google.com
2. Click "Get API Key" -> "Create API Key"
3. Copy and add to backend `.env`
