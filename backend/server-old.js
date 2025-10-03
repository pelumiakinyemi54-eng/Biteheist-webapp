// backend/server.js
require('dotenv').config(); // Load environment variables from .env file

const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();

// Environment variables with fallbacks
const PORT = process.env.PORT || 3001;
const API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const NODE_ENV = process.env.NODE_ENV || 'development';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const FRONTEND_URL_ALT = process.env.FRONTEND_URL_ALT || 'http://127.0.0.1:5173';
const RATE_LIMIT = parseInt(process.env.RATE_LIMIT_REQUESTS_PER_HOUR) || 1000;
const REQUEST_TIMEOUT = parseInt(process.env.REQUEST_TIMEOUT) || 10000;

// Validate required environment variables
if (!API_KEY) {
  console.error('❌ GOOGLE_PLACES_API_KEY is required in .env file');
  process.exit(1);
}

// Middleware
app.use(cors({
  origin: [FRONTEND_URL, FRONTEND_URL_ALT],
  credentials: true
}));
app.use(express.json());

// Request logging (only in development)
if (NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`, req.query);
    next();
  });
}

// Simple rate limiting (in-memory)
const requestCounts = new Map();
const resetTime = Date.now() + 3600000; // Reset every hour

const rateLimit = (req, res, next) => {
  const clientIP = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  
  // Reset counts every hour
  if (now > resetTime) {
    requestCounts.clear();
  }
  
  const count = requestCounts.get(clientIP) || 0;
  if (count >= RATE_LIMIT) {
    return res.status(429).json({ 
      error: 'Rate limit exceeded',
      resetTime: new Date(resetTime).toISOString()
    });
  }
  
  requestCounts.set(clientIP, count + 1);
  next();
};

// Apply rate limiting to API routes
app.use('/api/', rateLimit);

// Helper function to make API calls with timeout
const fetchWithTimeout = async (url, options = {}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

// Text Search endpoint (New Places API)
app.get('/api/places/textsearch', async (req, res) => {
  try {
    const { query, type = 'restaurant' } = req.query;

    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    if (NODE_ENV === 'development') {
      console.log(`🔍 Searching for: ${query}`);
    }

    // Use the new Places API (New) searchText endpoint
    const url = `https://places.googleapis.com/v1/places:searchText`;

    const requestBody = {
      textQuery: query,
      includedType: type,
      maxResultCount: 10,
      locationBias: {
        circle: {
          center: {
            latitude: 25.7617, // Miami default
            longitude: -80.1918
          },
          radius: 50000.0
        }
      }
    };

    const response = await fetchWithTimeout(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': API_KEY,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.priceLevel,places.photos'
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();

    if (NODE_ENV === 'development') {
      console.log(`✅ Found ${data.places?.length || 0} results`);
    }

    // Return new API format directly
    const responseData = {
      status: response.ok ? 'OK' : 'REQUEST_DENIED',
      places: data.places || []
    };

    res.json(responseData);
  } catch (error) {
    console.error('❌ Text search error:', error.message);

    if (error.name === 'AbortError') {
      return res.status(408).json({ error: 'Request timeout' });
    }

    res.status(500).json({ error: 'Internal server error' });
  }
});

