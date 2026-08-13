import type { GatewayHTTPClient, Message, MessageHistoryOptions, MessageSearchOptions } from '@im28/im-sdk/core';
import type { WebIMDeleteMessagesOptions, WebIMDeleteMessagesResult } from './message-delete.js';
import type { WebIMEditTextMessageOptions } from './message-edit.js';
import type { IMGroupMentionSync } from './group-mention.js';
import type { WebIMForwardMessagesOptions, WebIMForwardMessagesResult } from './message-forward.js';
import type { WebIMForwardMessagesToTargetsOptions, WebIMForwardMessagesToTargetsResult } from './message-forward-targets.js';
import type { WebIMSendAudioMessageOptions } from './message-audio-send.js';
import type { WebIMSendCardMessageOptions } from './message-card-send.js';
import type { WebIMSendCustomEmojiMessageOptions } from './message-custom-emoji-send.js';
import type { WebIMSendMentionMessageOptions } from './message-mention-send.js';
import type { IMMediaUploadPort, WebIMSendFileMessageOptions, WebIMSendImageMessageOptions } from './message-media-send.js';
import type { WebIMSendQuoteMessageOptions } from './message-quote-send.js';
import type { WebIMRetryMessageOptions } from './message-retry.js';
import type { WebIMMessageSendDependencies } from './message-send-state.js';
import type { WebIMSendTextMessageOptions } from './message-text-send.js';
import type { WebIMSendVideoMessageOptions } from './message-video-send.js';
import type { WebIMSyncContextDependencies } from './sync-context.js';
import type { WebIMSyncMutationQueueDependencies } from './sync-mutation-queue.js';
/** Gateway 历史拉取参数保留 uint64 seq 字符串。 */
export interface WebIMPullMessageHistoryOptions {
    readonly conversationID: string;
    readonly fromSeq: string;
    readonly limit?: number;
    readonly desc?: boolean;
}
/** 单页历史拉取结果保留服务端分页事实与本次已持久化消息。 */
export interface WebIMPullMessageHistoryResult {
    readonly messages: readonly Message[];
    readonly hasMore: boolean;
    readonly nextSeq?: string;
}
/** 页面可消费的消息 cache、pull 与 send 能力。 */
export interface WebIMMessageSync {
    getCachedHistory(options: MessageHistoryOptions): Promise<readonly Message[]>;
    searchCached(options: MessageSearchOptions): Promise<readonly Message[]>;
    getCachedByClientMsgIDs(clientMsgIDs: readonly string[]): Promise<readonly Message[]>;
    getCachedByStableMsgIDs(messageIDs: readonly string[]): Promise<readonly Message[]>;
    pullHistory(options: WebIMPullMessageHistoryOptions): Promise<readonly Message[]>;
    pullHistoryPage(options: WebIMPullMessageHistoryOptions): Promise<WebIMPullMessageHistoryResult>;
    sendText(options: WebIMSendTextMessageOptions): Promise<Message>;
    sendMention(options: WebIMSendMentionMessageOptions): Promise<Message>;
    sendQuote(options: WebIMSendQuoteMessageOptions): Promise<Message>;
    sendCustomEmoji(options: WebIMSendCustomEmojiMessageOptions): Promise<Message>;
    sendAudio(options: WebIMSendAudioMessageOptions): Promise<Message>;
    sendCard(options: WebIMSendCardMessageOptions): Promise<Message>;
    sendImage(options: WebIMSendImageMessageOptions): Promise<Message>;
    sendVideo(options: WebIMSendVideoMessageOptions): Promise<Message>;
    sendFile(options: WebIMSendFileMessageOptions): Promise<Message>;
    forward(options: WebIMForwardMessagesOptions): Promise<WebIMForwardMessagesResult>;
    forwardToTargets(options: WebIMForwardMessagesToTargetsOptions): Promise<WebIMForwardMessagesToTargetsResult>;
    delete(options: WebIMDeleteMessagesOptions): Promise<WebIMDeleteMessagesResult>;
    editText(options: WebIMEditTextMessageOptions): Promise<Message>;
    retry(options: WebIMRetryMessageOptions): Promise<Message>;
    recoverInterruptedSends(): Promise<number>;
}
/** 消息同步依赖复用 runtime 的 transport/account/platform owners。 */
export interface WebIMMessageSyncDependencies extends WebIMSyncContextDependencies, WebIMSyncMutationQueueDependencies, WebIMMessageSendDependencies {
    readonly gatewayClient: GatewayHTTPClient;
    /** 生产 composition 注入 neutral 群提及 owner，避免消息 facade 双轨。 */
    readonly groupMentionSync?: IMGroupMentionSync;
    readonly mediaUploadPort?: IMMediaUploadPort;
}
//# sourceMappingURL=message-sync-types.d.ts.map