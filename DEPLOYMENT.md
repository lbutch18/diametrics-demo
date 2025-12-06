# Deployment Guide

## Frontend (Next.js) - Vercel

The frontend is automatically deployed to Vercel when you push to the main branch.

**Current URL:** https://diametrics-demo.vercel.app/

### Environment Variables (if needed)
Set in Vercel dashboard:
- `NEXT_PUBLIC_API_URL` - Your backend API URL (e.g., `https://your-backend.railway.app`)

---

## Backend (FastAPI) - Deployment Options

The backend needs to be deployed separately. Here are recommended options:

### Option 1: Railway (Recommended)
1. Go to [railway.app](https://railway.app)
2. Create a new project
3. Deploy from GitHub repository
4. Select the `src/app/Backend` directory as the root
5. Railway will automatically detect Python and install dependencies
6. Set the start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
7. Copy the generated URL (e.g., `https://your-app.railway.app`)

### Option 2: Render
1. Go to [render.com](https://render.com)
2. Create a new Web Service
3. Connect your GitHub repository
4. Set:
   - **Root Directory:** `src/app/Backend`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Copy the generated URL

### Option 3: Fly.io
1. Install Fly CLI: `curl -L https://fly.io/install.sh | sh`
2. In `src/app/Backend` directory, run: `fly launch`
3. Follow the prompts
4. Deploy: `fly deploy`

---

## After Backend Deployment

1. **Update Frontend Environment Variable:**
   - Go to Vercel dashboard → Your project → Settings → Environment Variables
   - Add `NEXT_PUBLIC_API_URL` with your backend URL
   - Redeploy the frontend

2. **Update Backend CORS:**
   - In `src/app/Backend/main.py`, ensure your frontend URL is in the `allow_origins` list
   - The production URL `https://diametrics-demo.vercel.app` is already included

---

## Files Included for Deployment

- `requirements.txt` - Python dependencies
- `main.py` - FastAPI application
- `rf_reg_100_diabetes_model.joblib` - Risk score model
- `rf_diabetes_model.joblib` - Diagnosis classification model

**Note:** Model files are large (43MB+). Make sure your deployment platform supports large files or use Git LFS.