// Place Details endpoint (New Places API)
app.get('/api/places/details', async (req, res) => {
  try {
    const { place_id } = req.query;

    if (!place_id) {
      return res.status(400).json({ error: 'place_id parameter is required' });
    }

    if (NODE_ENV === 'development') {
      console.log(`📍 Getting details for place_id: ${place_id}`);
    }

    // Use the new Places API (New) get place endpoint
    const url = `https://places.googleapis.com/v1/${place_id}`;

    const response = await fetchWithTimeout(url, {
      method: 'GET',
      headers: {
        'X-Goog-Api-Key': API_KEY,
        'X-Goog-FieldMask': 'id,displayName,formattedAddress,nationalPhoneNumber,websiteUri,rating,userRatingCount,reviews,regularOpeningHours,photos,location,priceLevel,types'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ API Error ${response.status}: ${errorText}`);
      return res.status(response.status).json({
        status: 'REQUEST_DENIED',
        place: null,
        error: `API Error: ${response.status}`
      });
    }

    const responseText = await response.text();
    if (!responseText) {
      console.error('❌ Empty response from Places API');
      return res.status(500).json({
        status: 'REQUEST_DENIED',
        place: null,
        error: 'Empty response from API'
      });
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (jsonError) {
      console.error('❌ Invalid JSON response:', responseText.substring(0, 200));
      return res.status(500).json({
        status: 'REQUEST_DENIED',
        place: null,
        error: 'Invalid JSON response'
      });
    }

    if (NODE_ENV === 'development') {
      console.log(`✅ Details loaded for: ${data.displayName?.text || 'Unknown'}`);
    }

    // Return new API format directly
    const responseData = {
      status: 'OK',
      place: data || null
    };

    res.json(responseData);
  } catch (error) {
    console.error('❌ Place details error:', error.message);

    if (error.name === 'AbortError') {
      return res.status(408).json({ error: 'Request timeout' });
    }

    res.status(500).json({ error: 'Internal server error' });
  }
});

// Nearby Search endpoint (New Places API)
app.get('/api/places/nearbysearch', async (req, res) => {
  try {
    const { location, radius = 1000, type = 'restaurant' } = req.query;

    if (!location) {
      return res.status(400).json({ error: 'location parameter is required' });
    }

    if (NODE_ENV === 'development') {
      console.log(`🗺️  Searching nearby: ${location} (${radius}m radius)`);
    }

    // Parse lat,lng from location parameter
    const [lat, lng] = location.split(',').map(parseFloat);

    // Use the new Places API (New) searchNearby endpoint
    const url = `https://places.googleapis.com/v1/places:searchNearby`;

    const requestBody = {
      includedTypes: [type],
      maxResultCount: 10,
      locationRestriction: {
        circle: {
          center: {
            latitude: lat,
            longitude: lng
          },
          radius: parseFloat(radius)
        }
      }
    };

    const response = await fetchWithTimeout(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': API_KEY,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.priceLevel,places.photos,places.location'
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();

    if (NODE_ENV === 'development') {
      console.log(`✅ Found ${data.places?.length || 0} nearby places`);
    }

    // Return new API format directly
    const responseData = {
      status: response.ok ? 'OK' : 'REQUEST_DENIED',
      places: data.places || []
    };

    res.json(responseData);
  } catch (error) {
    console.error('❌ Nearby search error:', error.message);

    if (error.name === 'AbortError') {
      return res.status(408).json({ error: 'Request timeout' });
    }

    res.status(500).json({ error: 'Internal server error' });
  }
});

// Photo proxy endpoint (New Places API)
app.get('/api/places/photo', async (req, res) => {
  try {
    const { photoreference, maxwidth = 400 } = req.query;

    if (!photoreference) {
      return res.status(400).json({ error: 'photoreference parameter is required' });
    }

    // Extract the photo name from the Places API (New) format
    // photoreference format: places/{place_id}/photos/{photo_id}
    const photoName = photoreference.includes('/') ? photoreference : `photos/${photoreference}`;

    const url = `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=${maxwidth}&key=${API_KEY}`;

    const response = await fetchWithTimeout(url);

    // Set appropriate headers for image response
    res.set({
      'Content-Type': response.headers.get('content-type') || 'image/jpeg',
      'Cache-Control': 'public, max-age=86400' // Cache for 24 hours
    });

    // Pipe the image data directly to the response
    response.body.pipe(res);
  } catch (error) {
    console.error('❌ Photo proxy error:', error.message);

    if (error.name === 'AbortError') {
      return res.status(408).json({ error: 'Request timeout' });
    }

    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    apiKeyConfigured: !!API_KEY,
    port: PORT,
    corsOrigins: [FRONTEND_URL, FRONTEND_URL_ALT]
  });
});

// API status endpoint
app.get('/api/status', (req, res) => {
  res.json({
    status: 'API Ready',
    endpoints: [
      'GET /api/places/textsearch?query=restaurant+name',
      'GET /api/places/details?place_id=PLACE_ID',
      'GET /api/places/nearbysearch?location=lat,lng&radius=1000',
      'GET /api/places/photo?photoreference=PHOTO_REF&maxwidth=400'
    ],
    rateLimit: `${RATE_LIMIT} requests per hour`,
    timeout: `${REQUEST_TIMEOUT}ms`
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    availableEndpoints: ['/health', '/api/status', '/api/places/*']
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('❌ Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log('🚀 Restaurant Audit Backend Server');
  console.log(`📡 Running on: http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${NODE_ENV}`);
  console.log(`🔑 API Key: ${API_KEY ? 'Configured ✅' : 'Missing ❌'}`);
  console.log(`🌐 CORS Origins: ${FRONTEND_URL}, ${FRONTEND_URL_ALT}`);
  console.log(`⚡ Rate Limit: ${RATE_LIMIT} requests/hour`);
  console.log(`⏱️  Timeout: ${REQUEST_TIMEOUT}ms`);
  console.log('📍 Google Places API proxy ready!');
  console.log('\n💡 Test endpoints:');
  console.log(`   Health: http://localhost:${PORT}/health`);
  console.log(`   Status: http://localhost:${PORT}/api/status`);
});

module.exports = app;