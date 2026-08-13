import type { GatewayHTTPClient, GatewayUpdateUserProfileRequest, GatewayUser } from '@im28/im-sdk/core';
import type { IMMediaUploadInput, IMMediaUploadPort } from './message-media-send.js';
/** 页面可消费的当前账号资料能力。 */
export interface WebIMProfileSync {
    getCurrent(): Promise<GatewayUser>;
    update(patch: WebIMProfileUpdate): Promise<GatewayUser>;
    uploadAvatar(input: IMMediaUploadInput): Promise<string>;
    updateAvatar(input: IMMediaUploadInput): Promise<GatewayUser>;
}
/** Web 资料编辑开放 RN 完善资料与个人资料共用的字段。 */
export type WebIMProfileUpdate = Pick<GatewayUpdateUserProfileRequest, 'nickname' | 'gender' | 'bio' | 'avatar_url'>;
/** 当前账号资料能力只依赖 runtime 的 Gateway 和认证 owner。 */
export interface WebIMProfileSyncDependencies {
    readonly gatewayClient: GatewayHTTPClient;
    readonly getCurrentUserID: () => string | null;
    readonly mediaUploadPort?: IMMediaUploadPort;
}
/** 创建不暴露 token 的当前账号资料 facade。 */
export declare function createWebIMProfileSync(dependencies: WebIMProfileSyncDependencies): WebIMProfileSync;
//# sourceMappingURL=profile-sync.d.ts.map