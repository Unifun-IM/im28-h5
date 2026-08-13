/** 用户名片二维码的稳定来源标识。 */
export const IM28_USER_QR_SOURCE = 'myCard';
/** 群名片二维码的稳定来源标识。 */
export const IM28_GROUP_QR_SOURCE = 'groupCard';
/** 生成与 RN 当前协议一致的用户名片 JSON。 */
export function buildIM28UserQRCodePayload(userID) {
    return JSON.stringify({
        source: IM28_USER_QR_SOURCE,
        payload: { id: userID.trim() },
    });
}
/** 生成与 RN 当前协议一致的用户名片 URL。 */
export function buildIM28UserQRCodeURL(userID) {
    return `im28://user/${encodeURIComponent(userID.trim())}?source=${IM28_USER_QR_SOURCE}`;
}
/** 生成与 RN 当前协议一致的群名片 JSON。 */
export function buildIM28GroupQRCodePayload(groupID) {
    return JSON.stringify({
        source: IM28_GROUP_QR_SOURCE,
        payload: { id: groupID.trim() },
    });
}
/** 生成与 RN 当前协议一致的群名片 URL。 */
export function buildIM28GroupQRCodeURL(groupID) {
    return `im28://group/${encodeURIComponent(groupID.trim())}?source=${IM28_GROUP_QR_SOURCE}`;
}
/** 解析 RN/Web 共用的 IM28 用户或群二维码协议。 */
export function parseIM28QRCodeTarget(rawText) {
    /** text 排除扫码器可能附带的首尾空白。 */
    const text = rawText.trim();
    if (!text)
        return null;
    return parseIM28QRCodeJSON(text) ?? parseIM28QRCodeURL(text);
}
/** 解析 JSON 以及已发布的旧版用户码。 */
function parseIM28QRCodeJSON(text) {
    try {
        /** value 保留未知输入，后续仅读取受支持字段。 */
        const value = JSON.parse(text);
        /** record 防止数组和标量进入协议判断。 */
        const record = readRecord(value);
        if (!record)
            return null;
        /** source 决定用户码或群码分支。 */
        const source = String(record.source ?? '').trim();
        if (!source)
            return parseLegacyIM28UserQRCode(record);
        /** payload 承载 RN 已发布二维码的业务 ID。 */
        const payload = readRecord(record.payload);
        if (!payload)
            return null;
        if (source === IM28_USER_QR_SOURCE) {
            return createIM28QRCodeTarget('user', source, payload.id ?? payload.userID ?? payload.user_id);
        }
        if (source === IM28_GROUP_QR_SOURCE) {
            return createIM28QRCodeTarget('group', source, payload.id ?? payload.groupID ?? payload.group_id);
        }
        return null;
    }
    catch {
        return null;
    }
}
/** 兼容早期只携带 type/userID 的用户名片 JSON。 */
function parseLegacyIM28UserQRCode(record) {
    if (record.type !== 'im28.user.qrcode')
        return null;
    return createIM28QRCodeTarget('user', IM28_USER_QR_SOURCE, record.userID ?? record.user_id);
}
/** 解析 im28://user 与 im28://group 深链二维码。 */
function parseIM28QRCodeURL(text) {
    /** match 只接受 IM28 已发布的用户/群 host。 */
    const match = /^im28:\/\/(user|group)\/([^?/#]+)(?:\?([^#]*))?$/i.exec(text);
    if (!match)
        return null;
    try {
        /** kind 将 URL host 映射为业务目标。 */
        const kind = match[1]?.toLowerCase() === 'group' ? 'group' : 'user';
        /** id 解码 URL 中的用户或群标识。 */
        const id = decodeURIComponent(match[2] ?? '').trim();
        if (!id)
            return null;
        /** expectedSource 防止伪造跨类型 source。 */
        const expectedSource = kind === 'group' ? IM28_GROUP_QR_SOURCE : IM28_USER_QR_SOURCE;
        /** params 读取可选 source，缺省保持 RN 默认行为。 */
        const params = new URLSearchParams(match[3] ?? '');
        if ((params.get('source') || expectedSource) !== expectedSource)
            return null;
        return kind === 'group'
            ? createIM28QRCodeTarget('group', IM28_GROUP_QR_SOURCE, id)
            : createIM28QRCodeTarget('user', IM28_USER_QR_SOURCE, id);
    }
    catch {
        return null;
    }
}
/** 建立经过 ID 非空校验的二维码目标。 */
function createIM28QRCodeTarget(kind, source, rawID) {
    /** id 统一数字及字符串来源并移除空白。 */
    const id = String(rawID ?? '').trim();
    if (!id)
        return null;
    return kind === 'group'
        ? { kind, source: IM28_GROUP_QR_SOURCE, id }
        : { kind, source: IM28_USER_QR_SOURCE, id };
}
/** 将未知 JSON 值收窄为普通对象。 */
function readRecord(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value))
        return null;
    return value;
}
//# sourceMappingURL=payload.js.map