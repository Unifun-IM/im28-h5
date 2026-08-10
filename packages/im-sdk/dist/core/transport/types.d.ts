import type { Conversation, FriendApplication, Friendship, GroupApplication, Group, GroupMember, LoginParams, Message, User } from '../core/types.js';
import type { Unsubscribe } from '../core/events.js';
export interface TransportInitParams {
    readonly userID?: string;
    readonly token?: string;
}
export interface SendTextMessageParams {
    readonly conversationID: string;
    readonly recvID?: string;
    readonly groupID?: string;
    readonly text: string;
    readonly offlinePushInfo?: unknown;
    readonly isOnlineOnly?: boolean;
}
export interface SendImageMessageParams {
    readonly conversationID: string;
    readonly recvID?: string;
    readonly groupID?: string;
    readonly path: string;
    readonly offlinePushInfo?: unknown;
    readonly isOnlineOnly?: boolean;
}
export interface SendVideoMessageParams {
    readonly conversationID: string;
    readonly recvID?: string;
    readonly groupID?: string;
    readonly videoPath: string;
    readonly videoType?: string;
    readonly duration?: number;
    readonly snapshotPath?: string;
    readonly offlinePushInfo?: unknown;
    readonly isOnlineOnly?: boolean;
}
export interface SendSoundMessageParams {
    readonly conversationID: string;
    readonly recvID?: string;
    readonly groupID?: string;
    readonly soundPath: string;
    readonly duration: number;
    readonly offlinePushInfo?: unknown;
    readonly isOnlineOnly?: boolean;
}
export interface SendFileMessageParams {
    readonly conversationID: string;
    readonly recvID?: string;
    readonly groupID?: string;
    readonly filePath: string;
    readonly fileName: string;
    readonly offlinePushInfo?: unknown;
    readonly isOnlineOnly?: boolean;
}
export interface MessageHistoryParams {
    readonly conversationID: string;
    readonly count?: number;
    readonly startClientMsgID?: string;
}
export interface MessageHistoryResult {
    readonly messages: readonly Message[];
    readonly isEnd?: boolean;
}
export interface SetConversationDraftParams {
    readonly conversationID: string;
    readonly draftText: string;
}
export interface FriendApplicationListParams {
    readonly handleResults?: readonly number[];
    readonly count?: number;
}
export interface GroupApplicationListParams {
    readonly groupIDs?: readonly string[];
    readonly handleResults?: readonly number[];
    readonly count?: number;
}
export interface GroupMemberListParams {
    readonly groupID: string;
    readonly offset?: number;
    readonly count?: number;
    readonly filter?: number;
}
export interface SearchGroupMembersParams {
    readonly groupID: string;
    readonly keyword: string;
    readonly offset?: number;
    readonly count?: number;
}
export interface CreateGroupParams {
    readonly memberUserIDs: readonly string[];
    readonly groupInfo?: {
        readonly groupName?: string;
        readonly faceURL?: string;
        readonly introduction?: string;
        readonly notification?: string;
        readonly groupType?: number;
    };
    readonly ownerUserID?: string;
    readonly adminUserIDs?: readonly string[];
}
export interface OperateGroupMembersParams {
    readonly groupID: string;
    readonly userIDList: readonly string[];
    readonly reason?: string;
}
export interface ChangeGroupMuteParams {
    readonly groupID: string;
    readonly isMute: boolean;
}
export interface UpdateGroupInfoParams {
    readonly groupID: string;
    readonly groupName?: string;
    readonly faceURL?: string;
    readonly introduction?: string;
    readonly notification?: string;
}
export interface IMTransport {
    init(params?: TransportInitParams): Promise<void>;
    login(params: LoginParams): Promise<void>;
    logout(): Promise<void>;
    sendTextMessage(params: SendTextMessageParams): Promise<Message>;
    sendImageMessage(params: SendImageMessageParams): Promise<Message>;
    sendVideoMessage(params: SendVideoMessageParams): Promise<Message>;
    sendSoundMessage(params: SendSoundMessageParams): Promise<Message>;
    sendFileMessage(params: SendFileMessageParams): Promise<Message>;
    getSelfUserInfo(): Promise<User>;
    getUsersInfo(userIDs: readonly string[]): Promise<readonly User[]>;
    getFriendList(): Promise<readonly User[]>;
    checkFriendship(userIDs: readonly string[]): Promise<readonly Friendship[]>;
    getFriendApplicationsAsRecipient(params?: FriendApplicationListParams): Promise<readonly FriendApplication[]>;
    getFriendApplicationsAsApplicant(params?: FriendApplicationListParams): Promise<readonly FriendApplication[]>;
    addFriend(toUserID: string, reqMsg: string): Promise<void>;
    acceptFriendApplication(fromUserID: string, handleMsg?: string): Promise<void>;
    refuseFriendApplication(fromUserID: string, handleMsg?: string): Promise<void>;
    getJoinedGroupList(): Promise<readonly Group[]>;
    getGroupInfo(groupID: string): Promise<Group | null>;
    searchGroups(groupID: string): Promise<readonly Group[]>;
    joinGroup(groupID: string, reqMsg: string): Promise<void>;
    getGroupApplicationsAsRecipient(params?: GroupApplicationListParams): Promise<readonly GroupApplication[]>;
    getGroupApplicationsAsApplicant(params?: GroupApplicationListParams): Promise<readonly GroupApplication[]>;
    acceptGroupApplication(groupID: string, fromUserID: string, handleMsg?: string): Promise<void>;
    refuseGroupApplication(groupID: string, fromUserID: string, handleMsg?: string): Promise<void>;
    getGroupMembers(params: GroupMemberListParams): Promise<readonly GroupMember[]>;
    searchGroupMembers(params: SearchGroupMembersParams): Promise<readonly GroupMember[]>;
    getGroupOwnerAndAdmins(groupID: string): Promise<readonly GroupMember[]>;
    updateGroupMemberRole(params: {
        readonly groupID: string;
        readonly userID: string;
        readonly roleLevel: number;
    }): Promise<void>;
    transferGroupOwner(params: {
        readonly groupID: string;
        readonly newOwnerUserID: string;
    }): Promise<void>;
    createGroup(params: CreateGroupParams): Promise<Group>;
    inviteUsersToGroup(params: OperateGroupMembersParams): Promise<void>;
    kickGroupMembers(params: OperateGroupMembersParams): Promise<void>;
    changeGroupMute(params: ChangeGroupMuteParams): Promise<void>;
    quitGroup(groupID: string): Promise<void>;
    dismissGroup(groupID: string): Promise<void>;
    updateGroupInfo(params: UpdateGroupInfoParams): Promise<void>;
    setConversationDraft(params: SetConversationDraftParams): Promise<Conversation>;
    getHistory(params: MessageHistoryParams): Promise<MessageHistoryResult>;
    onNewMessages(handler: (messages: readonly Message[]) => void): Unsubscribe;
}
//# sourceMappingURL=types.d.ts.map