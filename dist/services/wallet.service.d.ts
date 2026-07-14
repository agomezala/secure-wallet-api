export declare class InsufficientFundsError extends Error {
    balance: string;
    required: string;
    constructor(balance: string, required: string);
}
export declare class WalletNotFoundError extends Error {
    userId: string;
    constructor(userId: string);
}
export declare function getBalance(userId: string): Promise<string>;
export declare function transfer(senderId: string, receiverId: string, amount: string): Promise<{
    senderBalance: string;
    receiverBalance: string;
    transactionId: number;
}>;
//# sourceMappingURL=wallet.service.d.ts.map