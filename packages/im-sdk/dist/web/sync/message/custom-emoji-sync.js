import { CustomEmojiRepository, mapGatewayCustomEmojiToCore, normalizeCustomEmojiID, } from '@im28/im-sdk/core';
import { WEB_IM_IMAGE_MAX_BYTES, } from './message-media-send.js';
import { requireWebIMSyncContext, } from '../sync-context.js';
import { createWebIMSyncMutationQueue, } from '../sync-mutation-queue.js';
/** Gateway 单批允许创建的最大表情数量。 */
export const CUSTOM_EMOJI_CREATE_MAX_COUNT = 20;
/** 客户端允许上传的自定义表情扩展名。 */
const CUSTOM_EMOJI_IMAGE_EXTENSIONS = new Set([
    'jpg',
    'jpeg',
    'png',
    'gif',
    'webp',
]);
/** 扩展名与浏览器 MIME 必须匹配，避免伪装图片进入 OSS。 */
const CUSTOM_EMOJI_MIME_BY_EXTENSION = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
};
/** 创建认证账号绑定的自定义表情同步服务。 */
export function createIMCustomEmojiSync(dependencies) {
    return new WebIMCustomEmojiSyncImpl(dependencies);
}
/** 兼容已发布的 Web 命名；实现与 createIMCustomEmojiSync 相同。 */
export const createWebIMCustomEmojiSync = createIMCustomEmojiSync;
/** 自定义表情同步实现只在完整响应校验成功后替换 SQLite 快照。 */
class WebIMCustomEmojiSyncImpl {
    // dependencies 动态读取 runtime 当前认证账号和数据库。
    dependencies;
    // mutationQueue 与消息、会话同步共享时避免并发写竞争。
    mutationQueue;
    /** 保存 runtime owners，不复制 token 或数据库生命周期。 */
    constructor(dependencies) {
        this.dependencies = dependencies;
        this.mutationQueue =
            dependencies.mutationQueue ?? createWebIMSyncMutationQueue();
    }
    /** 读取当前认证账号的本地完整快照。 */
    async listCached() {
        // context 阻止匿名页面读取上一个账号的缓存。
        const context = requireWebIMSyncContext(this.dependencies, 'Custom emoji sync');
        return new CustomEmojiRepository(context.database).list();
    }
    /** 拉取全量列表并在共享写队列中原子替换缓存。 */
    async sync() {
        // context 在入队前固定本轮账号 owner。
        const context = requireWebIMSyncContext(this.dependencies, 'Custom emoji sync');
        return this.mutationQueue.enqueue(async () => {
            return this.replaceFromRemote(context.database);
        });
    }
    /** 完整上传本批图片后创建表情，并以远端列表收敛成员事实。 */
    async create(inputs) {
        // context 在任何上传前拒绝匿名调用。
        const context = requireWebIMSyncContext(this.dependencies, 'Custom emoji create');
        // normalizedInputs 在 I/O 前完整校验批次约束。
        const normalizedInputs = normalizeCustomEmojiUploadInputs(inputs);
        // uploadPort 缺失时不得生成本地临时成功项。
        const uploadPort = this.dependencies.mediaUploadPort;
        if (!uploadPort) {
            throw new TypeError('Custom emoji creation requires a media upload adapter.');
        }
        // uploads 串行执行，任一失败会阻止 create 请求。
        const uploads = [];
        for (const input of normalizedInputs) {
            uploads.push(await uploadPort.upload(input));
        }
        return this.mutationQueue.enqueue(async () => {
            // objectKeys 只来自已成功完成的上传结果。
            const objectKeys = uploads.map(upload => upload.objectKey.trim());
            if (objectKeys.some(objectKey => !objectKey)) {
                throw new TypeError('Custom emoji upload returned an empty object key.');
            }
            // createdResponse 必须完整验证，防止畸形成功响应被忽略。
            const createdResponse = await this.dependencies.gatewayClient.createCustomEmojis({
                object_keys: objectKeys,
            });
            // created 验证服务端确实为本批返回了正式实体。
            const created = (createdResponse.list ?? []).map(item => mapGatewayCustomEmojiToCore(item.emoji ?? {}));
            if (created.length !== objectKeys.length) {
                throw new TypeError('Custom emoji create response is incomplete.');
            }
            return this.replaceFromRemote(context.database);
        });
    }
    /** 收藏收到的表情，并用完整远端列表更新账号缓存。 */
    async add(emojiID) {
        // context 在请求前固定当前账号数据库。
        const context = requireWebIMSyncContext(this.dependencies, 'Custom emoji add');
        // normalizedID 禁止空 ID 进入 Gateway body。
        const normalizedID = normalizeCustomEmojiID(emojiID);
        return this.mutationQueue.enqueue(async () => {
            // responseEmoji 验证 add 响应为可展示正式实体。
            const response = await this.dependencies.gatewayClient.addCustomEmoji({
                emoji_id: normalizedID,
            });
            mapGatewayCustomEmojiToCore(response.emoji ?? {});
            return this.replaceFromRemote(context.database);
        });
    }
    /** Gateway 批量删除成功后才移除 SQLite rows。 */
    async delete(emojiIDs) {
        // context 即使空批次也阻止匿名读取旧账号缓存。
        const context = requireWebIMSyncContext(this.dependencies, 'Custom emoji delete');
        // normalizedIDs 去空去重并保留调用顺序。
        const normalizedIDs = deduplicateCustomEmojiIDs(emojiIDs);
        // repository 负责返回当前账号最终快照。
        const repository = new CustomEmojiRepository(context.database);
        if (!normalizedIDs.length)
            return repository.list();
        return this.mutationQueue.enqueue(async () => {
            await this.dependencies.gatewayClient.deleteCustomEmojis({
                emoji_ids: normalizedIDs,
            });
            await repository.deleteByIDs(normalizedIDs);
            return repository.list();
        });
    }
    /** 获取、验证并原子替换当前账号的完整远端快照。 */
    async replaceFromRemote(database) {
        // response 失败或任一元素非法时不会触碰旧缓存。
        const response = await this.dependencies.gatewayClient.listCustomEmojis();
        // emojis 先完整映射，并按 emoji ID 保留远端第一项。
        const emojis = deduplicateCustomEmojis((response.list ?? []).map(item => mapGatewayCustomEmojiToCore(item.emoji ?? {})));
        // repository 的 transaction 提供删除与重建的原子性。
        const repository = new CustomEmojiRepository(database);
        await repository.replaceAll(emojis);
        return repository.list();
    }
}
/** 在任何 I/O 前验证 create 批次及图片文件约束。 */
function normalizeCustomEmojiUploadInputs(inputs) {
    if (!inputs.length)
        throw new TypeError('Select at least one custom emoji image.');
    if (inputs.length > CUSTOM_EMOJI_CREATE_MAX_COUNT) {
        throw new TypeError('Custom emoji creation accepts at most 20 images.');
    }
    return inputs.map(input => {
        // extension 与 Gateway 图片白名单使用同一小写格式。
        const extension = input.extension.trim().replace(/^\./, '').toLowerCase();
        if (!CUSTOM_EMOJI_IMAGE_EXTENSIONS.has(extension)) {
            throw new TypeError('Custom emoji image format is unsupported.');
        }
        if (!Number.isFinite(input.size) || input.size <= 0 || input.size > WEB_IM_IMAGE_MAX_BYTES) {
            throw new TypeError('Custom emoji image size is invalid.');
        }
        // mimeType 必须与扩展名白名单精确对应。
        const mimeType = input.mimeType.trim().toLowerCase();
        if (CUSTOM_EMOJI_MIME_BY_EXTENSION[extension] !== mimeType) {
            throw new TypeError('Custom emoji image MIME does not match its extension.');
        }
        return { ...input, extension, mimeType };
    });
}
/** 规范化、去空并按首次出现顺序去重稳定 ID。 */
function deduplicateCustomEmojiIDs(emojiIDs) {
    // seen 记录已经进入请求的稳定 ID。
    const seen = new Set();
    return emojiIDs.flatMap(emojiID => {
        // normalizedID 对空白 ID 直接忽略，避免空删除请求。
        const normalizedID = emojiID.trim();
        if (!normalizedID || seen.has(normalizedID))
            return [];
        seen.add(normalizedID);
        return [normalizeCustomEmojiID(normalizedID)];
    });
}
/** 按服务端顺序去重同一稳定 ID，避免重复主键破坏整批写入。 */
function deduplicateCustomEmojis(emojis) {
    // seen 只记录稳定 ID，不改变首项顺序。
    const seen = new Set();
    return emojis.filter(emoji => {
        if (seen.has(emoji.emojiID))
            return false;
        seen.add(emoji.emojiID);
        return true;
    });
}
//# sourceMappingURL=custom-emoji-sync.js.map