# BiteHeist Dashboard Setup Guide

## Quick Start

### 1. Get Google Places API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable the Google Places API
4. Create an API key
5. Restrict the API key to your domain for security

### 2. Configure Environment Variables

**Frontend (.env):**
```bash
VITE_GOOGLE_PLACES_API_KEY=your_actual_api_key_here
```

**Backend (backend/.env):**
```bash
GOOGLE_PLACES_API_KEY=your_actual_api_key_here
```

### 3. Install Dependencies

**Frontend:**
```bash
npm install
```

**Backend:**
```bash
cd backend
npm install
```

### 4. Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

### 5. Access the Application
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## Features Working
- ✅ Live Google Places restaurant search
- ✅ Real restaurant data and details
- ✅ Competitor analysis
- ✅ SEO scoring algorithm
- ✅ PageSpeed simulation
- ✅ PDF export functionality
- ✅ Responsive design

## Troubleshooting
- Make sure both frontend and backend servers are running
- Check that your API key is correctly set in both .env files
- Ensure your API key has Places API enabled
- Check browser console for errors