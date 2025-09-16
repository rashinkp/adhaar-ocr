import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || "5000", 10),
  mongoUri: process.env.MONGO_URI,
  allowedOrigins: process.env.ALLOWED_ORIGINS?.split(",") || [
    "http://localhost:3000",
  ],
  isDevelopment: process.env.NODE_ENV === "development",
};

export default config;
