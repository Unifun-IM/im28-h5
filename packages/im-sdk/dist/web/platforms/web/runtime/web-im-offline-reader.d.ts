import type { ConversationListOptions, DatabaseAdapter, Message, MessageHistoryOptions } from '@im28/im-sdk/core';
import { type WebIMConversationListItem } from '../../../sync/conversation-sync.js';
/** 离线 reader 每次读取前获取由 runtime 状态门禁的账号上下文。 */
export interface WebIMOfflineReadContext {
    readonly userID: string;
    readonly database: DatabaseAdapter;
}
/** 离线 reader 依赖不包含 Gateway、token、WebSocket 或 mutation port。 */
export interface WebIMOfflineReaderDependencies {
    readonly getContext: () => WebIMOfflineReadContext | null;
}
/** 冷启动离线状态唯一允许的 cache-only 查询能力。 */
export interface WebIMOfflineReader {
    readonly conversations: {
        listCachedItems(options?: ConversationListOptions): Promise<readonly WebIMConversationListItem[]>;
    };
    readonly messages: {
        getCachedHistory(options: MessageHistoryOptions): Promise<readonly Message[]>;
    };
}
/** 创建没有写入、远端同步或 realtime 表面的离线 reader。 */
export declare function createWebIMOfflineReader(dependencies: WebIMOfflineReaderDependencies): WebIMOfflineReader;
//# sourceMappingURL=web-im-offline-reader.d.ts.map