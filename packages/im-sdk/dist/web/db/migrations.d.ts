import type { DatabaseAdapter, DatabaseExecutor } from './database.js';
export interface DatabaseMigration {
    readonly version: number;
    readonly name: string;
    readonly statements: readonly string[];
}
export declare const SDK_MIGRATIONS: readonly DatabaseMigration[];
export declare function runMigrations(database: DatabaseAdapter, migrations?: readonly DatabaseMigration[]): Promise<number>;
export declare function getSchemaVersion(executor: DatabaseExecutor): Promise<number>;
export declare function getTargetSchemaVersion(): number;
//# sourceMappingURL=migrations.d.ts.map