import { type GatewayHTTPClient } from '@im28/im-sdk/core';
import { type WebIMSyncContextDependencies } from '../sync-context.js';
import { type WebIMSyncMutationQueueDependencies } from '../sync-mutation-queue.js';
/** 会话设置快照只暴露页面需要且可由 Gateway 明确确认的字段。 */
export interface WebIMConversationSetting {
    readonly conversationID: string;
    readonly isPinned: boolean;
    readonly pinnedAt: number;
    readonly isMuted: boolean;
    readonly manualUnread?: boolean;
    readonly autoDeleteSeconds?: number;
}
/** 中性名称供 RN/Web/Desktop facade 使用，旧名称仅保留兼容。 */
export type IMConversationSetting = WebIMConversationSetting;
/** 会话设置 facade 只公开一个读取和两个非破坏性 mutation。 */
export interface WebIMConversationSettingSync {
    getSetting(conversationID: string): Promise<WebIMConversationSetting>;
    setMuted(conversationID: string, isMuted: boolean): Promise<WebIMConversationSetting>;
    setPinned(conversationID: string, isPinned: boolean): Promise<WebIMConversationSetting>;
}
/** 会话设置服务复用聚合 runtime 的认证、Gateway 和共享 mutation queue。 */
export interface WebIMConversationSettingSyncDependencies extends WebIMSyncContextDependencies, WebIMSyncMutationQueueDependencies {
    readonly gatewayClient: GatewayHTTPClient;
    readonly now?: () => number;
}
/** 创建账号绑定的会话设置服务。 */
export declare function createWebIMConversationSettingSync(dependencies: WebIMConversationSettingSyncDependencies): WebIMConversationSettingSync;
//# sourceMappingURL=conversation-setting-sync.d.ts.map