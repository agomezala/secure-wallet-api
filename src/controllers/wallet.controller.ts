import { Request, Response } from 'express';
import { z } from 'zod';
import * as walletService from '../services/wallet.service';
import logger from '../middlewares/logger';
import { asyncHandler } from '../middlewares/asyncHandler';

const getBalanceParamsSchema = z.object({
  userId: z.string().min(1, 'userId is required'),
});

const transferBodySchema = z.object({
  senderId: z.string().min(1, 'senderId is required'),
  receiverId: z.string().min(1, 'receiverId is required'),
  amount: z
    .string()
    .regex(/^\d+$/, 'amount must be a positive integer string'),
});

export const getBalance = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { userId } = getBalanceParamsSchema.parse(req.params);

  const balance = await walletService.getBalance(userId);

  logger.info({ userId, balance }, 'Balance fetched');

  res.status(200).json({ userId, balance });
});

export const transfer = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { senderId, receiverId, amount } = transferBodySchema.parse(req.body);

  if (senderId === receiverId) {
    res.status(422).json({ error: 'sender and receiver must be different' });
    return;
  }

  const result = await walletService.transfer(senderId, receiverId, amount);

  logger.info(
    { senderId, receiverId, amount, transactionId: result.transactionId },
    'Transaction completed',
  );

  res.status(201).json(result);
});
