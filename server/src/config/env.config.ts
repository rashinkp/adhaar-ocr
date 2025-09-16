import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Simple config - only what you need
export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/aadhaar-ocr',
  allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  isDevelopment: process.env.NODE_ENV === 'development',
};

export default config;
