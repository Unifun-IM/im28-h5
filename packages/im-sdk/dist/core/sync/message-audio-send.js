import { executeWebIMUploadedMessageSend, normalizeWebIMMediaInput, } from './message-media-send.js';
import { createWebIMSyncError } from './sync-context.js';
/** 语音消息最长时长，与 RN 自动停止规则一致。 */
export const WEB_IM_AUDIO_MAX_DURATION_SECONDS = 60;
/** 语音 Blob 仅执行 JS 安全整数约束，产品大小由 60 秒时长限制。 */
const WEB_IM_AUDIO_MAX_SAFE_BYTES = Number.MAX_SAFE_INTEGER;
/** 发送语音并复用媒体上传和 optimistic SQLite 状态机。 */
export async function sendWebIMAudioMessage(context, options, dependencies) {
    // durationSeconds 在落库和上传前按 Gateway/RN 范围归一化。
    const durationSeconds = normalizeWebIMAudioDuration(options.durationSeconds);
    // input 保留浏览器录音器实际 MIME、扩展名与精确字节数。
    const input = normalizeWebIMMediaInput(options, WEB_IM_AUDIO_MAX_SAFE_BYTES, 'audio');
    // metadata 让 sending/failed 气泡无需临时 Blob URL 也可展示时长。
    const metadata = {
        duration_seconds: durationSeconds,
        size_bytes: String(input.size),
    };
    // localBody 不持久化麦克风 Blob 或本地 object URL。
    const localBody = { audio: metadata };
    return executeWebIMUploadedMessageSend(context, {
        conversationID: options.conversationID,
        contentType: 103,
        localBody,
        input,
        ...(options.onSending ? { onSending: options.onSending } : {}),
        createRemoteBody: uploaded => ({
            audio: {
                media_id: uploaded.objectKey,
                url: uploaded.url,
                ...metadata,
            },
        }),
    }, dependencies);
}
/** 将语音时长限制为 Gateway 可接受的 1–60 秒整数。 */
function normalizeWebIMAudioDuration(value) {
    // duration 使用 RN 的四舍五入策略。
    const duration = Math.round(value);
    if (!Number.isFinite(value) ||
        duration < 1 ||
        duration > WEB_IM_AUDIO_MAX_DURATION_SECONDS) {
        throw createWebIMSyncError('AUDIO_DURATION_INVALID', 'Audio duration must be between 1 and 60 seconds.');
    }
    return duration;
}
//# sourceMappingURL=message-audio-send.js.map