import { Request, Response, NextFunction } from 'express';
import { DomainException } from '../exceptions/DomainException';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error(`[Error] ${err.name}: ${err.message}`);

  if (err instanceof DomainException) {
    res.status(err.statusCode).json({
      success: false,
      error: err.name,
      message: err.message,
      statusCode: err.statusCode
    });
    return;
  }

  // Generic server error
  res.status(500).json({
    success: false,
    error: 'InternalServerError',
    message: 'An unexpected error occurred',
    statusCode: 500
  });
}
