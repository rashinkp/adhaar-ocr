import type { Request, Response, NextFunction } from 'express';
import logger from '../config/logger.config.js';

// In-memory rate limit store (simple and typed)
const rateLimitStore: Map<string, number[]> = new Map();

// Simple CORS
export const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(','),
  credentials: true,
};

// Simple rate limiting
export const rateLimiter = (req: Request, res: Response, next: NextFunction) => {
  // Basic rate limiting - 100 requests per 15 minutes
  const key: string = req.ip || 'unknown';
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 100;
  
  // Read request timestamps for this IP
  const userRequests: number[] = rateLimitStore.get(key) || [];
  const recentRequests = userRequests.filter((time: number) => now - time < windowMs);
  
  if (recentRequests.length >= maxRequests) {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    return res.status(429).json({ error: 'Too many requests' });
  }
  
  recentRequests.push(now);
  rateLimitStore.set(key, recentRequests);
  next();
};

// Simple error handler
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error('Error:', err.message);
  res.status(500).json({ success: false, message: 'Something went wrong' });
};
