# MongoDB Installation and Setup Guide

This guide will help you install MongoDB and integrate it with the BiteHeist application.

## Why MongoDB?

MongoDB stores your historical data including:
- **Ranking History** - Track your Google ranking position over time
- **Competitor Tracking** - Monitor competitor movements and changes
- **Weekly Reports** - Automated performance reports with insights
- **Audit History** - Save all your past restaurant audits

Without MongoDB, the app shows **simulated data**. With MongoDB, you get **real tracking**.

---

## Installation Steps (Windows)

### 1. Download MongoDB Community Server

1. Go to: https://www.mongodb.com/try/download/community
2. Select:
   - **Version**: 8.0 or latest
   - **Platform**: Windows
   - **Package**: MSI
3. Click **Download**

### 2. Install MongoDB

1. Run the downloaded `.msi` file
2. Choose **Complete** installation type
3. **Important**: Check "Install MongoDB as a Service"
   - This makes MongoDB start automatically
4. Keep default data directory: `C:\Program Files\MongoDB\Server\8.0\data`
5. Uncheck "Install MongoDB Compass" (optional GUI tool, not needed)
6. Click **Install**
7. Wait for installation to complete

### 3. Verify MongoDB is Running

Open Command Prompt (CMD) or PowerShell and run:

```bash
net start MongoDB
```

You should see:
```
The MongoDB Server (MongoDB) service is starting.
The MongoDB Server (MongoDB) service was started successfully.
```

If it says "already started", that's perfect!

### 4. Test MongoDB Connection

Run this command to connect to MongoDB:

```bash
mongosh
```

You should see something like:
```
Current Mongosh Log ID: xxx
Connecting to: mongodb://127.0.0.1:27017
Using MongoDB: 8.0.0
Using Mongosh: 2.0.0
```

Type `exit` to quit.

---

## Start Your BiteHeist Backend

1. **Stop your current backend** (if running):
   - Press `Ctrl+C` in the terminal running backend
   - OR close that terminal

2. **Start backend again**:
   ```bash
   cd backend
   npm start
   ```

3. **Look for this message**:
   ```
   ✅ MongoDB connected successfully
   📡 Server running on port 3003
   ```

If you see "✅ MongoDB connected successfully", you're all set!

---

## What Happens After MongoDB is Connected?

### Immediate Changes:

1. **Real Ranking History**
   - Every audit you run saves a snapshot
   - Historical charts show actual data (not simulated)

2. **Competitor Tracking**
   - Tracks competitor changes over time
   - Shows new competitors and departed ones
   - Monitors rating/review changes

3. **Weekly Reports**
   - Generates automated weekly performance reports
   - Shows insights and trends
   - Identifies opportunities

4. **Audit History**
   - Saves all your past audits
   - Can review previous results
   - Track improvements over time

### To See Real Data:

1. **Run an audit** on any restaurant
2. **Wait 24 hours**
3. **Run another audit** on the same restaurant
4. **View ranking history** - you'll see real data points!

The more audits you run over time, the more valuable your historical data becomes.

---

## Troubleshooting

### Problem: "MongoDB service not found"

**Solution**: Restart installation and make sure to check "Install MongoDB as a Service"

### Problem: "Connection refused on port 27017"

**Solution**: MongoDB service isn't running. Try:
```bash
net start MongoDB
```

### Problem: "Access denied"

**Solution**: Run Command Prompt as Administrator, then try `net start MongoDB` again

### Problem: Backend still says "MongoDB not available"

**Solution**:
1. Make sure MongoDB service is running
2. Restart your backend: `Ctrl+C`, then `npm start`
3. Check backend logs for connection errors

### Problem: Port 27017 already in use

**Solution**: Another process is using MongoDB's port. Find and close it:
```bash
netstat -ano | findstr :27017
taskkill /PID <process_id> /F
```

---

## Check MongoDB Status

To see if MongoDB is running:

```bash
sc query MongoDB
```

Look for `STATE: 4 RUNNING`

---

## MongoDB Management (Optional)

### Stop MongoDB Service:
```bash
net stop MongoDB
```

### Start MongoDB Service:
```bash
net start MongoDB
```

### Check Database Size:
```bash
mongosh
use biteheist
db.stats()
```

---

## What's Stored in MongoDB?

Your BiteHeist database (`biteheist`) contains these collections:

- `rankinghistories` - Your Google ranking snapshots
- `competitorsnapshots` - Competitor data over time
- `weeklyreports` - Auto-generated weekly insights
- `restaurants` - Cached restaurant details
- `audits` - Saved audit results

You can view this data using MongoDB Compass (optional GUI tool).

---

## Need Help?

If you encounter issues:

1. Check MongoDB is running: `net start MongoDB`
2. Check backend logs for error messages
3. Verify port 27017 is available
4. Restart both MongoDB and backend

MongoDB is **free** and **runs locally** on your computer. Your data stays private and secure on your machine.

---

## Summary

✅ Install MongoDB Community Server
✅ Install as a Service (auto-starts)
✅ Run `net start MongoDB` to start service
✅ Restart backend to connect
✅ Run audits to start building real historical data

**Once installed, MongoDB runs in the background and you never need to think about it again!**
