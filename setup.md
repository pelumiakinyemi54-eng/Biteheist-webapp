# BiteHeist Dashboard Setup Guide

## Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/pelumiakinyemi54-eng/Biteheist-webapp.git
cd Biteheist-webapp
```

### 2. Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update the following variables in `.env`:

#### Required Variables:
- **MONGODB_URI**: Your MongoDB Atlas connection string
  - Get from: https://cloud.mongodb.com
  - Format: `mongodb+srv://<username>:<password>@<cluster>.mongodb.net/biteheist`

- **GOOGLE_PLACES_API_KEY**: Your Google Places API key
  - Get from: https://console.cloud.google.com
  - Enable "Places API" in your project

- **VITE_GOOGLE_PLACES_API_KEY**: Same as above (for frontend)

#### Optional Variables:
- **SMTP_*** : Email service configuration (for reports)
- **VITE_GA_TRACKING_ID**: Google Analytics
- **VITE_HOTJAR_ID**: Hotjar analytics

### 3. MongoDB Atlas Setup

1. Go to https://cloud.mongodb.com and create a free account
2. Create a new cluster (M0 Free tier)
3. Create a database user:
   - Go to "Database Access"
   - Add new user with username and password
4. Whitelist your IP:
   - Go to "Network Access"
   - Click "Add IP Address"
   - Select "Allow Access from Anywhere" (0.0.0.0/0) for development
5. Get connection string:
   - Go to "Database" → Click "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<username>` and `<password>` with your credentials
   - Add `/biteheist` before the `?` parameter

### 4. Google Places API Setup

1. Go to https://console.cloud.google.com
2. Create a new project or select existing
3. Enable the "Places API" and "Places API (New)"
4. Create credentials (API Key)
5. (Optional) Restrict the API key to your domain for security

### 5. Install Dependencies

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

### 6. Access the Application
- Frontend: http://localhost:3002
- Backend API: http://localhost:3003
- Health Check: http://localhost:3003/health

## Features

- ✅ Live Google Places restaurant search
- ✅ Real restaurant data and details
- ✅ Competitor analysis
- ✅ SEO scoring algorithm with revenue impact
- ✅ Lead management system
- ✅ Phone gate modal for lead capture
- ✅ Online presence checker
- ✅ Analytics dashboard
- ✅ PDF export functionality
- ✅ MongoDB data persistence
- ✅ Responsive design

## Production Deployment

### Backend Deployment (Render/Railway/Heroku)
1. Create account on your preferred platform
2. Create new web service
3. Connect your GitHub repository
4. Set build command: `cd backend && npm install`
5. Set start command: `cd backend && npm start`
6. Add environment variables:
   - `MONGODB_URI`
   - `GOOGLE_PLACES_API_KEY`
   - `NODE_ENV=production`
   - `PORT` (usually auto-set)
7. Deploy and note your backend URL

### Frontend Deployment (Vercel/Netlify)
1. Create account on your preferred platform
2. Import your GitHub repository
3. Build settings:
   - Build command: `npm run build`
   - Output directory: `dist`
4. Add environment variables:
   - `VITE_API_BASE_URL` - Your backend URL from above
   - `VITE_GOOGLE_PLACES_API_KEY`
5. Deploy

### MongoDB Production Setup
1. In MongoDB Atlas, update Network Access:
   - Add your production server IPs
   - Or keep 0.0.0.0/0 (less secure but works everywhere)
2. Ensure your production environment has the correct `MONGODB_URI`

## Troubleshooting

### MongoDB Connection Issues
- ✅ Verify your IP is whitelisted in MongoDB Atlas
- ✅ Check username and password in connection string
- ✅ Ensure database name is included in URI: `/biteheist`
- ✅ Test connection with health endpoint: `/health`

### API Issues
- ✅ Ensure both frontend and backend servers are running
- ✅ Check that API key is correctly set in `.env`
- ✅ Verify API key has Places API enabled in Google Cloud
- ✅ Check browser console for CORS errors
- ✅ Verify `VITE_API_BASE_URL` points to correct backend

### General Issues
- ✅ Clear browser cache and restart servers
- ✅ Check all environment variables are set correctly
- ✅ Look for errors in terminal output
- ✅ Use health check endpoint to verify backend status

## Support

For issues or questions:
- GitHub Issues: https://github.com/pelumiakinyemi54-eng/Biteheist-webapp/issues
- Check logs in both frontend and backend terminals

## License

MIT