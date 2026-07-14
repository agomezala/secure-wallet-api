import { Request, Response } from 'express';
import { healthCheck } from '../config/database';
import logger from '../middlewares/logger';
import { asyncHandler } from '../middlewares/asyncHandler';

export const getHealth = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  const isDbHealthy = await healthCheck();

  if (!isDbHealthy) {
    logger.error('Health check failed — database unreachable');
    res.status(503).json({
      status: 'DOWN',
      timestamp: new Date().toISOString(),
    });
    return;
  }

  res.status(200).json({
    status: 'UP',
    timestamp: new Date().toISOString(),
  });
});
