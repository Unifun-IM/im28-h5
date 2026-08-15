import type { GatewayRealtimeEvent } from '@im28/im-sdk/core';
/** 判断 Gateway realtime 事件是否要求重新读取单聊关系事实。 */
export declare function isIMRelationshipRealtimeEvent(event: GatewayRealtimeEvent): boolean;
/** 判断 Gateway realtime 事件是否要求重新读取好友或群验证计数。 */
export declare function isIMVerificationRealtimeEvent(event: GatewayRealtimeEvent): boolean;
//# sourceMappingURL=relationship-realtime.d.ts.map