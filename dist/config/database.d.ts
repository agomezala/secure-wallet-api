import { Pool } from 'pg';
export declare const pool: Pool;
export declare function query(text: string, params?: unknown[]): Promise<unknown[]>;
export declare function healthCheck(): Promise<boolean>;
//# sourceMappingURL=database.d.ts.map