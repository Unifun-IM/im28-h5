import type { DatabaseAdapter, DatabaseExecuteResult, DatabaseRow, DatabaseStatement } from './database.js';
/**
 * Structured RPC port for a database owned by another execution context.
 * Electron IPC, a browser Worker, or a native bridge can implement this port.
 */
export interface DatabaseRPCPort {
    open(): Promise<void>;
    close(): Promise<void>;
    execute(statement: DatabaseStatement): Promise<DatabaseExecuteResult>;
    query<Row extends DatabaseRow = DatabaseRow>(statement: DatabaseStatement): Promise<readonly Row[]>;
    beginTransaction(): Promise<string>;
    executeTransaction(transactionID: string, statement: DatabaseStatement): Promise<DatabaseExecuteResult>;
    queryTransaction<Row extends DatabaseRow = DatabaseRow>(transactionID: string, statement: DatabaseStatement): Promise<readonly Row[]>;
    commitTransaction(transactionID: string): Promise<void>;
    rollbackTransaction(transactionID: string): Promise<void>;
}
export interface DatabaseRPCAdapterOptions {
    readonly name: string;
    readonly port: DatabaseRPCPort;
}
/**
 * Adapts a structured database RPC port to the shared repository contract.
 * The adapter serializes public operations and transaction child statements.
 */
export declare function createDatabaseRPCAdapter(options: DatabaseRPCAdapterOptions): DatabaseAdapter;
//# sourceMappingURL=rpc-database-adapter.d.ts.map