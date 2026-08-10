import type { IMError } from './errors.js';
import type { ConnectionState, Conversation, Message, SessionState } from './types.js';
export type Unsubscribe = () => void;
export interface IMEventMap {
    readonly 'connection.changed': {
        readonly state: ConnectionState;
        readonly previousState: ConnectionState;
    };
    readonly 'session.changed': {
        readonly state: SessionState;
        readonly previousState: SessionState;
    };
    readonly 'auth.invalidated': {
        readonly reason: 'kicked' | 'token_expired' | 'unknown';
        readonly message?: string;
    };
    readonly 'conversation.changed': {
        readonly conversation: Conversation;
    };
    readonly 'conversation.list.changed': {
        readonly conversations: readonly Conversation[];
    };
    readonly 'message.received': {
        readonly message: Message;
    };
    readonly 'message.updated': {
        readonly message: Message;
    };
    readonly 'message.deleted': {
        readonly conversationID: string;
        readonly clientMsgID: string;
    };
    readonly 'message.revoked': {
        readonly conversationID: string;
        readonly clientMsgID: string;
    };
    readonly error: {
        readonly error: IMError;
    };
}
export type IMEventName = keyof IMEventMap;
export type IMEventHandler<K extends IMEventName> = (payload: IMEventMap[K]) => void;
export interface IMEventBus {
    on<K extends IMEventName>(eventName: K, handler: IMEventHandler<K>): Unsubscribe;
}
export interface IMEventEmitter extends IMEventBus {
    emit<K extends IMEventName>(eventName: K, payload: IMEventMap[K]): void;
    clear(): void;
}
export declare function createEventBus(): IMEventEmitter;
//# sourceMappingURL=events.d.ts.map