import type { GatewayMessageUpdate } from '@im28/im-sdk/core';
/** 实时 update 保留规范 DTO 与 batch 最新 cursor。 */
export interface ParsedRealtimeMessageUpdate {
    readonly update: GatewayMessageUpdate;
    readonly updateSeq?: string;
    readonly latestUpdateSeq?: string;
}
/** 从 normalized realtime payload 收集消息更新。 */
export declare function collectRealtimeMessageUpdates(value: unknown): readonly ParsedRealtimeMessageUpdate[];
/** 将安全 number 或十进制 string 归一为无损 cursor。 */
export declare function normalizeUpdateSeq(value: unknown): string | undefined;
//# sourceMappingURL=realtime-message-update-data.d.ts.map