import type { GatewayClientMessageBody, Message } from '@im28/im-sdk/core';
import { type WebIMMessageSendDependencies } from './message-send-state.js';
import { type WebIMSyncContext } from './sync-context.js';
/** 用户名片保存发送时的稳定身份和展示快照。 */
export interface IMUserMessageCard {
    readonly type: 'user';
    readonly userID: string;
    readonly nickname: string;
    readonly avatarURL?: string;
}
/** 群名片保存发送时的稳定身份和展示快照。 */
export interface IMGroupMessageCard {
    readonly type: 'group';
    readonly groupID: string;
    readonly groupName: string;
    readonly avatarURL?: string;
}
/** 消息名片只允许用户或群两类 Gateway 已注册结构。 */
export type IMMessageCard = IMUserMessageCard | IMGroupMessageCard;
/** 当前会话名片发送参数不暴露 Gateway body 或本地消息状态。 */
export interface WebIMSendCardMessageOptions {
    readonly conversationID: string;
    readonly card: IMMessageCard;
    readonly onSending?: (message: Message) => void;
}
/** 校验名片身份并复用统一 optimistic、Gateway 与 SQLite 状态机。 */
export declare function sendWebIMCardMessage(context: WebIMSyncContext, options: WebIMSendCardMessageOptions, dependencies: WebIMMessageSendDependencies): Promise<Message>;
/** 从平台中立名片构造 Gateway 规范 body，并冻结展示快照。 */
export declare function createWebIMCardBody(card: IMMessageCard): Extract<GatewayClientMessageBody, {
    readonly card: unknown;
}>;
/** 从持久化 payload 严格恢复可重试的用户名片或群名片 body。 */
export declare function normalizeWebIMCardBody(payload: unknown): Extract<GatewayClientMessageBody, {
    readonly card: unknown;
}>;
//# sourceMappingURL=message-card-send.d.ts.map