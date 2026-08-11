import type { GatewayHTTPClient } from '@im28/im-sdk/core';
import { type IMConversationAutoDeleteSetting } from './conversation-auto-delete-sync.js';
import { type IMConversationSetting } from './conversation-setting-sync.js';
import type { WebIMSyncContextDependencies } from './sync-context.js';
import { type WebIMSyncMutationQueueDependencies } from './sync-mutation-queue.js';
/** 平台中立的会话设置 facade，统一 RN/Web/Desktop 的业务语义。 */
export interface IMConversationSettingsSync {
    /** 读取服务端确认的会话设置并收敛当前账号缓存。 */
    getSetting(conversationID: string): Promise<IMConversationSetting>;
    /** 成功更新服务端后收敛免打扰状态。 */
    setMuted(conversationID: string, isMuted: boolean): Promise<IMConversationSetting>;
    /** 成功更新服务端后收敛置顶状态。 */
    setPinned(conversationID: string, isPinned: boolean): Promise<IMConversationSetting>;
    /** 读取服务端确认的自动删除设置。 */
    getAutoDelete(conversationID: string): Promise<IMConversationAutoDeleteSetting>;
    /** 成功更新服务端后收敛自动删除设置。 */
    setAutoDelete(conversationID: string, autoDeleteSeconds: number): Promise<IMConversationAutoDeleteSetting>;
}
/** 中性 facade 只接收当前账号数据库、Gateway 与可注入时钟。 */
export interface IMConversationSettingsSyncDependencies extends WebIMSyncContextDependencies, WebIMSyncMutationQueueDependencies {
    readonly gatewayClient: GatewayHTTPClient;
    readonly now?: () => number;
}
/** 创建 RN/Web/Desktop 共用的会话设置业务 facade。 */
export declare function createIMConversationSettingsSync(dependencies: IMConversationSettingsSyncDependencies): IMConversationSettingsSync;
//# sourceMappingURL=conversation-settings.d.ts.map