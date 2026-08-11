import type { SerializedPresetEmojiEntity } from '../../modules/message/preset-emoji-types.js';
export type GatewayFetch = (input: string, init: {
    readonly method: 'POST';
    readonly headers: Readonly<Record<string, string>>;
    readonly body: string;
    readonly proxy?: GatewayProxyConfig | null;
}) => Promise<GatewayFetchResponse>;
export interface GatewayProxyConfig {
    readonly enabled: boolean;
    readonly type: 'HTTP' | 'HTTPS' | 'SOCKS5' | string;
    readonly host: string;
    readonly port: number;
    readonly username?: string;
    readonly password?: string;
}
export interface GatewayFetchResponse {
    readonly ok: boolean;
    readonly status: number;
    json(): Promise<unknown>;
}
export interface GatewayHTTPClientOptions {
    readonly baseURL: string;
    readonly getBaseURL?: () => string;
    readonly fetch: GatewayFetch;
    readonly getAccessToken?: () => string | null | undefined;
    readonly getProxyConfig?: () => GatewayProxyConfig | null | undefined;
    readonly language?: string;
    readonly createRequestID?: () => string;
    readonly onGatewayAPIError?: (notice: {
        readonly code: number;
        readonly message: string;
    }) => void;
}
export interface GatewayEnvelope<T> {
    readonly code?: number;
    readonly message?: string;
    readonly data?: T;
}
/** Gateway 自定义表情资源，ID 用于发送，URL 仅作为展示快照。 */
export interface GatewayCustomEmoji {
    readonly emoji_id?: string;
    readonly url?: string;
    readonly added_at?: string;
}
/** 自定义表情列表项保留 OpenAPI 的包装结构。 */
export interface GatewayCustomEmojiListItem {
    readonly emoji?: GatewayCustomEmoji | null;
}
/** 自定义表情全量列表响应，不包含分页游标。 */
export interface GatewayListCustomEmojisData {
    readonly list?: readonly GatewayCustomEmojiListItem[];
    readonly total?: number;
    readonly max_count?: number;
}
/** 创建自定义表情只提交已完成 OSS 上传的对象 Key。 */
export interface GatewayCreateCustomEmojisRequest {
    readonly object_keys: readonly string[];
}
/** 创建结果按请求顺序返回本批服务端表情实体。 */
export interface GatewayCreateCustomEmojisData {
    readonly list?: readonly GatewayCustomEmojiListItem[];
}
/** 收藏收到的 type115 表情只依赖稳定 ID。 */
export interface GatewayAddCustomEmojiRequest {
    readonly emoji_id: string;
}
/** 收藏成功返回当前用户列表中的正式表情实体。 */
export interface GatewayAddCustomEmojiData {
    readonly emoji?: GatewayCustomEmoji | null;
}
/** 批量删除只移除当前用户与稳定表情 ID 的关系。 */
export interface GatewayBatchDeleteCustomEmojisRequest {
    readonly emoji_ids: readonly string[];
}
export interface GatewayGroup {
    readonly group_id?: string;
    readonly conversation_id?: string;
    readonly title?: string;
    readonly avatar_url?: string;
    readonly description?: string;
    readonly announcement?: string;
    /** 群公告版本；公告内容变化时递增。 */
    readonly announcement_version?: string;
    readonly owner_user_id?: string;
    readonly mode?: 'normal' | 'large' | string;
    readonly status?: 0 | 1 | 2 | 3 | 'active' | 'disabled' | 'banned' | 'dismissed' | 'muted' | string;
    readonly member_count?: number;
    readonly mute_all?: boolean;
    readonly mute_member?: boolean;
    readonly admin_send_message?: boolean;
    readonly admin_mute_member?: boolean;
    readonly admin_remove_member?: boolean;
    readonly admin_invite_member?: boolean;
    readonly admin_audit_application?: boolean;
    readonly admin_clear_message?: boolean;
    readonly member_add_friend_enabled?: boolean;
    readonly speech_frequency_enabled?: boolean;
    readonly join_approval_required?: boolean;
    readonly allow_member_add_friend?: boolean;
    readonly allow_member_invite?: boolean;
    readonly allow_member_nickname?: boolean;
    readonly send_frequency_enabled?: boolean;
    readonly send_frequency_seconds?: 30 | 60 | 180 | 300 | 600 | 1800 | 3600;
    readonly user_permission?: GatewayGroupUserPermission;
    /** 当前用户在该群的成员信息（如 /v1/group/my/list 的 list[].member），其中 role 为角色。 */
    readonly member?: GatewayGroupMember;
    readonly created_at?: string;
    readonly updated_at?: string;
}
export interface GatewayGroupUserPermission {
    readonly role?: 20 | 60 | 100 | 'owner' | 'admin' | 'member' | string;
    readonly role_level?: number;
    readonly state?: 'active' | 'left' | 'removed' | 'banned' | string;
    readonly is_banned?: boolean;
    readonly is_removed?: boolean;
    readonly is_left?: boolean;
    readonly is_muted?: boolean;
    readonly group_muted?: boolean;
    readonly member_muted?: boolean;
    readonly mute_until?: string;
    readonly can_send_message?: boolean;
    readonly can_invite_member?: boolean;
    readonly can_audit_application?: boolean;
    readonly can_mute_member?: boolean;
    readonly can_remove_member?: boolean;
    readonly can_clear_message?: boolean;
    readonly can_update_profile?: boolean;
    readonly can_edit_group_info?: boolean;
    readonly can_edit_announcement?: boolean;
    /** 当前用户已读的群公告版本。 */
    readonly announcement_read_version?: string;
    /** 当前群公告是否未读。 */
    readonly announcement_unread?: boolean;
    readonly can_invite_members?: boolean;
    readonly can_remove_members?: boolean;
    readonly can_open_group_manage?: boolean;
    readonly can_manage_admins?: boolean;
    readonly can_transfer_owner?: boolean;
    readonly can_dismiss_group?: boolean;
    readonly can_quit_group?: boolean;
    readonly can_mute_all?: boolean;
    readonly can_mention_all?: boolean;
    readonly permissions?: readonly string[];
    readonly [key: string]: unknown;
}
export interface GatewayGroupMember {
    readonly group_id?: string;
    readonly user_id?: string;
    readonly nickname?: string;
    readonly role?: 'member' | 'owner' | 'admin' | string;
    readonly state?: 'active' | 'left' | 'removed' | 'banned' | string;
    readonly joined_at?: string;
    readonly admin_since?: string;
    readonly updated_at?: string;
    readonly mute_until?: string;
    readonly is_muted?: boolean;
}
export type GatewayLoginType = 'account' | 'phone' | 'email' | string;
export type GatewaySubjectType = 'user' | 'sys_user' | string;
export type GatewayAccountStatus = 'active' | 'disabled' | string;
export type GatewayNotificationType = 'private_chat' | 'group_chat' | 'mention' | 'application' | 'system_notice' | 'call' | 'notification' | string;
export type GatewayPermissionType = 'friend_apply_verify' | 'allow_search' | 'allow_group_invite' | 'show_bio' | 'show_gender' | string;
export type GatewayFriendApplicationStatus = 'pending' | 'accepted' | 'rejected' | 'canceled' | 'expired' | string;
export interface GatewayToken {
    readonly access_token?: string;
    readonly refresh_token?: string;
    readonly expires_in?: number;
    readonly refresh_expires_in?: number;
    readonly subject_type?: GatewaySubjectType;
    readonly subject_id?: string;
}
export interface GatewayUser {
    readonly user_id?: string;
    readonly account?: string;
    readonly phone?: string;
    readonly phone_area_code?: string;
    readonly email?: string;
    readonly nickname?: string;
    readonly avatar_url?: string;
    readonly gender?: 0 | 1 | 2;
    readonly bio?: string;
    readonly invite_code?: string;
    readonly inviter_code?: string;
    readonly status?: GatewayAccountStatus;
    readonly created_at?: string;
    readonly updated_at?: string;
}
export interface GatewayFriendApplication {
    readonly application_id?: string;
    readonly requester_id?: string;
    readonly target_id?: string;
    readonly user?: GatewayUser;
    readonly type?: 'sent' | 'received' | string;
    readonly message?: string;
    readonly source_type?: string;
    readonly status?: GatewayFriendApplicationStatus;
    readonly is_read?: boolean;
    readonly handled_at?: string;
    readonly created_at?: string;
    readonly updated_at?: string;
}
export interface GatewayFriend {
    readonly user_id?: string;
    readonly friend_user_id?: string;
    readonly alias?: string;
    readonly phone?: string;
    readonly remark?: string;
    readonly tags?: readonly string[];
    readonly is_starred?: boolean;
    readonly created_at?: string;
    readonly user?: GatewayUser;
    readonly permission?: GatewayUserPermissionSetting;
}
export interface GatewayUserInviteRecordItem {
    readonly user?: GatewayUser;
}
export interface GatewayBlacklistItem {
    readonly user_id?: string;
    readonly blocked_user_id?: string;
    readonly created_at?: string;
    readonly user?: GatewayUser;
}
export interface GatewayRegisterUserRequest {
    readonly type: GatewayLoginType;
    readonly account: string;
    readonly password?: string;
    readonly phone_area_code?: string;
    readonly verification_code?: string;
    readonly device_id: string;
    readonly invite_code?: string;
}
export interface GatewayUserLoginRequest {
    readonly type: GatewayLoginType;
    readonly account: string;
    readonly password?: string;
    readonly phone_area_code?: string;
    readonly verification_code?: string;
    readonly device_id: string;
}
export interface GatewayForgotPasswordRequest {
    readonly account: string;
}
export interface GatewayForgotPasswordData {
    readonly reset_token?: string;
    readonly expires_in?: number;
}
export interface GatewayResetPasswordRequest {
    readonly old_password: string;
    readonly password: string;
}
export interface GatewaySetAccountPasswordRequest {
    readonly account: string;
    readonly password: string;
}
export interface GatewayUpdateEmailRequest {
    readonly email: string;
    readonly verification_code: string;
}
export interface GatewayUpdatePhoneRequest {
    readonly phone: string;
    readonly phone_area_code: '+86';
    readonly verification_code: string;
}
export interface GatewayRefreshTokenRequest {
    readonly refresh_token: string;
    readonly device_id?: string;
}
export interface GatewayLogoutRequest {
    readonly access_token?: string;
}
export interface GatewayCheckTokenRequest {
    readonly access_token: string;
}
export interface GatewayAuthData {
    readonly token?: GatewayToken;
    readonly user?: GatewayUser;
    readonly is_new_user?: boolean;
}
export interface GatewayCheckTokenData {
    readonly valid?: boolean;
    readonly subject_type?: GatewaySubjectType;
    readonly subject_id?: string;
    readonly roles?: readonly string[];
    readonly permissions?: readonly string[];
}
export type GatewayCallType = 'audio' | 'video';
export type GatewayCallStatus = 'ringing' | 'active' | 'ended' | 'canceled' | 'rejected' | 'missed' | 'failed' | string;
export interface GatewayCall {
    readonly call_id?: string;
    readonly client_call_id?: string;
    readonly conversation_id?: string;
    readonly room_name?: string;
    readonly caller_id?: string;
    readonly direction?: 'outgoing' | 'incoming' | string;
    readonly user_id?: string;
    readonly nickname?: string;
    readonly avatar_url?: string;
    readonly call_type?: GatewayCallType | string;
    readonly status?: GatewayCallStatus;
    readonly answer_status?: 'answered' | 'missed' | '' | string;
    readonly started_at?: string;
    readonly answered_at?: string;
    readonly ended_at?: string;
    readonly end_reason?: string;
}
export interface GatewayCallParticipant {
    readonly call_id?: string;
    readonly user_id?: string;
    readonly device_id?: string;
    readonly role?: 'caller' | 'callee' | string;
    readonly status?: 'ringing' | 'joined' | 'left' | 'rejected' | string;
    readonly joined_at?: string;
    readonly left_at?: string;
}
export interface GatewayStartCallRequest {
    readonly conversation_id: string;
    readonly call_type: GatewayCallType;
    readonly client_call_id: string;
}
export interface GatewayAnswerCallRequest {
    readonly call_id: string;
    readonly device_id?: string;
}
export interface GatewayCallIDRequest {
    readonly call_id: string;
}
/** 批量删除当前用户侧通话记录，后端只隐藏自己的记录。 */
export interface GatewayDeleteCallsRequest {
    readonly call_ids: readonly string[];
}
export interface GatewayHangupCallRequest {
    readonly call_id: string;
    readonly reason?: string;
}
export interface GatewayListCallRequest {
    readonly conversation_id?: string;
    readonly answer_status?: 'answered' | 'missed' | string;
    readonly limit?: number;
    readonly page?: number;
    readonly page_size?: number;
}
export interface GatewayCallData {
    readonly call?: GatewayCall;
}
export interface GatewayCallTokenData extends GatewayCallData {
    readonly livekit_url?: string;
    readonly livekit_token?: string;
    readonly expires_in?: number;
    readonly e2ee_required?: boolean;
}
export interface GatewayDetailCallData extends GatewayCallData {
    readonly participants?: readonly GatewayCallParticipant[];
}
export interface GatewayListCallData {
    readonly list?: readonly GatewayCall[];
    readonly total?: number;
}
export interface GatewayPendingCallData {
    readonly has_pending?: boolean;
    readonly call?: GatewayCall | null;
}
export interface GatewayGetUserRequest {
    readonly keyword?: string;
    readonly userID?: string;
    readonly user_id?: string;
}
export interface GatewayGetUserDetailData {
    readonly user?: GatewayUser;
    readonly is_friend?: boolean;
}
export interface GatewayGetUserDetailResult {
    readonly user: GatewayUser;
    readonly is_friend?: boolean;
}
export interface GatewayListUserInviteRecordsRequest {
    readonly page?: number;
    readonly page_size?: number;
}
export interface GatewayListUserInviteRecordsData {
    readonly records?: readonly GatewayUserInviteRecordItem[];
    readonly total?: number;
}
export interface GatewayBatchGetUsersRequest {
    readonly user_ids: readonly string[];
}
export interface GatewayUpdateUserProfileRequest {
    readonly nickname?: string;
    readonly avatar_url?: string;
    readonly gender?: 0 | 1 | 2;
    readonly bio?: string;
}
export interface GatewayBindContactRequest {
    readonly type: 'phone' | 'email' | string;
    readonly account: string;
    readonly phone_area_code?: string;
    readonly verification_code: string;
}
export interface GatewayGetUserQRCodeRequest {
    readonly user_id?: string;
}
export interface GatewayUploadCredentialRequest {
    readonly ext?: string;
}
export interface GatewayUserData {
    readonly user?: GatewayUser;
}
export interface GatewayBatchGetUsersData {
    readonly users?: readonly GatewayUser[];
}
export interface GatewayUserQRCodeData {
    readonly user_id?: string;
    readonly qr_code?: string;
}
export interface GatewayUploadCredential {
    readonly access_key_id?: string;
    readonly policy?: string;
    readonly signature?: string;
    readonly object_key?: string;
    readonly host?: string;
    readonly url?: string;
    readonly expire?: number;
}
export interface GatewayUserNotificationSetting {
    readonly user_id?: string;
    readonly private_chat?: boolean;
    readonly group_chat?: boolean;
    readonly mention?: boolean;
    readonly application?: boolean;
    readonly system_notice?: boolean;
    readonly call?: boolean;
    readonly notification?: boolean;
    readonly created_at?: string;
    readonly updated_at?: string;
}
export interface GatewayUserPermissionSetting {
    readonly user_id?: string;
    readonly friend_apply_verify?: boolean;
    readonly allow_search?: boolean;
    readonly allow_group_invite?: boolean;
    readonly show_bio?: boolean;
    readonly show_gender?: boolean;
    readonly created_at?: string;
    readonly updated_at?: string;
}
export interface GatewayUserNotificationSettingData {
    readonly setting?: GatewayUserNotificationSetting;
}
export interface GatewayUserPermissionSettingData {
    readonly setting?: GatewayUserPermissionSetting;
}
export interface GatewayClientVersion {
    readonly id?: string;
    readonly platform?: string;
    readonly version?: string;
    readonly build_number?: string;
    readonly force_update?: boolean;
    readonly download_url?: string;
    readonly title?: string;
    readonly description?: string;
    readonly is_enable?: boolean;
    readonly created_at?: string;
    readonly updated_at?: string;
}
export interface GatewayCheckClientVersionRequest {
    /** 客户端平台，如 ios/android/windows/macos/web。 */
    readonly platform: string;
    /** 当前客户端版本号。 */
    readonly version?: string;
    /** 当前客户端构建号，可选；不传按 0 处理。 */
    readonly build_number?: string;
}
export interface GatewayCheckClientVersionData {
    readonly need_update?: boolean;
    readonly client_version?: GatewayClientVersion;
}
export interface GatewayUpdateNotificationSettingRequest {
    readonly type: GatewayNotificationType;
    readonly enabled: boolean;
}
export interface GatewayUpdatePermissionSettingRequest {
    readonly type: GatewayPermissionType;
    readonly enabled: boolean;
}
export interface GatewayApplyFriendRequest {
    readonly target_id: string;
    readonly message?: string;
    readonly source_type?: string;
}
export interface GatewayListFriendApplicationsRequest {
    readonly page?: number;
    readonly page_size?: number;
}
export interface GatewayHandleFriendApplicationRequest {
    readonly application_id: string;
}
export interface GatewayFriendApplicationUnreadCountRequest {
}
export interface GatewayFriendApplicationUnreadCountData {
    readonly unread_count?: number;
}
export interface GatewayMarkFriendApplicationsReadRequest {
    readonly application_ids?: readonly string[];
}
export interface GatewayListFriendsRequest {
    readonly page?: number;
    readonly page_size?: number;
}
export interface GatewayGetFriendRequest {
    readonly friend_user_id: string;
}
export interface GatewayDeleteFriendRequest {
    readonly friend_user_id: string;
    /** self 仅清空自己的聊天记录；both 清空双方聊天记录。 */
    readonly clear_scope: 'self' | 'both';
    /** 前端生成的本次删除操作唯一 ID，用于关系通知和清空操作幂等。 */
    readonly operation_id: string;
}
export interface GatewayUpdateFriendProfileRequest {
    readonly friend_user_id: string;
    readonly alias?: string;
    readonly phone?: string;
    readonly remark?: string;
    readonly tags?: readonly string[];
}
export interface GatewayUpdateFriendStarRequest {
    readonly friend_user_id: string;
    readonly is_starred: boolean;
}
export interface GatewayBlacklistRequest {
    readonly blocked_user_id: string;
}
export interface GatewayListBlacklistRequest {
    readonly page?: number;
    readonly page_size?: number;
}
export interface GatewayFriendApplicationData {
    readonly application?: GatewayFriendApplication;
}
export interface GatewayListFriendApplicationsData {
    readonly applications?: readonly GatewayFriendApplication[];
    readonly total?: number;
}
export interface GatewayListFriendsData {
    readonly friends?: readonly GatewayFriend[];
    readonly total?: number;
}
export interface GatewayFriendData {
    readonly friend?: GatewayFriend;
    readonly user?: GatewayUser;
}
export interface GatewayListBlacklistData {
    readonly items?: readonly GatewayBlacklistItem[];
    readonly total?: number;
}
export type GatewayUint64String = string;
export type GatewayConversationType = 'direct' | 'group' | string;
export interface GatewayConversationEnvelopeItem {
    readonly conversation?: {
        readonly type?: 1 | 2 | 3 | GatewayConversationType;
        readonly direct_conversation?: GatewayConversation | null;
        readonly group_conversation?: GatewayConversation | null;
    };
}
export type GatewayOpenIMMessageType = 101 | 102 | 103 | 104 | 105 | 106 | 108 | 109 | 110 | 113 | 114 | 115 | 118 | 1200 | 1201 | 1400 | 1501 | 1502 | 1504 | 1507 | 1508 | 1509 | 1510 | 1511 | 1512 | 1513 | 1514 | 1515 | 1519 | 1520 | 1701 | 2101;
export type GatewayOpenIMMessageStatus = 1 | 2 | 3 | 4 | 5;
export type GatewayMessageType = GatewayOpenIMMessageType | number;
export type GatewayMessageStatus = GatewayOpenIMMessageStatus | 'sent' | 'sending' | 'failed' | 'recalled' | 'deleted' | number | string;
export interface GatewayMentionTarget {
    readonly type?: 'user' | 'all' | string;
    readonly user_id?: string;
    readonly nickname?: string;
}
export type GatewayPresetEmojiEntity = SerializedPresetEmojiEntity;
export type GatewayClientMessageBody = {
    readonly text: {
        readonly text: string;
    };
} | {
    readonly quote: {
        readonly msg_id: string;
        readonly text?: string;
        readonly reply_text?: string;
    };
} | {
    readonly card: {
        readonly type?: 'user' | 'group' | string;
        readonly user?: {
            readonly user_id?: string;
            readonly nickname?: string;
            readonly avatar_url?: string;
        };
        readonly group?: {
            readonly group_id?: string;
            readonly title?: string;
            readonly avatar_url?: string;
            readonly member_count?: number;
        };
        readonly user_id?: string;
        readonly nickname?: string;
        readonly avatar_url?: string;
    };
} | {
    readonly custom: {
        readonly key: string;
        readonly data?: string;
    };
} | {
    readonly typing: {
        readonly action: string;
    };
} | {
    readonly emoji: {
        readonly emoji_id?: string;
        readonly url?: string;
    };
} | {
    readonly location: {
        readonly latitude?: number;
        readonly longitude?: number;
        readonly name?: string;
        readonly address?: string;
    };
} | {
    readonly markdown: {
        readonly text: string;
    };
} | {
    readonly mention: {
        readonly text: string;
        readonly targets?: readonly GatewayMentionTarget[];
        readonly user_ids?: readonly string[];
    };
} | {
    readonly image: {
        readonly list: readonly {
            readonly media_id?: string;
            readonly url?: string;
            readonly thumbnail_url?: string;
            readonly width?: number;
            readonly height?: number;
            readonly size_bytes?: GatewayUint64String;
        }[];
    };
} | {
    readonly file: {
        readonly media_id?: string;
        readonly url?: string;
        readonly name?: string;
        readonly mime_type?: string;
        readonly size_bytes?: GatewayUint64String;
    };
} | {
    readonly audio: {
        readonly media_id?: string;
        readonly url?: string;
        readonly duration_seconds?: number;
        readonly size_bytes?: GatewayUint64String;
    };
} | {
    readonly video: {
        readonly media_id?: string;
        readonly url?: string;
        readonly thumbnail_url?: string;
        readonly duration_seconds?: number;
        readonly width?: number;
        readonly height?: number;
        readonly size_bytes?: GatewayUint64String;
    };
};
export type GatewayLegacyMessageBody = {
    readonly textElem: {
        readonly content?: string;
        readonly text?: string;
    };
} | {
    readonly pictureElem: Readonly<Record<string, unknown>>;
} | {
    readonly fileElem: Readonly<Record<string, unknown>>;
} | {
    readonly soundElem: Readonly<Record<string, unknown>>;
} | {
    readonly videoElem: Readonly<Record<string, unknown>>;
} | {
    readonly system: {
        readonly event_type?: string;
        readonly text?: string;
        readonly extra?: Readonly<Record<string, string>>;
    };
};
export type GatewayMessageBody = GatewayClientMessageBody | GatewayLegacyMessageBody;
export interface GatewayForwardOrigin {
    readonly type?: 'user' | string;
    readonly user_id?: string;
    readonly name?: string;
    readonly avatar_url?: string;
}
export interface GatewayMessage {
    readonly msg_id?: string;
    readonly conversation_id?: string;
    readonly msg_seq?: GatewayUint64String;
    readonly sender_id?: string;
    readonly client_msg_id?: string;
    readonly type?: GatewayMessageType;
    readonly status?: GatewayMessageStatus;
    readonly body?: GatewayMessageBody;
    readonly target_msg_id?: string;
    readonly target_msg_seq?: GatewayUint64String;
    readonly mentions?: readonly GatewayMentionTarget[];
    readonly entities?: readonly GatewayPresetEmojiEntity[];
    readonly mention_user_ids?: readonly string[];
    readonly forward_origin?: GatewayForwardOrigin;
    readonly sent_at?: string;
    readonly updated_at?: string;
    readonly expire_at?: string;
}
export interface GatewayConversation {
    readonly conversation_id?: string;
    readonly type?: GatewayConversationType | number;
    readonly direct_conversation?: GatewayConversation | null;
    readonly group_conversation?: GatewayConversation | null;
    readonly user?: GatewayUser;
    readonly group?: GatewayGroup;
    readonly group_mode?: 'normal' | 'large' | string;
    readonly title?: string;
    readonly avatar_url?: string;
    readonly last_msg_seq?: GatewayUint64String;
    readonly version?: GatewayUint64String;
    readonly member_count?: number;
    readonly my_member_state?: 'active' | 'left' | 'removed' | 'muted' | string;
    readonly my_role?: 'member' | 'owner' | 'admin' | string;
    readonly join_seq?: GatewayUint64String;
    readonly leave_seq?: GatewayUint64String;
    readonly last_read_seq?: GatewayUint64String;
    readonly last_delivered_seq?: GatewayUint64String;
    readonly clear_before_seq?: GatewayUint64String;
    readonly list_hidden?: boolean;
    readonly archived?: boolean;
    readonly last_message?: GatewayMessage;
    readonly unread_count?: GatewayUint64String;
    readonly manual_unread?: boolean;
    readonly pinned_at?: string;
    readonly auto_delete_seconds?: number;
    readonly auto_delete_updated_by?: string;
    readonly auto_delete_updated_at?: string;
    readonly notification_muted?: boolean;
    readonly created_at?: string;
    readonly updated_at?: string;
}
export interface GatewayConversationSyncState {
    readonly conversation_id?: string;
    readonly last_msg_seq?: GatewayUint64String;
    readonly last_read_seq?: GatewayUint64String;
    readonly last_delivered_seq?: GatewayUint64String;
    readonly version?: GatewayUint64String;
    readonly unread_count?: GatewayUint64String;
    readonly clear_before_seq?: GatewayUint64String;
    readonly list_hidden?: boolean;
    readonly archived?: boolean;
    readonly pinned_at?: string;
    readonly notification_muted?: boolean;
}
export interface GatewayConversationSetting {
    readonly conversation_id?: string;
    readonly type?: GatewayConversationType;
    readonly is_pinned?: boolean;
    readonly pinned_at?: string;
    readonly pinned_sort?: number;
    readonly notification_muted?: boolean;
    readonly manual_unread?: boolean;
    readonly auto_delete_seconds?: number;
    readonly auto_delete_updated_by?: string;
    readonly auto_delete_updated_at?: string;
}
export interface GatewayReadState {
    readonly conversation_id?: string;
    readonly user_id?: string;
    readonly last_read_seq?: GatewayUint64String;
    readonly read_at?: string;
}
export interface GatewayOpenDirectConversationRequest {
    readonly peer_user_id: string;
}
export interface GatewayListConversationsRequest {
    readonly limit?: number;
    readonly page_token?: string;
}
export interface GatewayListArchivedConversationsRequest {
    readonly limit?: number;
    readonly page_token?: string;
}
export interface GatewayGetConversationRequest {
    readonly conversation_id: string;
}
export interface GatewayGetConversationSettingRequest {
    readonly conversation_id: string;
}
export interface GatewaySyncConversationsRequest {
    readonly limit?: number;
    readonly page_token?: string;
    readonly after_version?: GatewayUint64String;
}
export interface GatewayPinConversationRequest {
    readonly conversation_id: string;
    readonly is_pinned?: boolean;
}
export interface GatewayMuteConversationRequest {
    readonly conversation_id: string;
    readonly notification_muted?: boolean;
}
export interface GatewayUpdateConversationAutoDeleteRequest {
    readonly conversation_id: string;
    readonly auto_delete_seconds?: number;
}
export interface GatewayAckConversationRequest {
    readonly conversation_id: string;
    readonly delivered_seq: GatewayUint64String;
    readonly device_id?: string;
}
export interface GatewayMarkReadRequest {
    readonly conversation_id: string;
    readonly read_seq?: GatewayUint64String;
}
export interface GatewayMarkUnreadRequest {
    readonly conversation_id: string;
    readonly manual_unread?: boolean;
}
export interface GatewayClearConversationRequest {
    readonly conversation_id: string;
    readonly scope?: 'self' | 'both' | 'all_members';
}
export interface GatewayArchiveConversationRequest {
    readonly conversation_id: string;
    readonly archived?: boolean;
}
export interface GatewayHideConversationRequest {
    readonly conversation_id: string;
    readonly clear_before_seq: GatewayUint64String;
}
export interface GatewayGetReadStateRequest {
    readonly conversation_id: string;
    readonly user_ids: readonly string[];
}
export interface GatewayConversationData {
    readonly conversation?: GatewayConversation;
}
export interface GatewayListConversationsData {
    readonly conversations?: readonly GatewayConversation[];
    readonly next_page_token?: string;
}
export interface GatewaySyncConversationsData {
    readonly states?: readonly GatewayConversationSyncState[];
    readonly next_page_token?: string;
    readonly latest_version?: GatewayUint64String;
}
export interface GatewayConversationStateData {
    readonly state?: GatewayConversationSyncState;
}
export interface GatewayConversationSettingData {
    readonly setting?: GatewayConversationSetting;
}
export interface GatewayGetReadStateData {
    readonly read_states?: readonly GatewayReadState[];
}
export interface GatewaySendMessageRequest {
    readonly conversation_id: string;
    readonly client_msg_id: string;
    readonly body?: GatewayClientMessageBody;
    readonly source_msg_id?: string;
    readonly mentions?: readonly GatewayMentionTarget[];
    readonly entities?: readonly GatewayPresetEmojiEntity[];
    readonly mention_user_ids?: readonly string[];
}
export interface GatewayBatchSendMessageTarget {
    /** 好友用户 ID。与 group_id 必须且只能传一个。 */
    readonly friend_user_id?: string;
    /** 群 ID。与 friend_user_id 必须且只能传一个。 */
    readonly group_id?: string;
    /** 此目标会话内的消息幂等 ID。 */
    readonly client_msg_id: string;
    readonly mentions?: readonly GatewayMentionTarget[];
}
export interface GatewayBatchSendMessageRequest {
    /** 客户端生成的整批幂等及追踪 ID，重试时保持不变。 */
    readonly batch_id: string;
    readonly body: GatewayClientMessageBody;
    readonly entities?: readonly GatewayPresetEmojiEntity[];
    /** 好友和群聊目标可以混合传入；最多 50 个。 */
    readonly targets: readonly GatewayBatchSendMessageTarget[];
}
export interface GatewayBatchSendMessageResult {
    readonly friend_user_id?: string;
    readonly group_id?: string;
    readonly conversation_id?: string;
    readonly client_msg_id?: string;
    /** 此目标的业务结果码，0 表示发送成功。 */
    readonly code?: number;
    readonly msg?: string;
    readonly message?: GatewayMessage;
}
export interface GatewayBatchSendMessageData {
    readonly success_count?: number;
    readonly failed_count?: number;
    readonly list?: readonly GatewayBatchSendMessageResult[];
}
export interface GatewayBatchForwardMessageItem {
    /** 当前用户可见且允许转发的源消息 ID。 */
    readonly source_msg_id: string;
    /** 此条新消息的客户端幂等 ID。 */
    readonly client_msg_id: string;
}
export interface GatewayBatchForwardMessageComment {
    /** 补充文字的客户端幂等 ID。 */
    readonly client_msg_id: string;
    /** 补充文字，作为当前用户发送的普通文本消息。 */
    readonly text: string;
}
export interface GatewayBatchForwardMessageRequest {
    /** 客户端生成的整批追踪 ID。 */
    readonly batch_id: string;
    /** 所有消息共同转发到的目标会话 ID。 */
    readonly conversation_id: string;
    /** 按数组顺序转发，最多 100 条。 */
    readonly items: readonly GatewayBatchForwardMessageItem[];
    readonly comment?: GatewayBatchForwardMessageComment;
}
export interface GatewayBatchForwardMessageResult {
    readonly source_msg_id?: string;
    readonly client_msg_id?: string;
    readonly code?: number;
    readonly msg?: string;
    readonly data?: {
        readonly message?: GatewayMessage;
    };
}
export interface GatewayBatchForwardMessageCommentResult {
    readonly client_msg_id?: string;
    readonly code?: number;
    readonly msg?: string;
    readonly data?: {
        readonly message?: GatewayMessage;
    };
}
export interface GatewayBatchForwardMessageData {
    readonly success_count?: number;
    readonly failed_count?: number;
    readonly list?: readonly GatewayBatchForwardMessageResult[];
    readonly comment?: GatewayBatchForwardMessageCommentResult;
}
export interface GatewayBatchDeleteMessageItem {
    /** 要删除的目标消息 ID。 */
    readonly target_msg_id: string;
    /** 此条删除操作的客户端幂等 ID。 */
    readonly client_msg_id: string;
}
export interface GatewayBatchDeleteMessageRequest {
    /** 客户端生成的批次追踪 ID，整批重试时保持不变。 */
    readonly batch_id: string;
    /** 本批消息所属的同一个会话 ID。 */
    readonly conversation_id: string;
    /** self 仅当前用户隐藏；all 对会话相关用户全局删除。 */
    readonly scope: 'self' | 'all';
    readonly reason?: string;
    readonly items: readonly GatewayBatchDeleteMessageItem[];
}
export interface GatewayBatchDeleteMessageResult {
    readonly target_msg_id?: string;
    readonly client_msg_id?: string;
    readonly code?: number;
    readonly msg?: string;
    readonly target_message?: GatewayMessage;
    readonly update?: GatewayMessageUpdate;
}
export interface GatewayBatchDeleteMessageData {
    readonly success_count?: number;
    readonly failed_count?: number;
    readonly list?: readonly GatewayBatchDeleteMessageResult[];
}
export interface GatewayPullMessagesRequest {
    readonly conversation_id: string;
    readonly from_seq: GatewayUint64String;
    readonly limit?: number;
    readonly desc?: boolean;
}
export interface GatewayBatchPullMessagesItem {
    readonly conversation_id: string;
    readonly from_seq: GatewayUint64String;
    readonly limit?: number;
    readonly desc?: boolean;
}
export interface GatewayBatchPullMessagesRequest {
    readonly items: readonly GatewayBatchPullMessagesItem[];
}
export interface GatewayUpdateMessageRequest {
    readonly conversation_id: string;
    readonly target_msg_id: string;
    readonly client_msg_id: string;
    readonly edit?: {
        readonly body: GatewayMessageBody;
        readonly mentions?: readonly unknown[];
        readonly entities?: readonly GatewayPresetEmojiEntity[];
    };
    readonly delete?: {
        readonly scope: 'self' | 'all';
        readonly reason?: string;
    };
}
export interface GatewayPullMessageUpdatesRequest {
    readonly conversation_id: string;
    readonly after_update_seq: GatewayUint64String;
    readonly limit?: number;
}
export interface GatewayMessageData {
    readonly message?: GatewayMessage;
}
export interface GatewayPullMessagesData {
    readonly messages?: readonly GatewayMessage[];
    /**
     * 本次消息列表中出现过的发送者用户资料，前端可按 message.sender_id 映射昵称与头像。
     */
    readonly users?: readonly GatewayUser[];
    readonly next_seq?: GatewayUint64String;
    readonly has_more?: boolean;
    readonly latest_seq?: GatewayUint64String;
}
export interface GatewayBatchPullMessagesResult {
    readonly conversation_id?: string;
    readonly response?: GatewayPullMessagesData;
    readonly error_code?: string;
    readonly error_message?: string;
}
export interface GatewayBatchPullMessagesData {
    readonly results?: readonly GatewayBatchPullMessagesResult[];
}
export interface GatewayUpdateMessageData {
    readonly operation_message?: GatewayMessage;
    readonly target_message?: GatewayMessage;
    readonly update?: GatewayMessageUpdate;
}
export interface GatewayMessageUpdate {
    readonly update_id?: string;
    readonly conversation_id?: string;
    readonly update_seq?: GatewayUint64String | number;
    readonly type?: 'edited' | 'deleted' | string;
    readonly target_msg_id?: string;
    readonly operator_user_id?: string;
    readonly delete_scope?: '' | 'self' | 'all' | string;
    readonly message?: GatewayMessage | null;
    readonly occurred_at?: string;
}
export interface GatewayPullMessageUpdatesData {
    readonly list?: readonly GatewayMessageUpdate[];
    readonly next_update_seq?: GatewayUint64String | number;
    readonly has_more?: boolean;
}
export interface GatewayCreateGroupRequest {
    readonly title: string;
    readonly avatar_url?: string;
    readonly announcement?: string;
    readonly member_user_ids?: readonly string[];
}
export interface GatewayGetGroupRequest {
    readonly group_id: string;
}
export interface GatewaySearchGroupsRequest {
    readonly keyword: string;
}
export interface GatewayListGroupsRequest {
    readonly page?: number;
    readonly page_size?: number;
    readonly limit?: number;
    readonly page_token?: string;
}
export interface GatewayListMyGroupsRequest {
    readonly limit?: number;
    readonly page_token?: string;
}
export interface GatewayShareCardMessageRequest {
    /** 要分享的名片用户 ID。 */
    readonly card_user_id: string;
    /** 接收名片的用户 ID 列表（不能包含当前用户或名片用户）。 */
    readonly target_user_ids: readonly string[];
}
export interface GatewayListCommonGroupsRequest {
    readonly target_user_id: string;
    readonly limit?: number;
    readonly page_token?: string;
}
export interface GatewayUpdateGroupRequest {
    readonly group_id: string;
    readonly title?: string;
    readonly avatar_url?: string;
    readonly description?: string;
    readonly announcement?: string;
}
export interface GatewayUpdateGroupSettingRequest {
    readonly group_id: string;
    readonly mute_all?: boolean;
    readonly mute_member?: boolean;
    readonly send_frequency_enabled?: boolean;
    readonly send_frequency_seconds?: 30 | 60 | 180 | 300 | 600 | 1800 | 3600;
    readonly join_approval_required?: boolean;
    readonly allow_member_add_friend?: boolean;
    readonly allow_member_invite?: boolean;
    readonly allow_member_nickname?: boolean;
}
export interface GatewayListGroupMembersRequest {
    readonly group_id: string;
    readonly limit?: number;
    readonly page_token?: string;
    readonly filter?: number;
    readonly muted_only?: boolean;
}
export interface GatewayInviteGroupMembersRequest {
    readonly group_id: string;
    readonly member_user_ids: readonly string[];
}
export interface GatewayRemoveGroupMemberRequest {
    readonly group_id: string;
    readonly member_user_ids: readonly string[];
}
export interface GatewayLeaveGroupRequest {
    readonly group_id: string;
    readonly clear_history?: boolean;
}
export interface GatewayDismissGroupRequest {
    readonly group_id: string;
}
export interface GatewayReadGroupAnnouncementRequest {
    readonly group_id: string;
    /** 前端实际展示并确认已读的公告版本。 */
    readonly announcement_version: string;
}
export interface GatewayReadGroupAnnouncementResult {
    readonly announcement_version?: string;
    readonly announcement_read_version?: string;
    readonly announcement_unread?: boolean;
}
export interface GatewayGroupAnnouncementReadStatusRequest {
    readonly group_id: string;
}
export interface GatewayGroupAnnouncementReadStatusResult {
    readonly announcement_version?: string;
    readonly announcement_read_version?: string;
    readonly is_read?: boolean;
}
export interface GatewayUpdateGroupAdminPermissionRequest {
    readonly group_id: string;
    readonly admin_send_message?: boolean;
    readonly admin_mute_member?: boolean;
    readonly admin_remove_member?: boolean;
    readonly admin_invite_member?: boolean;
    readonly admin_audit_application?: boolean;
    readonly admin_clear_message?: boolean;
}
export interface GatewayUpdateGroupMuteRequest {
    readonly group_id: string;
    readonly mute_all?: boolean;
    readonly mute_member?: boolean;
}
export interface GatewayUpdateGroupMemberMuteRequest {
    readonly group_id: string;
    readonly member_user_id: string;
    readonly mute_until?: string;
}
export interface GatewayUpdateGroupMemberNicknameRequest {
    readonly group_id: string;
    readonly nickname?: string;
}
export interface GatewaySetGroupAdminRequest {
    readonly group_id: string;
    readonly member_user_ids: readonly string[];
}
export interface GatewayCancelGroupAdminRequest {
    readonly group_id: string;
    readonly member_user_ids: readonly string[];
}
export interface GatewayTransferGroupOwnerRequest {
    readonly group_id: string;
    readonly new_owner_user_id: string;
}
export interface GatewayApplyGroupApplicationRequest {
    readonly group_id: string;
    readonly source_type?: string;
    readonly message?: string;
}
export interface GatewayInviteGroupApplicationRequest {
    readonly group_id: string;
    readonly requester_user_id: string;
    readonly source_type?: string;
    readonly message?: string;
}
export interface GatewayHandleGroupApplicationRequest {
    readonly application_id: string;
}
export interface GatewayListGroupApplicationsRequest {
    readonly group_id: string;
    readonly status?: 'pending' | 'accepted' | 'rejected';
    readonly type?: 'apply' | 'invite';
    readonly page?: number;
    readonly page_size?: number;
}
export interface GatewayGroupApplication {
    readonly application_id?: string;
    readonly group_id?: string;
    readonly requester_user_id?: string;
    readonly inviter_user_id?: string;
    readonly type?: 'apply' | 'invite';
    readonly source_type?: string;
    readonly message?: string;
    readonly status?: 'pending' | 'accepted' | 'rejected';
    readonly handled_by?: string;
    readonly handled_at?: string;
    readonly created_at?: string;
    readonly updated_at?: string;
    readonly requester_user?: GatewayUser;
    readonly inviter_user?: GatewayUser;
}
export interface GatewayGroupData {
    readonly group?: GatewayGroup;
    readonly user_permission?: GatewayGroupUserPermission;
}
export interface GatewayListGroupsData {
    readonly groups?: readonly GatewayGroup[];
    readonly next_page_token?: string;
    readonly total?: number;
}
export interface GatewayGroupMemberData {
    readonly member?: GatewayGroupMember;
}
export interface GatewayGroupApplicationData {
    readonly application?: GatewayGroupApplication;
}
export interface GatewayListGroupApplicationsData {
    readonly applications?: readonly GatewayGroupApplication[];
    readonly total?: number;
}
export interface GatewayListGroupApplicationAuditRequest {
    readonly page?: number;
    readonly page_size?: number;
}
export interface GatewayGroupApplicationAuditItem {
    readonly application?: GatewayGroupApplication;
    readonly group?: GatewayGroup;
    readonly requester_user?: GatewayUser;
}
export interface GatewayListGroupApplicationAuditData {
    readonly list?: readonly GatewayGroupApplicationAuditItem[];
    readonly total?: number;
}
export interface GatewayListPresenceRequest {
    readonly user_ids: readonly string[];
}
export interface GatewayUserPresence {
    readonly user_id?: string;
    readonly online?: boolean;
    readonly last_seen_at?: string;
}
export interface GatewayListPresenceData {
    readonly list?: readonly GatewayUserPresence[];
}
export interface GatewayListGroupMembersData {
    readonly members?: readonly GatewayGroupMember[];
    readonly next_page_token?: string;
}
//# sourceMappingURL=types.d.ts.map