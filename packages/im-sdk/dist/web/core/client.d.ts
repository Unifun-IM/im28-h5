import type { IMEventBus } from './events.js';
import type { ConnectionState, Conversation, FriendApplication, Friendship, Group, GroupApplication, GroupMember, IMClientConfig, LoginParams, Message, SessionState, User } from './types.js';
import type { IMTransport, MessageHistoryParams, MessageHistoryResult, SendFileMessageParams, SendImageMessageParams, SendSoundMessageParams, SendTextMessageParams, SendVideoMessageParams, FriendApplicationListParams, ChangeGroupMuteParams, CreateGroupParams, GroupApplicationListParams, GroupMemberListParams, OperateGroupMembersParams, SearchGroupMembersParams, SetConversationDraftParams, UpdateGroupInfoParams } from '../transport/types.js';
export interface IMClient {
    readonly config: IMClientConfig;
    readonly events: IMEventBus;
    init(): Promise<void>;
    login(params: LoginParams): Promise<void>;
    logout(): Promise<void>;
    destroy(): Promise<void>;
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
    getConnectionState(): ConnectionState;
    getSessionState(): SessionState;
}
export interface IMClientOptions {
    readonly transport?: IMTransport;
}
export declare function createIMClient(config: IMClientConfig, options?: IMClientOptions): IMClient;
//# sourceMappingURL=client.d.ts.map