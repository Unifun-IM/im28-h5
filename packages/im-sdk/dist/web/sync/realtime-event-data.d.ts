import { type GatewayConversation, type GatewayMessage, type Message, MessageRepository } from '@im28/im-sdk/core';
/** 保留 Gateway uint64 seq 与映射后 core message 的配对。 */
export interface MappedRealtimeMessage {
    readonly source: GatewayMessage;
    readonly value: Message;
}
/** 消息批次写入后用于推进会话的聚合结果。 */
export interface PersistedRealtimeMessageBatch {
    readonly messages: readonly Message[];
    readonly unreadDelta: number;
}
/** 递归收集带稳定身份的 Gateway 消息。 */
export declare function collectGatewayMessages(value: unknown): GatewayMessage[];
/** 收集带 conversation_id 的会话 DTO。 */
export declare function collectGatewayConversations(value: unknown): GatewayConversation[];
/** 按 conversation ID 聚合消息。 */
export declare function groupGatewayMessages(messages: readonly GatewayMessage[]): Map<string, GatewayMessage[]>;
/** 按 client/server ID 对同一批消息去重。 */
export declare function deduplicateGatewayMessages(messages: readonly GatewayMessage[]): GatewayMessage[];
/** 判断最小入站 seq 是否跳过本地下一条 seq。 */
export declare function hasSequenceGap(localSeq: string | undefined, messages: readonly GatewayMessage[]): boolean;
/** 递归检测 Gateway batch 的 degraded 标记。 */
export declare function hasDegradedMarker(value: unknown): boolean;
/** 选择 seq 最大、无 seq 时发送时间最大的消息。 */
export declare function selectLatestMessage(messages: readonly MappedRealtimeMessage[]): Message | undefined;
/** 持久化映射消息并只统计首次出现的入站消息。 */
export declare function persistMappedMessages(repository: MessageRepository, messages: readonly MappedRealtimeMessage[]): Promise<PersistedRealtimeMessageBatch>;
/** 返回十进制 uint64 集合的最大值，minimum=true 时返回最小值。 */
export declare function maxDecimalString(values: readonly (string | undefined)[], minimum?: boolean): string | undefined;
/** 安全读取非空字符串并统一 trim。 */
export declare function readString(value: unknown): string | undefined;
//# sourceMappingURL=realtime-event-data.d.ts.map