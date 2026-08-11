/** 将未知提及列表归一化为去重、可持久化的共享目标。 */
export function normalizeMessageMentions(value) {
    if (!Array.isArray(value))
        return [];
    /** mentions 按服务端或选择顺序保留第一条有效目标。 */
    const mentions = [];
    /** keys 防止同一用户或所有人被重复通知。 */
    const keys = new Set();
    for (const item of value.slice(0, 100)) {
        if (!item || typeof item !== 'object' || Array.isArray(item))
            continue;
        /** record 同时兼容 core camelCase 和 Gateway snake_case。 */
        const record = item;
        /** type 只接受当前协议的 user/all。 */
        const type = readString(record.type).toLowerCase();
        /** nickname 是可选展示快照，不作为身份。 */
        const nickname = readString(record.nickname);
        if (type === 'all') {
            if (keys.has('all'))
                continue;
            keys.add('all');
            mentions.push({ type: 'all', ...(nickname ? { nickname } : {}) });
            continue;
        }
        if (type !== 'user')
            continue;
        /** userID 必须来自明确的稳定用户字段。 */
        const userID = readString(record.userID ?? record.user_id);
        if (!userID || keys.has(`user:${userID}`))
            continue;
        keys.add(`user:${userID}`);
        mentions.push({ type: 'user', userID, ...(nickname ? { nickname } : {}) });
    }
    return mentions;
}
/** 安全读取未知字符串并去除边界空白。 */
function readString(value) {
    return typeof value === 'string' ? value.trim() : '';
}
//# sourceMappingURL=mention.js.map