import { type GatewayHTTPClient, type Message, type MessageHistoryOptions } from '@im28/im-sdk/core';
import type { WebIMMessageSendDependencies } from './message-send-state.js';
import { type WebIMSendAudioMessageOptions } from './message-audio-send.js';
import { type IMMediaUploadPort, type WebIMSendFileMessageOptions, type WebIMSendImageMessageOptions } from './message-media-send.js';
import { type WebIMSendCustomEmojiMessageOptions } from './message-custom-emoji-send.js';
import { type WebIMSendQuoteMessageOptions } from './message-quote-send.js';
import { type WebIMSendTextMessageOptions } from './message-text-send.js';
import { type WebIMSendVideoMessageOptions } from './message-video-send.js';
import { type WebIMRetryMessageOptions } from './message-retry.js';
import { type WebIMForwardMessagesOptions, type WebIMForwardMessagesResult } from './message-forward.js';
import { type WebIMDeleteMessagesOptions, type WebIMDeleteMessagesResult } from './message-delete.js';
import { type WebIMEditTextMessageOptions } from './message-edit.js';
import { type WebIMSyncContextDependencies } from './sync-context.js';
import { type WebIMSyncMutationQueueDependencies } from './sync-mutation-queue.js';
/** Gateway 历史拉取参数保留 uint64 seq 字符串。 */
export interface WebIMPullMessageHistoryOptions {
    readonly conversationID: string;
    readonly fromSeq: string;
    readonly limit?: number;
    readonly desc?: boolean;
}
/** 页面可消费的消息 cache、pull 与 send 能力。 */
export interface WebIMMessageSync {
    getCachedHistory(options: MessageHistoryOptions): Promise<readonly Message[]>;
    getCachedByClientMsgIDs(clientMsgIDs: readonly string[]): Promise<readonly Message[]>;
    pullHistory(options: WebIMPullMessageHistoryOptions): Promise<readonly Message[]>;
    sendText(options: WebIMSendTextMessageOptions): Promise<Message>;
    sendQuote(options: WebIMSendQuoteMessageOptions): Promise<Message>;
    sendCustomEmoji(options: WebIMSendCustomEmojiMessageOptions): Promise<Message>;
    sendAudio(options: WebIMSendAudioMessageOptions): Promise<Message>;
    sendImage(options: WebIMSendImageMessageOptions): Promise<Message>;
    sendVideo(options: WebIMSendVideoMessageOptions): Promise<Message>;
    sendFile(options: WebIMSendFileMessageOptions): Promise<Message>;
    forward(options: WebIMForwardMessagesOptions): Promise<WebIMForwardMessagesResult>;
    delete(options: WebIMDeleteMessagesOptions): Promise<WebIMDeleteMessagesResult>;
    editText(options: WebIMEditTextMessageOptions): Promise<Message>;
    retry(options: WebIMRetryMessageOptions): Promise<Message>;
    recoverInterruptedSends(): Promise<number>;
}
/** 消息同步依赖复用 runtime 的 transport/account/platform owners。 */
export interface WebIMMessageSyncDependencies extends WebIMSyncContextDependencies, WebIMSyncMutationQueueDependencies, WebIMMessageSendDependencies {
    readonly gatewayClient: GatewayHTTPClient;
    readonly mediaUploadPort?: IMMediaUploadPort;
}
/** 创建认证账号绑定的浏览器消息同步服务。 */
export declare function createWebIMMessageSync(dependencies: WebIMMessageSyncDependencies): WebIMMessageSync;
//# sourceMappingURL=message-sync.d.ts.map