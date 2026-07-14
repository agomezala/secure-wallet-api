"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findWalletByUserId = findWalletByUserId;
exports.insertTransaction = insertTransaction;
exports.updateBalance = updateBalance;
const database_1 = require("../config/database");
async function findWalletByUserId(userId) {
    const rows = await (0, database_1.query)('SELECT id, user_id, balance, created_at, updated_at FROM wallets WHERE user_id = $1 LIMIT 1', [userId]);
    return rows.length > 0 ? rows[0] : null;
}
async function insertTransaction(senderId, receiverId, amount) {
    const rows = await (0, database_1.query)(`INSERT INTO transactions (sender_id, receiver_id, amount)
     VALUES ($1, $2, $3)
     RETURNING id, sender_id, receiver_id, amount, created_at`, [senderId, receiverId, amount]);
    return rows[0];
}
async function updateBalance(userId, newBalance) {
    await (0, database_1.query)('UPDATE wallets SET balance = $1, updated_at = NOW() WHERE user_id = $2', [newBalance, userId]);
}
//# sourceMappingURL=wallet.repository.js.map