import { executeWebIMUploadedMessageSend, isPositiveMediaDimension, normalizeWebIMMediaInput, } from './message-media-send.js';
/** 视频消息允许的单文件最大字节数，与 RN 生产约束一致。 */
export const WEB_IM_VIDEO_MAX_BYTES = 500 * 1024 * 1024;
/** 发送视频并复用媒体上传和 optimistic SQLite 状态机。 */
export async function sendWebIMVideoMessage(context, options, dependencies) {
    // input 在本地消息落库前校验 source、MIME 和 500 MB 上限。
    const input = normalizeWebIMMediaInput(options, WEB_IM_VIDEO_MAX_BYTES, 'video');
    // metadata 统一归一化时长和显示尺寸。
    const metadata = buildWebIMVideoMetadata(options, input.size);
    // localBody 不持久化临时 blob URL，刷新后仍可展示稳定视频占位。
    const localBody = { video: metadata };
    return executeWebIMUploadedMessageSend(context, {
        conversationID: options.conversationID,
        contentType: 104,
        localBody,
        input,
        ...(options.onSending ? { onSending: options.onSending } : {}),
        createRemoteBody: uploaded => ({
            video: {
                media_id: uploaded.objectKey,
                url: uploaded.url,
                thumbnail_url: buildWebIMVideoSnapshotURL(uploaded.url, metadata),
                ...metadata,
            },
        }),
    }, dependencies);
}
/** 构造与 RN 一致的 OSS 7 秒视频快照 URL。 */
export function buildWebIMVideoSnapshotURL(videoURL, dimensions) {
    // sizeParams 只在宽高同时有效时写入，避免变形参数。
    const sizeParams = dimensions.width && dimensions.height
        ? `,w_${dimensions.width},h_${dimensions.height}`
        : '';
    // separator 保留凭证 URL 已有 query。
    const separator = videoURL.includes('?') ? '&' : '?';
    return `${videoURL}${separator}x-oss-process=video/snapshot,t_7000,f_jpg${sizeParams},m_fast,ar_auto`;
}
/** 归一化 Gateway video body 的时长、尺寸和精确字节数。 */
function buildWebIMVideoMetadata(options, size) {
    // durationSeconds 使用 RN 的四舍五入和非负规则。
    const durationSeconds = Math.max(0, Math.round(options.durationSeconds || 0));
    // width 与 height 来自浏览器解码后的整数像素。
    const width = normalizePositiveInteger(options.width);
    const height = normalizePositiveInteger(options.height);
    return {
        duration_seconds: durationSeconds,
        ...(isPositiveMediaDimension(width) ? { width } : {}),
        ...(isPositiveMediaDimension(height) ? { height } : {}),
        size_bytes: String(size),
    };
}
/** 将浏览器媒体尺寸收敛为正整数。 */
function normalizePositiveInteger(value) {
    return Number.isFinite(value) && value > 0 ? Math.round(value) : 0;
}
//# sourceMappingURL=message-video-send.js.map