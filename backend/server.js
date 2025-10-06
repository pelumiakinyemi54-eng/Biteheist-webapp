require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const winston = require('winston');
const { connectDB } = require('./config/database');
const { getSchedulerInstance } = require('./services/schedulerService');

// Import routes
const restaurantRoutes = require('./routes/restaurants');
const analyticsRoutes = require('./routes/analytics');

// Initialize Express app
const app = express();

// Environment variables
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';
const API_VERSION = process.env.API_VERSION || 'v1';

// Configure Winston logging
winston.configure({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.colorize(),
    winston.format.printf(({ timestamp, level, message, stack }) => {
      return `${timestamp} [${level}]: ${stack || message}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    ...(NODE_ENV === 'production' ? [
      new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
      new winston.transports.File({ filename: 'logs/combined.log' })
    ] : [])
  ]
});

// Connect to MongoDB
connectDB();

// Initialize scheduler service
const scheduler = getSchedulerInstance();
scheduler.initialize();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for development
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
const corsOptions = {
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    process.env.FRONTEND_URL_ALT || 'http://127.0.0.1:5173',
    'http://localhost:3000', // Vite dev server
    'http://localhost:3001', // Vite dev server (alternate)
    'http://localhost:3002', // Vite dev server
    'http://localhost:3003', // Vite dev server
    'http://localhost:5174', // Additional port for development
    'http://localhost:5175'  // Additional port for development
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-requested-with']
};

app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
if (NODE_ENV === 'development') {
  app.use((req, res, next) => {
    const start = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - start;
      winston.info(`${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
    });

    next();
  });
}

// Rate limiting
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: parseInt(process.env.RATE_LIMIT_REQUESTS_PER_HOUR) || 1000,
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api', limiter);

// API Routes
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai', require('./routes/ai'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/branding', require('./routes/branding'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: API_VERSION,
    environment: NODE_ENV,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    services: {
      database: 'Connected',
      googlePlaces: 'Available'
    }
  });
});

// API status endpoint
app.get('/api/status', (req, res) => {
  res.json({
    success: true,
    message: 'BiteHeist API is running',
    version: API_VERSION,
    endpoints: {
      auth: {
        'POST /api/auth/register': 'Register new user',
        'POST /api/auth/login': 'User login',
        'POST /api/auth/refresh': 'Refresh access token',
        'GET /api/auth/me': 'Get current user',
        'PUT /api/auth/profile': 'Update profile',
        'PUT /api/auth/password': 'Change password'
      },
      restaurants: {
        'GET /api/restaurants/search': 'Search restaurants',
        'GET /api/restaurants/:placeId': 'Get restaurant details',
        'POST /api/restaurants/:placeId/audit': 'Run SEO audit'
      }
    },
    documentation: 'https://docs.biteheist.com/api',
    rateLimit: `${process.env.RATE_LIMIT_REQUESTS_PER_HOUR || 1000} requests per hour`
  });
});

// API documentation endpoint
app.get('/api/docs', (req, res) => {
  res.json({
    success: true,
    documentation: {
      title: 'BiteHeist Restaurant SEO Audit API',
      version: API_VERSION,
      description: 'API for restaurant SEO auditing with revenue impact calculations',
      baseUrl: `${req.protocol}://${req.get('host')}/api`,
      authentication: {
        type: 'Bearer Token (JWT)',
        header: 'Authorization: Bearer <token>',
        endpoints: {
          register: 'POST /auth/register',
          login: 'POST /auth/login',
          refresh: 'POST /auth/refresh'
        }
      },
      examples: {
        search: {
          url: '/restaurants/search?query=pizza%20miami',
          method: 'GET',
          description: 'Search for restaurants'
        },
        audit: {
          url: '/restaurants/{placeId}/audit',
          method: 'POST',
          description: 'Run revenue-focused SEO audit'
        }
      }
    }
  });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    path: req.originalUrl,
    method: req.method,
    availableEndpoints: [
      'GET /api/status',
      'GET /api/docs',
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET /api/restaurants/search',
      'POST /api/restaurants/:placeId/audit'
    ]
  });
});

// Global error handler
app.use((error, req, res, next) => {
  winston.error(`Unhandled error: ${error.message}`, {
    stack: error.stack,
    url: req.originalUrl,
    method: req.method,
    body: req.body,
    user: req.user?.email
  });

  // Don't leak error details in production
  const isDevelopment = NODE_ENV === 'development';

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Internal server error',
    ...(isDevelopment && {
      stack: error.stack,
      details: error
    })
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  winston.error('Unhandled Promise Rejection:', err);

  // Close server & exit process
  if (NODE_ENV === 'production') {
    server.close(() => {
      process.exit(1);
    });
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  winston.error('Uncaught Exception:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  winston.info('SIGTERM received. Shutting down gracefully...');

  server.close(() => {
    winston.info('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  winston.info('SIGINT received. Shutting down gracefully...');

  server.close(() => {
    winston.info('Process terminated');
    process.exit(0);
  });
});

// Start server
const server = app.listen(PORT, () => {
  winston.info('🚀 BiteHeist Restaurant SEO Audit API');
  winston.info(`📡 Server running on port ${PORT}`);
  winston.info(`🌍 Environment: ${NODE_ENV}`);
  winston.info(`📊 API Version: ${API_VERSION}`);
  winston.info(`🔑 Google Places API: ${process.env.GOOGLE_PLACES_API_KEY ? 'Configured ✅' : 'Missing ❌'}`);
  winston.info(`📅 Started: ${new Date().toISOString()}`);
  winston.info(`🌐 CORS Origins: ${corsOptions.origin.join(', ')}`);
  winston.info(`⚡ Rate Limit: ${process.env.RATE_LIMIT_REQUESTS_PER_HOUR || 1000} requests/hour`);
  winston.info('');
  winston.info('💡 API Endpoints:');
  winston.info(`   📋 Status: http://localhost:${PORT}/api/status`);
  winston.info(`   📖 Docs: http://localhost:${PORT}/api/docs`);
  winston.info(`   🔍 Search: http://localhost:${PORT}/api/restaurants/search?query=pizza`);
  winston.info(`   🏥 Health: http://localhost:${PORT}/health`);
  winston.info('');
  winston.info('🎯 Ready for restaurant SEO audits with revenue impact analysis!');
});

module.exports = app;