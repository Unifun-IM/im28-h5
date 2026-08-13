import { normalizeWebIMUploadedMediaBody } from './message-media-retry.js';
import { createWebIMSyncError } from './sync-context.js';
/** 上传一次群发媒体并返回通过严格重放校验的 Gateway body。 */
export async function uploadIMBroadcastMedia(definition, dependencies) {
    /** uploadPort 缺失时必须显式失败，不能降级成文本或本地假成功。 */
    const uploadPort = dependencies.mediaUploadPort;
    if (!uploadPort) {
        throw createWebIMSyncError('MEDIA_UPLOAD_UNAVAILABLE', 'Media broadcast requires a platform upload adapter.');
    }
    /** uploaded 是整批目标共同引用的唯一远端对象。 */
    const uploaded = await uploadPort.upload(definition.input);
    /** remoteBody 拒绝不完整 URL、对象身份和媒体元数据。 */
    const remoteBody = definition.createRemoteBody(uploaded);
    return normalizeWebIMUploadedMediaBody(definition.contentType, remoteBody);
}
//# sourceMappingURL=message-broadcast-media.js.map