"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletNotFoundError = exports.InsufficientFundsError = void 0;
exports.getBalance = getBalance;
exports.transfer = transfer;
const wallet_repository_1 = require("../repositories/wallet.repository");
class InsufficientFundsError extends Error {
    balance;
    required;
    constructor(balance, required) {
        super(`Insufficient funds: balance ${balance} < required ${required}`);
        this.balance = balance;
        this.required = required;
        this.name = 'InsufficientFundsError';
    }
}
exports.InsufficientFundsError = InsufficientFundsError;
class WalletNotFoundError extends Error {
    userId;
    constructor(userId) {
        super(`Wallet not found for user: ${userId}`);
        this.userId = userId;
        this.name = 'WalletNotFoundError';
    }
}
exports.WalletNotFoundError = WalletNotFoundError;
async function getBalance(userId) {
    const wallet = await (0, wallet_repository_1.findWalletByUserId)(userId);
    if (!wallet) {
        throw new WalletNotFoundError(userId);
    }
    return wallet.balance;
}
async function transfer(senderId, receiverId, amount) {
    const senderWallet = await (0, wallet_repository_1.findWalletByUserId)(senderId);
    if (!senderWallet) {
        throw new WalletNotFoundError(senderId);
    }
    const receiverWallet = await (0, wallet_repository_1.findWalletByUserId)(receiverId);
    if (!receiverWallet) {
        throw new WalletNotFoundError(receiverId);
    }
    const senderBalance = BigInt(senderWallet.balance);
    const transferAmount = BigInt(amount);
    const receiverBalance = BigInt(receiverWallet.balance);
    if (senderBalance < transferAmount) {
        throw new InsufficientFundsError(senderWallet.balance, amount);
    }
    const newSenderBalance = (senderBalance - transferAmount).toString();
    const newReceiverBalance = (receiverBalance + transferAmount).toString();
    await (0, wallet_repository_1.updateBalance)(senderId, newSenderBalance);
    await (0, wallet_repository_1.updateBalance)(receiverId, newReceiverBalance);
    const transaction = await (0, wallet_repository_1.insertTransaction)(senderId, receiverId, amount);
    return {
        senderBalance: newSenderBalance,
        receiverBalance: newReceiverBalance,
        transactionId: transaction.id,
    };
}
//# sourceMappingURL=wallet.service.js.map