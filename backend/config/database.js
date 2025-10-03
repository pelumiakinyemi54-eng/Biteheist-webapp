const mongoose = require('mongoose');
const winston = require('winston');

let isConnected = false;

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/biteheist';

    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    });

    winston.info(`✅ MongoDB Connected: ${conn.connection.host}`);
    isConnected = true;

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      winston.error(`❌ MongoDB connection error: ${err}`);
      isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      winston.warn('⚠️  MongoDB disconnected');
      isConnected = false;
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      if (isConnected) {
        await mongoose.connection.close();
        winston.info('📴 MongoDB connection closed due to app termination');
      }
      process.exit(0);
    });

  } catch (error) {
    winston.error(`❌ MongoDB connection failed: ${error.message}`);
    winston.warn('⚠️  Running in fallback mode without database persistence');
    isConnected = false;
    // Don't exit - continue without MongoDB
  }
};

const isMongoConnected = () => isConnected;

module.exports = { connectDB, isMongoConnected };