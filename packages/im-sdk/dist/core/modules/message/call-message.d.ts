/** 历史通话消息支持的媒体类别。 */
export type IMCallMessageMediaType = 'audio' | 'video';
/** 历史通话消息支持的稳定状态。 */
export type IMCallMessageStatus = 'invited' | 'accepted' | 'ended' | 'rejected' | 'canceled' | 'missed' | 'failed';
/** 跨端聊天气泡消费的通话摘要。 */
export interface IMCallMessagePresentation {
    readonly mediaType: IMCallMessageMediaType;
    readonly status: IMCallMessageStatus;
    readonly durationSeconds: number;
    readonly roomName: string;
    readonly text: string;
    readonly unanswered: boolean;
}
/** 从 Gateway canonical body 或 RN MessageItem 读取历史通话气泡。 */
export declare function parseIMCallMessagePresentation(value: unknown): IMCallMessagePresentation | null;
/** 按 RN 既有文案格式输出历史通话摘要。 */
export declare function formatIMCallMessageText(call: Pick<IMCallMessagePresentation, 'status' | 'durationSeconds'>): string;
//# sourceMappingURL=call-message.d.ts.map