/** 归一化、去空并稳定去重 presence 目标用户。 */
export function normalizeIMUserPresenceIDs(userIDs) {
    /** seen 防止同一用户重复进入 Gateway 请求。 */
    const seen = new Set();
    /** normalized 保留调用方首次出现顺序。 */
    const normalized = [];
    for (const value of userIDs) {
        /** userID 清理路由或缓存带入的空白。 */
        const userID = value.trim();
        if (!userID || seen.has(userID))
            continue;
        seen.add(userID);
        normalized.push(userID);
    }
    return normalized;
}
/** 将 HTTP 或 WS 单条状态归一化为共享模型。 */
export function normalizeIMUserPresence(value) {
    if (!isRecord(value))
        return null;
    /** userID 兼容 Gateway snake_case 与 OpenIM 事件 camelCase。 */
    const userID = readString(value.user_id ?? value.userID);
    if (!userID)
        return null;
    /** rawOnline 兼容 HTTP `online` 与 RN 既有 `status` 语义。 */
    const rawOnline = value.online ?? value.status ?? false;
    /** lastSeenAt 保留服务端最近活跃时间，不在客户端推算。 */
    const lastSeenAt = readString(value.last_seen_at ?? value.lastSeenAt);
    return {
        userID,
        online: isIMUserPresenceOnline(rawOnline),
        lastSeenAt,
    };
}
/** 递归解析 Gateway/OpenIM 已知 presence 包装和 JSON 字符串。 */
export function normalizeIMUserPresencePayload(payload) {
    if (typeof payload === 'string') {
        try {
            /** parsed 只继续进入同一结构化解析器。 */
            const parsed = JSON.parse(payload);
            return normalizeIMUserPresencePayload(parsed);
        }
        catch {
            return [];
        }
    }
    if (Array.isArray(payload)) {
        return payload.flatMap(item => {
            /** presence 过滤无用户主键的异常项。 */
            const presence = normalizeIMUserPresence(item);
            return presence ? [presence] : [];
        });
    }
    if (!isRecord(payload))
        return [];
    /** nested 兼容 Gateway data/list 与 OpenIM statusList/userStatusList 包装。 */
    const nested = payload.data ??
        payload.list ??
        payload.statusList ??
        payload.userStatusList;
    if (nested !== undefined && nested !== payload) {
        return normalizeIMUserPresencePayload(nested);
    }
    /** presence 处理无包装的单条状态。 */
    const presence = normalizeIMUserPresence(payload);
    return presence ? [presence] : [];
}
/** 与 RN 现有规则一致识别在线布尔、数字和字符串状态。 */
function isIMUserPresenceOnline(value) {
    if (value === true || value === 1)
        return true;
    if (typeof value !== 'string')
        return false;
    /** normalized 仅接受 RN 已支持的 `1` 和 `online`。 */
    const normalized = value.trim().toLowerCase();
    return normalized === '1' || normalized === 'online';
}
/** 判断未知值是否为可安全读取的普通记录。 */
function isRecord(value) {
    return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}
/** 将字符串或数值标识转换为清理后的字符串。 */
function readString(value) {
    if (typeof value === 'string')
        return value.trim();
    return typeof value === 'number' && Number.isFinite(value) ? String(value) : '';
}
//# sourceMappingURL=user-presence-normalization.js.map