export interface WalletRecord {
    id: number;
    user_id: string;
    balance: string;
    created_at: Date;
    updated_at: Date;
}
export interface TransactionRecord {
    id: number;
    sender_id: string;
    receiver_id: string;
    amount: string;
    created_at: Date;
}
export declare function findWalletByUserId(userId: string): Promise<WalletRecord | null>;
export declare function insertTransaction(senderId: string, receiverId: string, amount: string): Promise<TransactionRecord>;
export declare function updateBalance(userId: string, newBalance: string): Promise<void>;
//# sourceMappingURL=wallet.repository.d.ts.map