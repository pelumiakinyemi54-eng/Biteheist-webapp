# Quick Start Guide - Get Real Data in 5 Minutes

## You Only Need ONE API Key! 🎉

The same Google API key works for **both** Places API and PageSpeed Insights API.

---

## Step 1: Get Your Google API Key (2 minutes)

1. **Go to Google Cloud Console**: https://console.cloud.google.com/

2. **Create a new project** (or select existing one)
   - Click project dropdown at top
   - Click "New Project"
   - Name it "BiteHeist" → Click "Create"

3. **Enable Places API (New)**
   - Go to "APIs & Services" → "Library"
   - Search for "Places API (New)"
   - Click it → Click "Enable"

4. **Enable PageSpeed Insights API**
   - In the same "Library" page
   - Search for "PageSpeed Insights API"
   - Click it → Click "Enable"

5. **Create API Key**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "API Key"
   - **Copy the key** (looks like: `AIzaSyXXXXXXXXXXXXXXXXXXXX`)

---

## Step 2: Add API Key to Your Project (1 minute)

### Backend Configuration

1. Open `backend/.env` file

2. Replace the placeholder with your real key:
   ```env
   GOOGLE_PLACES_API_KEY=AIzaSyYourActualKeyHere
   ```

### Frontend Configuration

1. Open `.env` file (in project root)

2. Replace the placeholder:
   ```env
   VITE_GOOGLE_PLACES_API_KEY=AIzaSyYourActualKeyHere
   VITE_ENABLE_MOCK_DATA=false
   ```

---

## Step 3: Start the Application (2 minutes)

### Start Backend
```bash
cd backend
npm install
npm start
```

Should show:
```
🚀 BiteHeist Restaurant SEO Audit API
📡 Server running on port 3003
🔑 Google Places API: Configured ✅
```

### Start Frontend (in new terminal)
```bash
npm install
npm run dev
```

Should show:
```
VITE v5.x.x ready in Xms
➜ Local: http://localhost:5173/
```

---

## Step 4: Test with Real Data

1. **Open your browser**: http://localhost:5173/

2. **Search for a restaurant**: Try "pizza miami" or "taco near me"

3. **Click "Run Audit"** on any restaurant

4. **See Real Data:**
   - ✅ Real PageSpeed score from Google
   - ✅ Real review response times
   - ✅ Real competitor analysis
   - ✅ Real Core Web Vitals metrics

---

## That's It! 🎉

You now have:
- ✅ Real restaurant data from Google Places
- ✅ Real website performance metrics from PageSpeed Insights
- ✅ Real review response time analysis
- ✅ No more dummy/mock data

---

## Troubleshooting

### "API key not valid"
- Make sure you enabled **both** APIs:
  - Places API (New) ✅
  - PageSpeed Insights API ✅
- Copy the key exactly (no spaces)

### "Request failed"
- Check backend is running on port 3003
- Check API key is in both `.env` files
- Look at backend console for error messages

### Still having issues?
- See detailed guide: `API_SETUP_GUIDE.md`
- Check backend logs for specific errors
- Verify MongoDB is running (optional, but recommended)

---

## What's Using Real Data Now?

| Feature | Data Source | Status |
|---------|-------------|--------|
| Restaurant Search | Google Places API | ✅ Real |
| Restaurant Details | Google Places API | ✅ Real |
| Reviews | Google Places API | ✅ Real |
| Response Time | Calculated from real reviews | ✅ Real |
| PageSpeed Score | Google PageSpeed Insights | ✅ Real |
| Core Web Vitals | Google PageSpeed Insights | ✅ Real |
| Competitors | Google Places Nearby Search | ✅ Real |
| Revenue Estimates | Calculated from real metrics | ✅ Real |

---

## Free Tier Limits

**Google Places API:**
- $200 free credit/month
- ~6,250 free requests/month
- After that: ~$0.032 per request

**PageSpeed Insights API:**
- 25,000 requests/day
- **Completely FREE** (no charges)

**Tips to stay within free tier:**
- Enable MongoDB caching (24-hour cache)
- Only run audits when needed
- Cache PageSpeed results

---

## Next Steps

- [ ] Add more restaurants to your database
- [ ] Set up MongoDB for caching (recommended)
- [ ] Configure billing alerts in Google Cloud
- [ ] Explore the analytics features
- [ ] Customize the audit parameters

Happy auditing! 🚀
