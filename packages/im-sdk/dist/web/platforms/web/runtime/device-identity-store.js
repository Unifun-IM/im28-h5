import { z } from 'zod';
import { WebIMRuntimeError } from './runtime-error.js';
// 版本化 key 隔离未来 device identity 格式迁移。
const DEFAULT_DEVICE_ID_KEY = 'im28.web.device-id.v1';
// Gateway device ID 必须稳定且有界，避免空值或异常大记录进入请求。
const WEB_IM_DEVICE_ID_SCHEMA = z.string().trim().min(8).max(128);
/** 创建非敏感 device identity store；生产调用方应注入 window.localStorage。 */
export function createWebIMDeviceIdentityStore(storage, createID = createBrowserDeviceID, storageKey = DEFAULT_DEVICE_ID_KEY) {
    return {
        getOrCreate: () => getOrCreateDeviceID(storage, createID, storageKey),
    };
}
/** 使用浏览器密码学随机源生成稳定 device ID。 */
function createBrowserDeviceID() {
    if (typeof globalThis.crypto?.randomUUID !== 'function') {
        throw new WebIMRuntimeError('BROWSER_CAPABILITY_UNAVAILABLE', 'Browser crypto.randomUUID is unavailable.');
    }
    return globalThis.crypto.randomUUID();
}
/** 恢复已有 ID 或生成新 ID；损坏记录不得静默替换。 */
function getOrCreateDeviceID(storage, createID, storageKey) {
    // 已存 ID 优先保持 Gateway device binding 稳定。
    const storedDeviceID = storage.getItem(storageKey);
    if (storedDeviceID !== null) {
        try {
            return WEB_IM_DEVICE_ID_SCHEMA.parse(storedDeviceID);
        }
        catch (cause) {
            storage.removeItem(storageKey);
            throw new WebIMRuntimeError('CORRUPT_DEVICE_ID', 'Stored Web IM device ID is invalid.', cause);
        }
    }
    // 新 ID 在持久化前使用同一 schema 校验注入式 generator。
    const generatedDeviceID = WEB_IM_DEVICE_ID_SCHEMA.parse(createID());
    storage.setItem(storageKey, generatedDeviceID);
    return generatedDeviceID;
}
//# sourceMappingURL=device-identity-store.js.map