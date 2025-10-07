import serverless from 'serverless-http';
import { createRequire } from 'module';

// Create require for CommonJS backend
const require = createRequire(import.meta.url);
const app = require('../../backend/server');

// Export the serverless function
export const handler = serverless(app);
