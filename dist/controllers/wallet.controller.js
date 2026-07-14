"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBalance = getBalance;
exports.transfer = transfer;
const zod_1 = require("zod");
const walletService = __importStar(require("../services/wallet.service"));
const logger_1 = __importDefault(require("../middlewares/logger"));
const getBalanceParamsSchema = zod_1.z.object({
    userId: zod_1.z.string().min(1, 'userId is required'),
});
const transferBodySchema = zod_1.z.object({
    senderId: zod_1.z.string().min(1, 'senderId is required'),
    receiverId: zod_1.z.string().min(1, 'receiverId is required'),
    amount: zod_1.z
        .string()
        .regex(/^\d+$/, 'amount must be a positive integer string'),
});
async function getBalance(req, res) {
    const { userId } = getBalanceParamsSchema.parse(req.params);
    const balance = await walletService.getBalance(userId);
    logger_1.default.info({ userId, balance }, 'Balance fetched');
    res.status(200).json({ userId, balance });
}
async function transfer(req, res) {
    const { senderId, receiverId, amount } = transferBodySchema.parse(req.body);
    if (senderId === receiverId) {
        res.status(422).json({ error: 'sender and receiver must be different' });
        return;
    }
    const result = await walletService.transfer(senderId, receiverId, amount);
    logger_1.default.info({ senderId, receiverId, amount, transactionId: result.transactionId }, 'Transaction completed');
    res.status(201).json(result);
}
//# sourceMappingURL=wallet.controller.js.map