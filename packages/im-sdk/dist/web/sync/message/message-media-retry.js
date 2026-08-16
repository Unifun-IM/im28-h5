import { createWebIMSyncError } from '../sync-context.js';
/** 已上传且可直接重放 Gateway body 的媒体消息类型。 */
export const WEB_IM_UPLOADED_MEDIA_RETRY_CONTENT_TYPES = [
    102, 103, 104, 105,
];
/** 判断失败消息是否保存了完整且安全的已上传媒体 checkpoint。 */
export function canRetryWebIMUploadedMediaMessage(message) {
    if (message.direction !== 'outgoing' ||
        message.status !== 'failed' ||
        !isUploadedMediaContentType(message.contentType)) {
        return false;
    }
    try {
        normalizeWebIMUploadedMediaBody(message.contentType, message.payload);
        return true;
    }
    catch {
        return false;
    }
}
/** 从 SQLite payload 严格恢复可直接交给 Gateway 的媒体 body。 */
export function normalizeWebIMUploadedMediaBody(contentType, payload) {
    // body 拒绝数组和隐式类型转换。
    const body = readRecord(payload);
    if (contentType === 102)
        return normalizeImageBody(body);
    if (contentType === 103)
        return normalizeAudioBody(body);
    if (contentType === 104)
        return normalizeVideoBody(body);
    if (contentType === 105)
        return normalizeFileBody(body);
    throw invalidCheckpoint();
}
/** 归一化单图 checkpoint，禁止从本地元数据推测远端对象。 */
function normalizeImageBody(body) {
    // image.list 必须精确包含一个已上传对象。
    const image = readRecord(body.image);
    // list 不接受空数组或多图语义。
    const list = image.list;
    if (!Array.isArray(list) || list.length !== 1)
        throw invalidCheckpoint();
    // item 只读取 Gateway 允许的稳定字段。
    const item = readRecord(list[0]);
    return {
        image: {
            list: [{
                    media_id: readRequiredString(item.media_id),
                    url: readHTTPURL(item.url),
                    thumbnail_url: readHTTPURL(item.thumbnail_url),
                    ...(readOptionalPositiveInteger(item.width, 'width')),
                    ...(readOptionalPositiveInteger(item.height, 'height')),
                    size_bytes: readUint64String(item.size_bytes),
                }],
        },
    };
}
/** 归一化已上传语音 checkpoint，并保持 RN 的 1 到 60 秒约束。 */
function normalizeAudioBody(body) {
    // audio 是 Gateway type103 唯一远端 body owner。
    const audio = readRecord(body.audio);
    return {
        audio: {
            media_id: readRequiredString(audio.media_id),
            url: readHTTPURL(audio.url),
            duration_seconds: readIntegerInRange(audio.duration_seconds, 1, 60),
            size_bytes: readUint64String(audio.size_bytes),
        },
    };
}
/** 归一化已上传视频 checkpoint，缩略图必须同样可远程读取。 */
function normalizeVideoBody(body) {
    // video 只保留跨进程可重放字段。
    const video = readRecord(body.video);
    return {
        video: {
            media_id: readRequiredString(video.media_id),
            url: readHTTPURL(video.url),
            thumbnail_url: readHTTPURL(video.thumbnail_url),
            duration_seconds: readIntegerInRange(video.duration_seconds, 0, Number.MAX_SAFE_INTEGER),
            ...(readOptionalPositiveInteger(video.width, 'width')),
            ...(readOptionalPositiveInteger(video.height, 'height')),
            size_bytes: readUint64String(video.size_bytes),
        },
    };
}
/** 归一化已上传文件 checkpoint，文件名和 MIME 不允许为空。 */
function normalizeFileBody(body) {
    // file 字段足以在重启后直接重放，不依赖原始 File/Blob。
    const file = readRecord(body.file);
    return {
        file: {
            media_id: readRequiredString(file.media_id),
            url: readHTTPURL(file.url),
            name: readRequiredString(file.name),
            mime_type: readRequiredString(file.mime_type),
            size_bytes: readUint64String(file.size_bytes),
        },
    };
}
/** 判断 content type 是否属于已上传媒体重试矩阵。 */
function isUploadedMediaContentType(contentType) {
    return WEB_IM_UPLOADED_MEDIA_RETRY_CONTENT_TYPES.some(value => value === contentType);
}
/** 读取普通对象，拒绝 null、数组和 class coercion。 */
function readRecord(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value))
        throw invalidCheckpoint();
    return value;
}
/** 读取裁剪后的必填字符串。 */
function readRequiredString(value) {
    if (typeof value !== 'string' || !value.trim())
        throw invalidCheckpoint();
    return value.trim();
}
/** 读取仅允许 HTTP(S) 的绝对远端地址。 */
function readHTTPURL(value) {
    // normalized 先完成字符串存在性约束。
    const normalized = readRequiredString(value);
    try {
        // url 使用平台标准解析器拒绝相对地址和畸形输入。
        const url = new URL(normalized);
        if (url.protocol !== 'http:' && url.protocol !== 'https:')
            throw invalidCheckpoint();
        return normalized;
    }
    catch {
        throw invalidCheckpoint();
    }
}
/** 读取十进制 uint64 字符串并保持原精度。 */
function readUint64String(value) {
    // normalized 禁止 number 路径导致 64 位精度丢失。
    const normalized = readRequiredString(value);
    if (!/^(0|[1-9]\d*)$/.test(normalized))
        throw invalidCheckpoint();
    return normalized;
}
/** 读取范围内有限整数。 */
function readIntegerInRange(value, minimum, maximum) {
    if (typeof value !== 'number' || !Number.isInteger(value) || value < minimum || value > maximum) {
        throw invalidCheckpoint();
    }
    return value;
}
/** 将可选正整数转成可展开字段，避免写入 undefined。 */
function readOptionalPositiveInteger(value, key) {
    if (value === undefined)
        return {};
    return { [key]: readIntegerInRange(value, 1, Number.MAX_SAFE_INTEGER) };
}
/** 创建统一的不可重放 checkpoint 错误。 */
function invalidCheckpoint() {
    return createWebIMSyncError('INVALID_UPLOADED_MEDIA_CHECKPOINT', 'The cached media message does not contain a complete uploaded checkpoint.');
}
//# sourceMappingURL=message-media-retry.js.map