export type DatabaseValue = boolean | number | string | ArrayBuffer | null;
export type DatabaseParams = readonly DatabaseValue[];
export type DatabaseRow = Readonly<Record<string, DatabaseValue | undefined>>;
export interface DatabaseExecuteResult {
    readonly rowsAffected?: number;
    readonly insertId?: number;
}
export interface DatabaseStatement {
    readonly sql: string;
    readonly params?: DatabaseParams;
}
export interface DatabaseExecutor {
    execute(statement: DatabaseStatement): Promise<DatabaseExecuteResult>;
    query<Row extends DatabaseRow = DatabaseRow>(statement: DatabaseStatement): Promise<readonly Row[]>;
}
export interface DatabaseTransaction extends DatabaseExecutor {
}
export interface DatabaseAdapter extends DatabaseExecutor {
    readonly name: string;
    open(): Promise<void>;
    close(): Promise<void>;
    transaction<Result>(run: (tx: DatabaseTransaction) => Promise<Result>): Promise<Result>;
}
/** 把现有事务执行器适配为 Repository 可复用的数据库端口，不开启嵌套事务。 */
export declare function createTransactionDatabaseAdapter(name: string, transaction: DatabaseTransaction): DatabaseAdapter;
export declare function statement(sql: string, params?: DatabaseParams): DatabaseStatement;
//# sourceMappingURL=database.d.ts.map