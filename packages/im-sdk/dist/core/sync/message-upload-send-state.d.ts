import type { GatewayClientMessageBody, Message } from '@im28/im-sdk/core';
import type { IMMediaUploadInput, IMMediaUploadResult, WebIMMediaSendDependencies } from './message-media-send.js';
import { type WebIMSyncContext } from './sync-context.js';
/** 长上传状态机所需的本地定义和远端 body builder。 */
export interface WebIMUploadedMessageSendDefinition {
    readonly conversationID: string;
    readonly contentType: number;
    readonly localBody: GatewayClientMessageBody;
    readonly input: IMMediaUploadInput;
    readonly onSending?: (message: Message) => void;
    readonly createRemoteBody: (result: IMMediaUploadResult) => GatewayClientMessageBody;
}
/** 在短队列写入之间执行长上传，并先持久化可重放远端 body。 */
export declare function executeWebIMUploadedMessageSend(context: WebIMSyncContext, definition: WebIMUploadedMessageSendDefinition, dependencies: WebIMMediaSendDependencies): Promise<Message>;
//# sourceMappingURL=message-upload-send-state.d.ts.map