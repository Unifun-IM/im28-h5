import type { GatewayRealtimeClient, GatewayRealtimeClientOptions, GatewayRealtimeEvent } from './types.js';
export declare function createGatewayRealtimeClient(options: GatewayRealtimeClientOptions): GatewayRealtimeClient;
export declare function parseGatewayRealtimePayload(raw: unknown): unknown;
export declare function normalizeGatewayRealtimeEvents(raw: unknown): readonly GatewayRealtimeEvent[];
//# sourceMappingURL=client.d.ts.map