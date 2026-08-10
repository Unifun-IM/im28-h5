/** SQLite 二进制快照的持久化端口。 */
export interface SQLiteBinaryStore {
    read(databaseName: string): Promise<Uint8Array | null>;
    write(databaseName: string, bytes: Uint8Array): Promise<void>;
    delete(databaseName: string): Promise<void>;
}
/** IndexedDB 快照存储的可注入配置。 */
export interface IndexedDBSQLiteBinaryStoreOptions {
    readonly indexedDB: IDBFactory;
    readonly storageDatabaseName?: string;
}
/** 创建按 SQLite database name 存取二进制快照的 IndexedDB store。 */
export declare function createIndexedDBSQLiteBinaryStore(options: IndexedDBSQLiteBinaryStoreOptions): SQLiteBinaryStore;
//# sourceMappingURL=indexeddb-sqlite-binary-store.d.ts.map