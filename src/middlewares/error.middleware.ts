import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { WalletNotFoundError, InsufficientFundsError } from '../services/wallet.service';
import logger from './logger';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'Validation failed',
      details: err.errors.map((e) => ({
        path: e.path.join('.'),
        message: e.message,
      })),
    });
    return;
  }

  if (err instanceof WalletNotFoundError) {
    res.status(404).json({ error: err.message });
    return;
  }

  if (err instanceof InsufficientFundsError) {
    res.status(422).json({ error: err.message });
    return;
  }

  logger.error({ err }, 'Unhandled error');

  res.status(500).json({
    error: 'Internal server error',
  });
}
