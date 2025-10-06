const serverless = require('serverless-http');
const app = require('../../backend/server');

// Export the serverless function
exports.handler = serverless(app);
