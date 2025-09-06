
import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export class ApiError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (error: AppError, req: Request, res: Response, next: NextFunction) => {
  const { statusCode = 500, message, stack } = error;
  
  // Log error details
  console.error('🦍 API Error:', {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    statusCode,
    message,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    ...(process.env.NODE_ENV === 'development' && { stack })
  });

  // Don't expose internal errors in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  const errorMessage = statusCode >= 500 && !isDevelopment 
    ? 'Internal server error' 
    : message;

  res.status(statusCode).json({
    error: {
      message: errorMessage,
      statusCode,
      timestamp: new Date().toISOString(),
      ...(isDevelopment && { stack })
    }
  });
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const error = new ApiError(`Route ${req.method} ${req.path} not found`, 404);
  next(error);
};
