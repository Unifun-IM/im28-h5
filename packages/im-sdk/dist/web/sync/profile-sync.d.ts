import type { GatewayHTTPClient, GatewayUpdateUserProfileRequest, GatewayUser } from '@im28/im-sdk/core';
/** 页面可消费的当前账号资料能力。 */
export interface WebIMProfileSync {
    getCurrent(): Promise<GatewayUser>;
    update(patch: WebIMProfileUpdate): Promise<GatewayUser>;
}
/** Web 资料编辑只开放本切片已迁移的三个字段。 */
export type WebIMProfileUpdate = Pick<GatewayUpdateUserProfileRequest, 'nickname' | 'gender' | 'bio'>;
/** 当前账号资料能力只依赖 runtime 的 Gateway 和认证 owner。 */
export interface WebIMProfileSyncDependencies {
    readonly gatewayClient: GatewayHTTPClient;
    readonly getCurrentUserID: () => string | null;
}
/** 创建不暴露 token 的当前账号资料 facade。 */
export declare function createWebIMProfileSync(dependencies: WebIMProfileSyncDependencies): WebIMProfileSync;
//# sourceMappingURL=profile-sync.d.ts.map