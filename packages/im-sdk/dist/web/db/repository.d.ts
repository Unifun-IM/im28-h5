import type { DatabaseAdapter, DatabaseExecutor, DatabaseRow, DatabaseStatement } from './database.js';
export declare abstract class Repository {
    protected readonly database: DatabaseAdapter;
    protected constructor(database: DatabaseAdapter);
    protected execute(statement: DatabaseStatement): Promise<unknown>;
    protected query<Row extends DatabaseRow = DatabaseRow>(statement: DatabaseStatement): Promise<readonly Row[]>;
    protected transaction<Result>(run: (tx: DatabaseExecutor) => Promise<Result>): Promise<Result>;
}
//# sourceMappingURL=repository.d.ts.map