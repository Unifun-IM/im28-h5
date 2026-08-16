import type { GatewayHTTPClient, GatewayMessage } from '@im28/im-sdk/core';
/** 从本地消息 cursor 正序分页补拉完整缺失窗口。 */
export declare function pullRealtimeMessageRecovery(gatewayClient: GatewayHTTPClient, conversationID: string, fromSeq: string): Promise<readonly GatewayMessage[]>;
//# sourceMappingURL=realtime-message-recovery.d.ts.map