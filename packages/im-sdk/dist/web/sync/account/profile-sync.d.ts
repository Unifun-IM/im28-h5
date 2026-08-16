import type { GatewayHTTPClient, GatewayUpdateUserProfileRequest, GatewayUser } from '@im28/im-sdk/core';
import type { IMMediaUploadInput, IMMediaUploadPort } from '../message/message-media-send.js';
/** 页面可消费的当前账号资料能力。 */
export interface WebIMProfileSync {
    getCurrent(): Promise<GatewayUser>;
    update(patch: WebIMProfileUpdate): Promise<GatewayUser>;
    saveContact(input: WebIMProfileContactInput): Promise<WebIMProfileContactResult>;
    uploadAvatar(input: IMMediaUploadInput): Promise<string>;
    updateAvatar(input: IMMediaUploadInput): Promise<GatewayUser>;
}
/** 当前账号联系方式只开放手机号和邮箱两类。 */
export type WebIMProfileContactKind = 'phone' | 'email';
/** 联系方式提交同时携带 Gateway 验证码和手机号区号。 */
export interface WebIMProfileContactInput {
    readonly kind: WebIMProfileContactKind;
    readonly account: string;
    readonly verificationCode: string;
    readonly phoneAreaCode?: '+86';
}
/** 联系方式 mutation 明确返回首次绑定或换绑结果。 */
export interface WebIMProfileContactResult {
    readonly mode: 'bind' | 'update';
    readonly profile: GatewayUser;
}
/** Web 资料编辑开放 RN 完善资料与个人资料共用的字段。 */
export type WebIMProfileUpdate = Pick<GatewayUpdateUserProfileRequest, 'nickname' | 'gender' | 'bio' | 'avatar_url'>;
/** 当前账号资料能力只依赖 runtime 的 Gateway 和认证 owner。 */
export interface WebIMProfileSyncDependencies {
    readonly gatewayClient: GatewayHTTPClient;
    readonly getCurrentUserID: () => string | null;
    readonly mediaUploadPort?: IMMediaUploadPort;
}
/** 平台中立的当前账号资料同步契约。 */
export type IMProfileSync = WebIMProfileSync;
/** 平台中立的当前账号资料同步依赖。 */
export type IMProfileSyncDependencies = WebIMProfileSyncDependencies;
/** 创建不暴露 token 的当前账号资料 facade。 */
export declare function createIMProfileSync(dependencies: IMProfileSyncDependencies): IMProfileSync;
/** 兼容已发布的 Web 命名；实现与 createIMProfileSync 相同。 */
export declare const createWebIMProfileSync: typeof createIMProfileSync;
//# sourceMappingURL=profile-sync.d.ts.map