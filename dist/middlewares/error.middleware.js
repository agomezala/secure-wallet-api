"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const zod_1 = require("zod");
const wallet_service_1 = require("../services/wallet.service");
const logger_1 = __importDefault(require("./logger"));
function errorHandler(err, _req, res, _next) {
    if (err instanceof zod_1.ZodError) {
        res.status(400).json({
            error: 'Validation failed',
            details: err.errors.map((e) => ({
                path: e.path.join('.'),
                message: e.message,
            })),
        });
        return;
    }
    if (err instanceof wallet_service_1.WalletNotFoundError) {
        res.status(404).json({ error: err.message });
        return;
    }
    if (err instanceof wallet_service_1.InsufficientFundsError) {
        res.status(422).json({ error: err.message });
        return;
    }
    logger_1.default.error({ err }, 'Unhandled error');
    res.status(500).json({
        error: 'Internal server error',
    });
}
//# sourceMappingURL=error.middleware.js.map