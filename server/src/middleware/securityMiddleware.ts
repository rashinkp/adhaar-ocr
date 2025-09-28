import type { Request, Response, NextFunction } from 'express';
import logger from '../config/logger.config.js';
import { HttpStatus } from '../constants/http.status';
import { ResponseMessages } from '../constants/response.messages';
import { ErrorCodes } from '../constants/error.codes';
import { ResponseHelper } from '../utils/response.helper';

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
    const { response } = ResponseHelper.error(
      'Too many requests',
      ErrorCodes.BAD_REQUEST,
      HttpStatus.BAD_REQUEST  
    );
    return res.status(HttpStatus.BAD_REQUEST).json(response);
  }
  
  recentRequests.push(now);
  rateLimitStore.set(key, recentRequests);
  next();
};

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error('Error:', { message: err.message, stack: err.stack });
  const { response } = ResponseHelper.error(
    ResponseMessages.INTERNAL_ERROR,
    ErrorCodes.INTERNAL_ERROR,
    HttpStatus.INTERNAL_SERVER_ERROR
  );
  res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(response);
};
