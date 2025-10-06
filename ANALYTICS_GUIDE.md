# Analytics & Weekly Reports Guide

## 📊 How Analytics Work in BiteHeist

BiteHeist tracks restaurant performance over time by storing **snapshots** of data in MongoDB. This allows you to see trends, improvements, and competitor movements.

---

## ⚠️ Important: MongoDB Required

**All analytics features require MongoDB to be running!**

Without MongoDB:
- ❌ No weekly reports
- ❌ No ranking history
- ❌ No competitor tracking
- ❌ No trend analysis

**With MongoDB:**
- ✅ Track rankings over weeks/months
- ✅ Generate weekly performance reports
- ✅ Monitor competitor movements
- ✅ Analyze traffic trends
- ✅ Calculate revenue impact over time

---

## 🚀 Quick Start: Enable Analytics

### Step 1: Install MongoDB

**Windows:**
```bash
# Download from: https://www.mongodb.com/try/download/community
# Or use Chocolatey:
choco install mongodb

# Start MongoDB
mongod
```

**Mac:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux:**
```bash
sudo apt-get install mongodb
sudo systemctl start mongod
```

### Step 2: Verify MongoDB is Running

```bash
# Check if MongoDB is running
mongosh

# Or check the backend logs - you should NOT see:
# "❌ MongoDB connection failed"
```

### Step 3: Run Your First Audit

Once MongoDB is running:

1. **Search for a restaurant**
2. **Click "Run Audit"**
3. **Data is automatically saved to MongoDB**

The audit saves:
- Restaurant details
- Ranking snapshot
- Competitor snapshot
- Performance metrics

---

## 📈 How Weekly Reports Are Generated

### Automatic Data Collection

Every time you run an audit, BiteHeist automatically saves:

1. **Ranking Snapshot** (`RankingHistory` model)
   - Google rank position
   - Local rank position
   - Overall SEO score
   - Performance score
   - Rating & review count
   - Estimated monthly visitors
   - Revenue impact

2. **Competitor Snapshot** (`CompetitorSnapshot` model)
   - List of competitors found
   - Their ratings & rankings
   - Distance from your restaurant
   - Changes vs last snapshot

3. **Weekly Report** (`WeeklyReport` model)
   - Week number & year
   - Performance summary
   - Traffic trends
   - Competitor insights
   - Revenue impact trends

### How to Get Weekly Reports

**Method 1: Via API**
```bash
# Get latest weekly report
GET /api/analytics/weekly-report/:placeId

# Get specific week
GET /api/analytics/weekly-report/:placeId?week=42&year=2025

# Get report history (last 12 weeks)
GET /api/analytics/weekly-reports/:placeId?limit=12
```

**Method 2: Via Dashboard**
1. Go to http://localhost:3001
2. Search for your restaurant
3. Run an audit
4. Click on "Reports" tab
5. View your weekly report

---

## 🔄 How Data Accumulates Over Time

### Week 1: First Audit
```
Run Audit → Data Saved
- Ranking: #5
- Score: 72
- Competitors: 5 found
Status: ✅ Baseline established
```

### Week 2: Second Audit
```
Run Audit → Data Saved + Compared
- Ranking: #3 (↑2 positions)
- Score: 78 (↑6 points)
- Competitors: 5 tracked
Status: ✅ Trends detected
```

### Week 3+: Ongoing Tracking
```
Run Audit → Full Analytics Available
- Ranking trends over time
- Competitor movement tracking
- Traffic growth/decline
- Revenue impact analysis
Status: ✅ Weekly reports generated
```

---

## 📊 What Weekly Reports Include

### Performance Metrics
- **Current Rank** - Your position in search results
- **Rank Change** - Movement vs last week
- **Current Score** - Overall SEO score (0-100)
- **Score Change** - Improvement/decline
- **Rating & Reviews** - Current rating + new reviews

### Traffic Insights
- **Estimated Visitors** - Monthly visitor estimate
- **Visitor Change** - % change vs last week
- **Traffic Trend** - Up/down/stable
- **Search Impressions** - Estimated monthly searches

### Competitor Analysis
- **Total Tracked** - Number of competitors monitored
- **New Competitors** - Newly appeared restaurants
- **Your Position** - Rank among competitors
- **Position Change** - Movement in competitive landscape

### Revenue Impact
- **Estimated Loss** - Monthly revenue loss due to SEO issues
- **Loss Change** - Change vs last week
- **Potential Gain** - Annual revenue opportunity

### Insights & Recommendations
- Positive changes worth celebrating
- Opportunities to capitalize on
- Warnings about declining metrics
- Actionable recommendations

