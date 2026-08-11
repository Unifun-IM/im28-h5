import {} from './message-send-state.js';
import { executeWebIMUploadedMessageSend } from './message-upload-send-state.js';
import { createWebIMSyncError } from './sync-context.js';
/** 图片消息允许的单文件最大字节数。 */
export const WEB_IM_IMAGE_MAX_BYTES = 10 * 1024 * 1024;
/** 普通文件消息允许的单文件最大字节数。 */
export const WEB_IM_FILE_MAX_BYTES = 100 * 1024 * 1024;
/** 发送一张图片并跨上传阶段收敛本地消息状态。 */
export async function sendWebIMImageMessage(context, options, dependencies) {
    // input 在写入 sending row 前完成业务约束校验。
    const input = normalizeWebIMMediaInput(options, WEB_IM_IMAGE_MAX_BYTES, 'image');
    // localBody 不持久化临时 blob URL，刷新后仍保持有效 JSON。
    const localBody = {
        image: {
            list: [buildImageMetadata(options, input.size)],
        },
    };
    return executeWebIMUploadedMessageSend(context, {
        conversationID: options.conversationID,
        contentType: 102,
        localBody,
        input,
        ...(options.onSending ? { onSending: options.onSending } : {}),
        createRemoteBody: uploaded => ({
            image: {
                list: [
                    {
                        media_id: uploaded.objectKey,
                        url: uploaded.url,
                        thumbnail_url: uploaded.url,
                        ...buildImageMetadata(options, input.size),
                    },
                ],
            },
        }),
    }, dependencies);
}
/** 发送一个普通文件并保留可重读的本地元数据。 */
export async function sendWebIMFileMessage(context, options, dependencies) {
    // input 使用普通文件上限，不按扩展名伪造 MIME。
    const input = normalizeWebIMMediaInput(options, WEB_IM_FILE_MAX_BYTES, 'file');
    // fileBody 允许 sending/failed bubble 立即展示文件名和大小。
    const fileBody = {
        file: {
            name: input.name,
            mime_type: input.mimeType,
            size_bytes: String(input.size),
        },
    };
    return executeWebIMUploadedMessageSend(context, {
        conversationID: options.conversationID,
        contentType: 105,
        localBody: fileBody,
        input,
        ...(options.onSending ? { onSending: options.onSending } : {}),
        createRemoteBody: uploaded => ({
            file: {
                media_id: uploaded.objectKey,
                url: uploaded.url,
                name: input.name,
                mime_type: input.mimeType,
                size_bytes: String(input.size),
            },
        }),
    }, dependencies);
}
/** 归一化文件元数据并执行种类对应的大小约束。 */
export function normalizeWebIMMediaInput(options, maxBytes, kind) {
    // name 用于凭证扩展名与远端文件展示。
    const name = options.name.trim();
    // mimeType 空值使用通用二进制类型，不猜测内容。
    const mimeType = options.mimeType.trim() || 'application/octet-stream';
    // size 必须是浏览器报告的有限非负整数。
    const size = Math.trunc(options.size);
    if (!name || options.source === null || options.source === undefined) {
        throw createWebIMSyncError('MEDIA_SOURCE_INVALID', 'Media sending requires a source and file name.');
    }
    if (!Number.isFinite(options.size) || size < 0 || size > maxBytes) {
        throw createWebIMSyncError('MEDIA_SIZE_INVALID', `${mediaKindLabel(kind)} size exceeds the allowed limit.`);
    }
    // expectedMimePrefix 让三类可解码媒体执行同一 MIME 规则。
    const expectedMimePrefix = kind === 'file' ? '' : `${kind}/`;
    if (expectedMimePrefix && !mimeType.startsWith(expectedMimePrefix)) {
        throw createWebIMSyncError(`${kind.toUpperCase()}_MIME_INVALID`, `${mediaKindLabel(kind)} sending requires an ${kind} MIME type.`);
    }
    return {
        source: options.source,
        name,
        mimeType,
        size,
        extension: inferWebIMUploadExtension(name, kind === 'image'
            ? 'jpg'
            : kind === 'audio'
                ? 'm4a'
                : kind === 'video'
                    ? 'mp4'
                    : 'bin'),
    };
}
/** 提取图片 body 可复用的尺寸与字节字段。 */
function buildImageMetadata(options, size) {
    return {
        ...(isPositiveMediaDimension(options.width) ? { width: options.width } : {}),
        ...(isPositiveMediaDimension(options.height)
            ? { height: options.height }
            : {}),
        size_bytes: String(size),
    };
}
/** 判断图片尺寸是否可安全写入 Gateway body。 */
export function isPositiveMediaDimension(value) {
    return Number.isFinite(value) && (value ?? 0) > 0;
}
/** 从文件名提取 OSS credential 使用的安全扩展名。 */
function inferWebIMUploadExtension(name, fallback) {
    // candidate 只取最后一个点后的片段，避免路径和查询参数污染。
    const candidate = name.split('.').pop()?.toLowerCase() ?? '';
    // extension 遵守 RN upload service 的字母数字约束。
    const extension = candidate.replace(/[^a-z0-9]/g, '');
    return extension && extension !== name.toLowerCase() ? extension : fallback;
}
/** 将媒体种类转换为稳定英文错误前缀。 */
function mediaKindLabel(kind) {
    if (kind === 'image')
        return 'Image';
    if (kind === 'audio')
        return 'Audio';
    if (kind === 'video')
        return 'Video';
    return 'File';
}
//# sourceMappingURL=message-media-send.js.map