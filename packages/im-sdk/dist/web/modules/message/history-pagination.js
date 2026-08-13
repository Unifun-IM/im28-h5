/** 合并当前窗口与新拉取页，按稳定身份去重并保持 newest-first。 */
export function mergeIMMessageHistoryWindow(current, incoming) {
    /** byIdentity 让同一服务端或客户端消息只保留最新状态。 */
    const byIdentity = new Map();
    current.forEach(message => byIdentity.set(getMessageIdentity(message), message));
    incoming.forEach(message => {
        /** identity 复用服务端优先身份，允许拉取页覆盖旧缓存快照。 */
        const identity = getMessageIdentity(message);
        /** clientIdentity 同时移除可能只以客户端身份保存的旧快照。 */
        const clientIdentity = `client:${message.clientMsgID.trim()}`;
        if (identity !== clientIdentity)
            byIdentity.delete(clientIdentity);
        byIdentity.set(identity, message);
    });
    return [...byIdentity.values()].sort(compareNewestMessageFirst);
}
/** 从当前窗口最早有效 seq 计算上一页游标，始终保留 uint64 精度。 */
export function getIMPreviousMessageHistoryCursor(messages, fallbackCursor) {
    /** sequences 只收集有效 Gateway uint64，不信任 sendTime 或数组下标。 */
    const sequences = messages
        .map(getMessageSequence)
        .filter((value) => Boolean(value));
    /** oldestSequence 优先使用窗口真实最早消息，空窗口才使用缓存游标。 */
    const oldestSequence = sequences.reduce((oldest, value) => !oldest || BigInt(value) < BigInt(oldest) ? value : oldest, undefined) ?? normalizeUint64(fallbackCursor);
    if (!oldestSequence || oldestSequence === '0')
        return undefined;
    return (BigInt(oldestSequence) - 1n).toString();
}
/** 返回服务端优先的跨窗口稳定身份。 */
function getMessageIdentity(message) {
    /** serverID 能关联 Gateway history 与 realtime 的同一实体。 */
    const serverID = message.serverMsgID?.trim();
    return serverID ? `server:${serverID}` : `client:${message.clientMsgID.trim()}`;
}
/** 提取可精确参与历史游标计算的 uint64 seq。 */
function getMessageSequence(message) {
    return normalizeUint64(message.seqString) ?? (Number.isSafeInteger(message.seq) && (message.seq ?? -1) >= 0
        ? String(message.seq)
        : undefined);
}
/** 将未知序列规范为 Gateway uint64 十进制字符串。 */
function normalizeUint64(value) {
    /** candidate 只接受字符串，避免不安全 number 已经丢失精度。 */
    const candidate = typeof value === 'string' ? value.trim() : '';
    if (!/^\d+$/.test(candidate))
        return undefined;
    try {
        /** sequence 用 BigInt 执行上界校验和前导零规范化。 */
        const sequence = BigInt(candidate);
        return sequence <= 18446744073709551615n
            ? sequence.toString()
            : undefined;
    }
    catch {
        return undefined;
    }
}
/** 按精确 seq、发送时间和稳定身份生成确定性的 newest-first 顺序。 */
function compareNewestMessageFirst(left, right) {
    /** leftSequence 优先参与服务端消息排序。 */
    const leftSequence = getMessageSequence(left);
    /** rightSequence 与左侧同时存在时可执行精确比较。 */
    const rightSequence = getMessageSequence(right);
    if (leftSequence && rightSequence && leftSequence !== rightSequence) {
        return BigInt(leftSequence) > BigInt(rightSequence) ? -1 : 1;
    }
    if (left.sendTime !== right.sendTime)
        return right.sendTime - left.sendTime;
    return getMessageIdentity(right).localeCompare(getMessageIdentity(left));
}
//# sourceMappingURL=history-pagination.js.map