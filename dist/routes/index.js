"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const health_controller_1 = require("../controllers/health.controller");
const wallet_controller_1 = require("../controllers/wallet.controller");
const error_middleware_1 = require("../middlewares/error.middleware");
const router = (0, express_1.Router)();
router.get('/health', health_controller_1.getHealth);
router.get('/api/v1/wallet/balance/:userId', wallet_controller_1.getBalance);
router.post('/api/v1/wallet/transaction', wallet_controller_1.transfer);
router.use(error_middleware_1.errorHandler);
exports.default = router;
//# sourceMappingURL=index.js.map