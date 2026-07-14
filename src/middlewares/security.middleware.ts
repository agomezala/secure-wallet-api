import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from '../config';

export const securityHeaders = helmet();

export const rateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});
