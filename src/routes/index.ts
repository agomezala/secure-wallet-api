import { Router } from 'express';
import { getHealth } from '../controllers/health.controller';
import { getBalance, transfer } from '../controllers/wallet.controller';
import { errorHandler } from '../middlewares/error.middleware';

const router = Router();

router.get('/health', getHealth);
router.get('/api/v1/wallet/balance/:userId', getBalance);
router.post('/api/v1/wallet/transaction', transfer);

router.use(errorHandler);

export default router;
