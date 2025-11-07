import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);

  // Default error
  let statusCode = 500;
  let message = 'Internal Server Error';

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = err.message;
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid data format';
  } else if (err.message.includes('ENOENT')) {
    statusCode = 404;
    message = 'File not found';
  } else if (err.message.includes('EMFILE') || err.message.includes('ENFILE')) {
    statusCode = 503;
    message = 'Server temporarily unavailable';
  }

  const response: ApiResponse = {
    success: false,
    error: message,
    message: process.env.NODE_ENV === 'development' ? err.message : message,
    timestamp: new Date().toISOString(),
  };

  // Add stack trace in development
  if (process.env.NODE_ENV === 'development') {
    (response as any).stack = err.stack;
  }

  res.status(statusCode).json(response);
};