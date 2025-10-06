# API Setup Guide

This guide will help you set up the required API keys for BiteHeist to work with real data.

## Required APIs

### 1. Google Places API (New Places API v1) - REQUIRED
**Used for:** Restaurant search, details, reviews, and competitor analysis

#### How to Get the API Key:

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/

2. **Create or Select a Project**
   - Click on the project dropdown at the top
   - Click "New Project" or select an existing one

3. **Enable the Places API (New)**
   - Go to "APIs & Services" → "Library"
   - Search for "Places API (New)"
   - Click on it and press "Enable"

4. **Create API Credentials**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "API Key"
   - Copy the generated API key

5. **Restrict the API Key (Recommended)**
   - Click on the API key you just created
   - Under "API restrictions", select "Restrict key"
   - Select "Places API (New)" from the dropdown
   - Click "Save"

6. **Add to Environment Variables**
   ```bash
   # In backend/.env
   GOOGLE_PLACES_API_KEY=your_actual_api_key_here

   # In .env (root)
   VITE_GOOGLE_PLACES_API_KEY=your_actual_api_key_here
   ```

---

### 2. Google PageSpeed Insights API - REQUIRED
**Used for:** Website performance analysis, Core Web Vitals, load time metrics

#### How to Get the API Key:

**Good News:** You use the **same API key** as Google Places API! No separate key needed.

1. **Enable PageSpeed Insights API**
   - In Google Cloud Console, go to "APIs & Services" → "Library"
   - Search for "PageSpeed Insights API"
   - Click on it and press "Enable"

2. **That's it!**
   - The same API key from Places API will work automatically
   - No need to configure anything else

---

## Setting Up Environment Variables

### Backend Setup (backend/.env)

1. Copy the example file:
   ```bash
   cd backend
   cp .env.example .env
   ```

2. Edit `backend/.env` and add your API key:
   ```env
   # Google Places API (New Places API v1) - REQUIRED
   # This same key is used for both Places API and PageSpeed Insights API
   GOOGLE_PLACES_API_KEY=AIzaSyYourActualApiKeyHere123456789
   ```

### Frontend Setup (.env in root)

1. Edit `.env` in the project root:
   ```env
   # Frontend (Vite)
   VITE_GOOGLE_PLACES_API_KEY=AIzaSyYourActualApiKeyHere123456789
   VITE_ENABLE_MOCK_DATA=false
   ```

---

## Understanding the Real Data Implementation

### 1. **PageSpeed Score (Real-time Analysis)**

The system now uses **Google PageSpeed Insights API** to analyze restaurant websites:

- **Real Metrics:**
  - First Contentful Paint (FCP)
  - Largest Contentful Paint (LCP)
  - Cumulative Layout Shift (CLS)
  - Total Blocking Time (TBT)
  - Speed Index
  - Time to Interactive (TTI)

- **Performance Score:** 0-100 based on actual website performance
- **Load Time:** Real load time in seconds

**Location:** `backend/services/pageSpeedService.js`

### 2. **Review Response Time (Real Analysis)**

The system analyzes **actual owner responses** from Google Places reviews:

- **Real Metrics:**
  - Response Rate: % of reviews that have owner responses
  - Average Response Time: Calculated from review & response timestamps
  - Response Breakdown: Fast (<24h), Medium (24-72h), Slow (>72h)

- **Score Calculation:**
  - Response rate impact (0-50% penalty)
  - Response speed impact (0-50% penalty)
  - Final score: 0-100

**Location:** `backend/services/reviewAnalyzer.js`

### 3. **What Data is Real vs Estimated**

✅ **Real Data:**
- Restaurant details (name, address, phone, website)
- Ratings and review counts
- Customer reviews and owner responses
- Review response times (if owner responds)
- Website performance metrics (via PageSpeed API)
- Competitor data
- Photos and business hours

⚠️ **Estimated Data (when API fails or no data available):**
- PageSpeed score if website can't be analyzed (defaults to average ~65)
- Response time if no owner responses exist (score = 0)
- Monthly visitors (estimated from ratings/reviews)

---

## Testing the Integration

### 1. Test Backend API
```bash
cd backend
npm install
npm start
```

Visit: http://localhost:3003/health

Should show:
```json
{
  "success": true,
  "services": {
    "googlePlaces": "Available"
  }
}
```

### 2. Test Restaurant Search
```bash
curl "http://localhost:3003/api/restaurants/search?query=pizza&limit=5"
```

### 3. Test PageSpeed Integration
The PageSpeed analysis runs automatically during audits. Check the console logs for:
```
PageSpeed analysis complete: 75 score, 3.2s load time
```

### 4. Test Review Response Analysis
Run an audit on a restaurant with owner responses:
```bash
curl -X POST "http://localhost:3003/api/restaurants/{placeId}/audit"
```

Check for:
```
Review analysis: 50 reviews, 30 responses (60%), avg 36h
```

---

## API Quotas and Pricing

### Google Places API (New)
- **Free Tier:** $200 credit/month
- **Cost:** ~$0.032 per request
- **Quota:** ~6,250 free requests/month

### PageSpeed Insights API
- **Free Tier:** 25,000 requests/day
- **Cost:** FREE (no charges)

### Tips to Reduce API Usage:
1. ✅ Enable MongoDB caching (24-hour cache for restaurant data)
2. ✅ Use rate limiting (already configured)
3. ✅ Cache PageSpeed results in database
4. ✅ Only run audits when users request them

---

## Troubleshooting

### Issue: "API key not valid"
- Make sure you enabled both APIs in Google Cloud Console
- Check that the API key is correctly copied (no extra spaces)
- Verify API restrictions allow your APIs

### Issue: "Request timeout"
- PageSpeed API can take 20-30 seconds to analyze a website
- Timeout is set to 30 seconds (configurable in `pageSpeedService.js`)
- Consider caching results for slow websites

### Issue: "No reviews found"
- Some restaurants may have 0 reviews
- Google Places API may not return reviews for all restaurants
- The system will show empty reviews array (no dummy data)

### Issue: "Response time score is 0"
- Many restaurant owners don't respond to reviews
- This is expected behavior when no owner responses exist
- Score will be 0 if response rate is 0%

---

## Next Steps

Once you have your API keys set up:

1. ✅ Add API keys to environment files
2. ✅ Restart backend server: `npm start`
3. ✅ Test restaurant search
4. ✅ Run an audit on a real restaurant
5. ✅ Check that PageSpeed metrics are real (look for `isRealData: true`)
6. ✅ Verify review response times are calculated from actual data

---

## Security Best Practices

### ⚠️ Never commit API keys to Git
```bash
# .gitignore should include:
.env
.env.local
backend/.env
```

### ✅ Use environment variables
- Development: `.env` files
- Production: Server environment variables or secret management

### ✅ Restrict API keys
- HTTP referrer restrictions for frontend
- IP restrictions for backend
- API restrictions (only enable needed APIs)

### ✅ Monitor usage
- Set up billing alerts in Google Cloud Console
- Monitor API usage dashboard
- Set up quotas to prevent unexpected charges

---

## Support

For issues:
1. Check the console logs for detailed error messages
2. Verify API keys are correctly set in `.env` files
3. Ensure all required APIs are enabled in Google Cloud Console
4. Check API quotas haven't been exceeded

Good luck! 🚀
