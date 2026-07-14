import {
  findWalletByUserId,
  updateBalance,
  insertTransaction,
} from '../repositories/wallet.repository';

export class InsufficientFundsError extends Error {
  constructor(public balance: string, public required: string) {
    super(`Insufficient funds: balance ${balance} < required ${required}`);
    this.name = 'InsufficientFundsError';
  }
}

export class WalletNotFoundError extends Error {
  constructor(public userId: string) {
    super(`Wallet not found for user: ${userId}`);
    this.name = 'WalletNotFoundError';
  }
}

export async function getBalance(userId: string): Promise<string> {
  const wallet = await findWalletByUserId(userId);
  if (!wallet) {
    throw new WalletNotFoundError(userId);
  }
  return wallet.balance;
}

export async function transfer(
  senderId: string,
  receiverId: string,
  amount: string,
): Promise<{ senderBalance: string; receiverBalance: string; transactionId: number }> {
  const senderWallet = await findWalletByUserId(senderId);
  if (!senderWallet) {
    throw new WalletNotFoundError(senderId);
  }

  const receiverWallet = await findWalletByUserId(receiverId);
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

  await updateBalance(senderId, newSenderBalance);
  await updateBalance(receiverId, newReceiverBalance);

  const transaction = await insertTransaction(senderId, receiverId, amount);

  return {
    senderBalance: newSenderBalance,
    receiverBalance: newReceiverBalance,
    transactionId: transaction.id,
  };
}
