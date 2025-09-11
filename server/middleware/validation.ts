
import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import DOMPurify from 'isomorphic-dompurify';
import rateLimit from 'express-rate-limit';

export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

export const sanitizeInputs = (req: Request, res: Response, next: NextFunction) => {
  // Sanitize string inputs to prevent XSS
  const sanitizeObject = (obj: any): any => {
    if (typeof obj === 'string') {
      return DOMPurify.sanitize(obj);
    }
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }
    if (typeof obj === 'object' && obj !== null) {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = sanitizeObject(value);
      }
      return sanitized;
    }
    return obj;
  };

  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  
  next();
};

export const rateLimiters = {
  general: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'development' ? 1000 : 100, // Higher limit for development
    message: 'Too many requests from this IP, please try again later.',
    skip: (req) => {
      // Skip rate limiting for development WebSocket and static assets
      return process.env.NODE_ENV === 'development' && 
             (req.url?.includes('/assets/') || req.headers.upgrade === 'websocket');
    }
  }),
  
  api: rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: process.env.NODE_ENV === 'development' ? 200 : 30, // Higher limit for development
    message: 'API rate limit exceeded, please slow down.'
  }),
  
  analytics: rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute  
    max: process.env.NODE_ENV === 'development' ? 100 : 10, // Higher limit for development
    message: 'Too many analytics events, please slow down.'
  })
};
