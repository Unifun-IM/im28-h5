import type { GatewayHTTPClient } from '@im28/im-sdk/core';
import type { WebIMContact } from './contact-sync.js';
/** 页面消费的黑名单用户模型。 */
export interface WebIMBlacklistUser {
    readonly userID: string;
    readonly displayName: string;
    readonly account: string;
    readonly avatarURL: string;
    readonly isFriend: boolean;
    readonly createdAt: string;
}
/** 黑名单分页参数。 */
export interface WebIMBlacklistListOptions {
    readonly pageSize?: number;
}
/** 页面可消费的认证黑名单能力。 */
export interface WebIMBlacklistSync {
    list(options?: WebIMBlacklistListOptions): Promise<readonly WebIMBlacklistUser[]>;
    has(userID: string): Promise<boolean>;
    remove(userID: string): Promise<void>;
}
/** 黑名单 facade 复用 shared Gateway 与既有联系人 owner。 */
export interface WebIMBlacklistSyncDependencies {
    readonly gatewayClient: GatewayHTTPClient;
    readonly getCurrentUserID: () => string | null;
    readonly listContacts: () => Promise<readonly WebIMContact[]>;
}
/** 创建只通过 shared operations 读写黑名单的 Web facade。 */
export declare function createWebIMBlacklistSync(dependencies: WebIMBlacklistSyncDependencies): WebIMBlacklistSync;
//# sourceMappingURL=blacklist-sync.d.ts.map