---

## 🎯 Advanced Analytics Features

### 1. Ranking History
```bash
GET /api/analytics/ranking-history/:placeId?days=30
```

**Shows:**
- Daily/weekly ranking changes
- Best & worst ranks
- Trend analysis (improving/declining/stable)
- Volatility metrics

### 2. Competitor Tracking
```bash
GET /api/analytics/competitor-tracking/:placeId?days=30
```

**Shows:**
- Competitor ratings over time
- New competitors appearing
- Competitors that closed/moved
- Your position vs competitors

### 3. Traffic Metrics
```bash
GET /api/analytics/traffic-metrics/:placeId
```

**Shows:**
- Estimated daily/weekly/monthly visitors
- Click-through rate (CTR)
- Search impressions
- Traffic trends
- SEO impact on traffic

---

## 🔍 Troubleshooting

### "Database not available" Error

**Problem:** MongoDB is not running

**Solution:**
```bash
# Start MongoDB
mongod

# Or on Mac:
brew services start mongodb-community

# Verify it's running:
mongosh
```

### No Weekly Reports Showing

**Problem:** Not enough data collected

**Solution:**
- Run at least 2 audits (1 week apart)
- Weekly reports need historical data to compare
- First audit = baseline, second audit = first report

### Competitor Data Empty

**Problem:** No competitors found nearby

**Solution:**
- Make sure restaurant has a location (lat/lng)
- Increase search radius in code (default 1km)
- Check if area has other restaurants
- Google Places might not return competitors if none match cuisine type

---

## 💾 Data Models

### RankingHistory
Tracks performance over time:
- Restaurant ID & place ID
- Google & local rank positions
- SEO & performance scores
- Rating & review counts
- Estimated traffic
- Revenue impact
- Week number & year

### CompetitorSnapshot
Tracks competitive landscape:
- List of competitors
- Competitor stats (ratings, reviews, rank)
- Your position vs competitors
- Changes vs previous snapshot
- Week number & year

### WeeklyReport
Aggregated weekly summary:
- Performance summary
- Traffic analysis
- Competitor insights
- Revenue trends
- Actionable insights
- Week number & year

---

## 🎨 Example Weekly Report

```json
{
  "placeId": "ChIJ...",
  "weekNumber": 42,
  "year": 2025,
  "weekStart": "2025-10-13",
  "weekEnd": "2025-10-19",

  "performance": {
    "currentRank": 3,
    "rankChange": 2,          // Improved by 2 positions
    "currentScore": 78,
    "scoreChange": 6,         // Score increased by 6
    "currentRating": 4.3,
    "ratingChange": 0.1,
    "totalReviews": 165,
    "newReviews": 12         // 12 new reviews this week
  },

  "traffic": {
    "estimatedVisitors": 1250,
    "visitorChange": 8.5,    // 8.5% increase
    "trafficTrend": "up"
  },

  "competitors": {
    "totalTracked": 5,
    "newCompetitors": 1,     // New competitor appeared
    "yourPosition": 3,
    "positionChange": 2      // Moved up 2 positions
  },

  "revenueImpact": {
    "estimatedLoss": 1800,
    "lossChange": -300,      // $300 less loss (improvement!)
    "potentialGain": 21600
  },

  "insights": [
    {
      "type": "positive",
      "title": "Ranking Improved",
      "description": "Moved up 2 positions this week",
      "priority": "high"
    },
    {
      "type": "opportunity",
      "title": "Review Momentum",
      "description": "12 new reviews - highest in 4 weeks",
      "priority": "medium"
    }
  ]
}
```

---

## 🚀 Best Practices

### 1. Run Audits Regularly
- **Weekly audits** = Best for tracking trends
- **Bi-weekly** = Minimum for meaningful data
- **Daily** = Too frequent, data won't change much

### 2. Monitor Competitor Movement
- Track new competitors entering your area
- Watch for competitors improving rankings
- Learn from high-performing competitors

### 3. Act on Insights
- Follow action items in weekly reports
- Focus on high-priority improvements
- Track impact of changes you make

### 4. Track Revenue Impact
- Monitor monthly revenue loss trends
- Calculate ROI of SEO improvements
- Use data to justify marketing spend

---

## 📞 Support

**No data showing?**
1. Make sure MongoDB is running
2. Run at least 2 audits
3. Check backend logs for errors

**Want to customize?**
- Edit models in `backend/models/`
- Modify analytics routes in `backend/routes/analytics.js`
- Adjust data collection in `backend/routes/restaurants.js`

---

Happy tracking! 📊🚀
