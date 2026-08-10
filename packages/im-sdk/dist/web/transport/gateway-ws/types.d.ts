import type { GatewayProxyConfig } from '../gateway-http/types.js';
export type GatewayRealtimeEventKind = 'connecting' | 'connected' | 'disconnected' | 'reconnecting' | 'error' | 'kicked' | 'token_expired' | 'message' | 'conversation' | 'friend' | 'friend_deleted' | 'group' | 'self' | 'user_status' | 'custom' | string;
export interface GatewayRealtimeEvent {
    readonly type: GatewayRealtimeEventKind;
    readonly event?: string;
    readonly data?: unknown;
    readonly raw?: unknown;
}
export type GatewayRealtimeEventHandler = (event: GatewayRealtimeEvent) => void;
export type GatewayRealtimeState = 'idle' | 'connecting' | 'connected' | 'reconnecting' | 'closed';
export interface GatewayWebSocketLike {
    onopen: ((event?: unknown) => void) | null;
    onmessage: ((event: {
        readonly data?: unknown;
    }) => void) | null;
    onerror: ((event?: unknown) => void) | null;
    onclose: ((event?: unknown) => void) | null;
    readonly readyState?: number;
    send(data: string): void;
    close(code?: number, reason?: string): void;
}
export type GatewayWebSocketConstructor = new (url: string) => GatewayWebSocketLike;
export interface GatewayRealtimeClientOptions {
    readonly url: string;
    readonly WebSocket: GatewayWebSocketConstructor;
    readonly userID: string;
    readonly token: string;
    readonly platformID?: number;
    readonly deviceID?: string;
    readonly getProxyConfig?: () => GatewayProxyConfig | null | undefined;
    readonly heartbeatIntervalMs?: number;
    readonly pongTimeoutMs?: number;
    readonly reconnectBaseDelayMs?: number;
    readonly reconnectMaxDelayMs?: number;
    readonly maxReconnectAttempts?: number;
    readonly setTimeout?: (handler: () => void, timeoutMs: number) => unknown;
    readonly clearTimeout?: (timer: unknown) => void;
}
export interface GatewayRealtimeClient {
    connect(): void;
    close(): void;
    send(data: unknown): void;
    onEvent(handler: GatewayRealtimeEventHandler): () => void;
    getState(): GatewayRealtimeState;
}
//# sourceMappingURL=types.d.ts.map