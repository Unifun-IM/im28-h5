import type { GatewayUserPresence } from '@im28/im-sdk/core';
import type { IMUserPresence } from './user-presence.js';
/** 归一化、去空并稳定去重 presence 目标用户。 */
export declare function normalizeIMUserPresenceIDs(userIDs: readonly string[]): readonly string[];
/** 将 HTTP 或 WS 单条状态归一化为共享模型。 */
export declare function normalizeIMUserPresence(value: GatewayUserPresence | unknown): IMUserPresence | null;
/** 递归解析 Gateway/OpenIM 已知 presence 包装和 JSON 字符串。 */
export declare function normalizeIMUserPresencePayload(payload: unknown): readonly IMUserPresence[];
//# sourceMappingURL=user-presence-normalization.d.ts.map