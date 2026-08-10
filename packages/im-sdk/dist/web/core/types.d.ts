export type IMRuntimeTarget = 'rn' | 'web';
export type ConnectionState = 'idle' | 'initializing' | 'connecting' | 'connected' | 'reconnecting' | 'disconnected' | 'kicked' | 'token_expired';
export interface IMClientConfig {
    readonly runtime: IMRuntimeTarget;
    readonly appID?: string;
    readonly endpoints?: Readonly<Record<string, string>>;
    readonly proxy?: IMProxyConfig | null;
    readonly dbName?: string;
    readonly logLevel?: 'debug' | 'info' | 'warn' | 'error' | 'silent';
}
export interface IMProxyConfig {
    readonly enabled: boolean;
    readonly type: 'HTTP' | 'HTTPS' | 'SOCKS5' | string;
    readonly host: string;
    readonly port: number;
    readonly username?: string;
    readonly password?: string;
}
export interface LoginParams {
    readonly userID: string;
    readonly token: string;
}
export interface SessionState {
    readonly userID: string | null;
    readonly loggedIn: boolean;
}
export type ConversationType = 'single' | 'group' | 'notification' | 'unknown';
export interface Conversation {
    readonly conversationID: string;
    readonly type: ConversationType;
    readonly targetID: string;
    readonly name?: string;
    readonly faceURL?: string;
    readonly latestMessageID?: string;
    readonly lastReadSeq?: string;
    readonly lastMsgSeq?: string;
    readonly oldestLoadedSeq?: string;
    readonly unreadCount: number;
    readonly isArchived?: boolean;
    readonly isPinned?: boolean;
    readonly pinnedAt?: number;
    readonly isMuted?: boolean;
    readonly draft?: string;
    readonly updatedAt: number;
    readonly payload?: unknown;
}
export type MessageDirection = 'incoming' | 'outgoing';
export type MessageStatus = 'pending' | 'sending' | 'sent' | 'failed' | 'received' | 'revoked' | 'deleted_local';
export interface Message {
    readonly clientMsgID: string;
    readonly serverMsgID?: string;
    readonly conversationID: string;
    readonly senderID: string;
    readonly direction: MessageDirection;
    readonly contentType: number;
    readonly status: MessageStatus;
    readonly sendTime: number;
    readonly seq?: number;
    readonly localEx?: string;
    readonly payload: unknown;
}
export interface User {
    readonly userID: string;
    readonly nickname?: string;
    readonly faceURL?: string;
    readonly payload?: unknown;
}
export interface Friendship {
    readonly userID: string;
    readonly isFriend: boolean;
    readonly payload?: unknown;
}
export interface FriendApplication {
    readonly userID: string;
    readonly handleResult?: number;
    readonly payload?: unknown;
}
export interface GroupApplication {
    readonly groupID: string;
    readonly userID: string;
    readonly handleResult?: number;
    readonly payload?: unknown;
}
export interface Group {
    readonly groupID: string;
    readonly name: string;
    readonly faceURL?: string;
    readonly memberCount?: number;
    readonly payload?: unknown;
}
export interface GroupMember {
    readonly groupID: string;
    readonly userID: string;
    readonly nickname?: string;
    readonly faceURL?: string;
    readonly roleLevel?: number;
    readonly adminSince?: string;
    readonly payload?: unknown;
}
export interface Attachment {
    readonly attachmentID: string;
    readonly messageID: string;
    readonly kind: 'image' | 'video' | 'audio' | 'file';
    readonly localPath?: string;
    readonly remoteURL?: string;
    readonly mimeType?: string;
    readonly size?: number;
}
//# sourceMappingURL=types.d.ts.map