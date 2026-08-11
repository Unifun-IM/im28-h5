import { normalizeWebIMUploadedMediaBody } from './message-media-retry.js';
import { checkpointWebIMMessageSendBody, completeWebIMMessageSend, failWebIMMessageSend, prepareWebIMMessageSend, } from './message-send-state.js';
import { createWebIMSyncError } from './sync-context.js';
/** 在短队列写入之间执行长上传，并先持久化可重放远端 body。 */
export async function executeWebIMUploadedMessageSend(context, definition, dependencies) {
    // uploadPort 缺失必须显式失败，不能退化为本地假消息。
    const uploadPort = dependencies.mediaUploadPort;
    if (!uploadPort) {
        throw createWebIMSyncError('MEDIA_UPLOAD_UNAVAILABLE', 'Media sending requires a platform upload adapter.');
    }
    // prepared 只在共享队列内占用 SQLite 写入时段。
    const prepared = await dependencies.mutationQueue.enqueue(() => prepareWebIMMessageSend(context, {
        conversationID: definition.conversationID,
        contentType: definition.contentType,
        payload: definition.localBody,
    }, dependencies));
    try {
        // onSending 只收到已落库实体，页面不得自行生成临时消息身份。
        definition.onSending?.(prepared.localMessage);
        // uploaded 位于队列外，避免大文件上传阻塞 realtime cache 写入。
        const uploaded = await uploadPort.upload(definition.input);
        // remoteBody 必须通过可重放契约后才允许成为 durable checkpoint。
        const remoteBody = normalizeWebIMUploadedMediaBody(definition.contentType, definition.createRemoteBody(uploaded));
        return await dependencies.mutationQueue.enqueue(async () => {
            // checkpointed 保证 Gateway 失败或页面退出后无需再次上传。
            const checkpointed = await checkpointWebIMMessageSendBody(prepared, remoteBody);
            return completeWebIMMessageSend(checkpointed, remoteBody, dependencies);
        });
    }
    catch (cause) {
        return dependencies.mutationQueue.enqueue(() => failWebIMMessageSend(prepared, cause));
    }
}
//# sourceMappingURL=message-upload-send-state.js.map