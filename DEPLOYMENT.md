# Deployment Guide for BiteHeist Dashboard

## 🆓 FREE Deployment Options

### Option 1: Vercel (Completely Free - RECOMMENDED)

**Frontend:**
1. Go to https://vercel.com/
2. Sign up with GitHub
3. Click "Add New" → "Project"
4. Import your repository
5. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `./` (leave empty)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
6. Add Environment Variables:
   - `VITE_GOOGLE_PLACES_API_KEY` = `AIzaSyA3UsJjKOYzJZS9ARer6lzUPU_LOrAAABY`
   - `VITE_API_BASE_URL` = (will add after backend is deployed)
7. Click "Deploy"

**Backend:**
1. Create new project on Vercel
2. Import same repository again
3. Configure:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
4. Add Environment Variables:
   - `NODE_ENV` = `production`
   - `GOOGLE_PLACES_API_KEY` = `AIzaSyA3UsJjKOYzJZS9ARer6lzUPU_LOrAAABY`
   - `FRONTEND_URL` = (your frontend URL from step 1)
5. Deploy
6. Copy backend URL and update frontend's `VITE_API_BASE_URL`
7. Redeploy frontend

### Option 2: Netlify + Railway (Both Free)

**Frontend (Netlify - Free):**

1. **Go to Netlify:** https://app.netlify.com/
2. Click "Add new site" → "Import an existing project"
3. Connect to GitHub and select `Biteheist-dashboard`
4. Configure:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
5. Add environment variables in Netlify dashboard:
   - `VITE_GOOGLE_PLACES_API_KEY` = `AIzaSyA3UsJjKOYzJZS9ARer6lzUPU_LOrAAABY`
   - `VITE_API_BASE_URL` = (Your backend URL from Render - see below)
   - `VITE_ENABLE_MOCK_DATA` = `false`
6. Click "Deploy site"

### Backend (Render.com)

1. **Go to Render:** https://render.com/
2. Click "New" → "Web Service"
3. Connect to GitHub and select `Biteheist-dashboard`
4. Configure:
   - **Name:** `biteheist-backend`
   - **Root Directory:** `backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Add environment variables:
   - `NODE_ENV` = `production`
   - `PORT` = `3003`
   - `GOOGLE_PLACES_API_KEY` = `AIzaSyA3UsJjKOYzJZS9ARer6lzUPU_LOrAAABY`
   - `FRONTEND_URL` = (Your Netlify URL)
6. Click "Create Web Service"

### Alternative: Railway (Backend)

1. Go to https://railway.app/
2. Click "New Project" → "Deploy from GitHub repo"
3. Select `Biteheist-dashboard` repository
4. Select `backend` as root directory
5. Add environment variables (same as above)
6. Deploy!

### Alternative: Vercel (Both)

**Frontend:**
1. Go to https://vercel.com/
2. Import `Biteheist-dashboard` from GitHub
3. Configure root directory as `./`
4. Add environment variables
5. Deploy

**Backend:**
1. Create new project for backend
2. Set root directory to `backend`
3. Add environment variables
4. Deploy

## After Deployment

1. Copy your backend URL from Render/Railway
2. Update Netlify environment variable `VITE_API_BASE_URL` with the backend URL
3. Redeploy Netlify frontend
4. Update CORS in backend environment variables to include your Netlify URL
5. Test your app!

## URLs You'll Get

- **Frontend:** `https://your-site-name.netlify.app`
- **Backend:** `https://your-backend.onrender.com` or `https://your-backend.up.railway.app`

## Testing

Once deployed, visit your frontend URL and search for a restaurant like "Pizza Miami" to verify everything works!
