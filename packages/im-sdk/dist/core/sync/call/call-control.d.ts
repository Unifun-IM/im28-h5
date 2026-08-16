import type { GatewayCall, GatewayCallType, GatewayHTTPClient } from '@im28/im-sdk/core';
import { type WebIMSyncContextDependencies } from '../sync-context.js';
/** 通话媒体凭证由共享控制面归一化，媒体房间仍由平台 adapter 消费。 */
export interface IMCallCredential {
    readonly serverUrl: string;
    readonly token: string;
}
/** 需要加入媒体房间的通话控制结果。 */
export interface IMCallTokenResult {
    readonly call: GatewayCall & {
        readonly call_id: string;
    };
    readonly credential: IMCallCredential;
    readonly e2eeRequired: false;
    readonly expiresIn?: number;
}
/** 发起单聊通话所需的稳定会话和幂等身份。 */
export interface IMStartCallOptions {
    readonly conversationID: string;
    readonly callType: GatewayCallType;
    readonly clientCallID?: string;
}
/** RN、Web 与 Desktop 共用的通话控制面。 */
export interface IMCallControlSync {
    start(options: IMStartCallOptions): Promise<IMCallTokenResult>;
    answer(callID: string, deviceID?: string): Promise<IMCallTokenResult>;
    reject(callID: string): Promise<GatewayCall | undefined>;
    cancel(callID: string): Promise<GatewayCall | undefined>;
    hangup(callID: string, reason?: string): Promise<GatewayCall | undefined>;
    refreshToken(callID: string): Promise<IMCallTokenResult>;
}
/** 通话控制面只依赖认证账号、Gateway、ID 和平台 URL adapter。 */
export interface IMCallControlSyncDependencies extends WebIMSyncContextDependencies {
    readonly gatewayClient: GatewayHTTPClient;
    readonly createClientMessageID?: () => string;
    readonly normalizeCallServerURL?: (serverURL: string) => string;
}
/** 创建跨端共用的通话控制 facade。 */
export declare function createIMCallControlSync(dependencies: IMCallControlSyncDependencies): IMCallControlSync;
/** 规范化 HTTP(S)/WS(S) LiveKit 地址，不做平台网络可达性猜测。 */
export declare function normalizeIMCallServerURL(serverURL: string): string;
//# sourceMappingURL=call-control.d.ts.map