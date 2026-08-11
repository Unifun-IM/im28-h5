import { type CustomEmoji, type GatewayHTTPClient } from '@im28/im-sdk/core';
import { type IMMediaUploadInput, type IMMediaUploadPort } from './message-media-send.js';
import { type WebIMSyncContextDependencies } from './sync-context.js';
import { type WebIMSyncMutationQueueDependencies } from './sync-mutation-queue.js';
/** 自定义表情缓存和远端同步 facade。 */
export interface WebIMCustomEmojiSync {
    /** 读取当前账号缓存。 */
    listCached(): Promise<readonly CustomEmoji[]>;
    /** 用完整远端列表替换当前账号缓存。 */
    sync(): Promise<readonly CustomEmoji[]>;
    /** 上传图片并通过真实 Gateway 创建表情。 */
    create(inputs: readonly IMMediaUploadInput[]): Promise<readonly CustomEmoji[]>;
    /** 收藏收到的稳定表情 ID。 */
    add(emojiID: string): Promise<readonly CustomEmoji[]>;
    /** 服务端删除成功后收敛本地缓存。 */
    delete(emojiIDs: readonly string[]): Promise<readonly CustomEmoji[]>;
}
/** 自定义表情同步复用认证、账号数据库和全局写队列。 */
export interface WebIMCustomEmojiSyncDependencies extends WebIMSyncContextDependencies, WebIMSyncMutationQueueDependencies {
    readonly gatewayClient: GatewayHTTPClient;
    readonly mediaUploadPort?: IMMediaUploadPort;
}
/** Gateway 单批允许创建的最大表情数量。 */
export declare const CUSTOM_EMOJI_CREATE_MAX_COUNT = 20;
/** 创建认证账号绑定的自定义表情同步服务。 */
export declare function createWebIMCustomEmojiSync(dependencies: WebIMCustomEmojiSyncDependencies): WebIMCustomEmojiSync;
//# sourceMappingURL=custom-emoji-sync.d.ts.map