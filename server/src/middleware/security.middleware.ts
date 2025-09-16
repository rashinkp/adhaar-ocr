import type { Request, Response, NextFunction } from 'express';
import logger from '../config/logger.config.js';

const rateLimitStore: Map<string, number[]> = new Map();

export const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(",").map((o) => o.trim()),
  credentials: true,
};

export const rateLimiter = (req: Request, res: Response, next: NextFunction) => {
  const key: string = req.ip || 'unknown';
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; 
  const maxRequests = 100;
  
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

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error('Error:', err.message);
  res.status(500).json({ success: false, message: 'Something went wrong' });
};
