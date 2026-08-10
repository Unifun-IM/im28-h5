/** localStorage 的最小端口，只用于非敏感浏览器 device ID。 */
export interface WebIMPersistentStorage {
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
    removeItem(key: string): void;
}
/** 稳定 device identity store 为 login、refresh 和 WebSocket 提供同一 ID。 */
export interface WebIMDeviceIdentityStore {
    getOrCreate(): string;
}
/** 创建非敏感 device identity store；生产调用方应注入 window.localStorage。 */
export declare function createWebIMDeviceIdentityStore(storage: WebIMPersistentStorage, createID?: () => string, storageKey?: string): WebIMDeviceIdentityStore;
//# sourceMappingURL=device-identity-store.d.ts.map