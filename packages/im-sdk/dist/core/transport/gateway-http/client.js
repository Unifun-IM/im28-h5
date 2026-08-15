import { IMError } from '../../core/errors.js';
import * as authOpenAPI from '../../openapi/generated/gateway/renzheng.js';
import * as callOpenAPI from '../../openapi/generated/gateway/tonghua.js';
import * as conversationOpenAPI from '../../openapi/generated/gateway/huihua.js';
import * as customEmojiOpenAPI from '../../openapi/generated/gateway/zidingyibiaoqing.js';
import * as commonOpenAPI from '../../openapi/generated/gateway/tongyong.js';
import * as friendOpenAPI from '../../openapi/generated/gateway/tongxunlu.js';
import * as groupOpenAPI from '../../openapi/generated/gateway/qunliao.js';
import * as messageOpenAPI from '../../openapi/generated/gateway/xiaoxi.js';
import * as platformOpenAPI from '../../openapi/generated/gateway/pingtai.js';
import * as presenceOpenAPI from '../../openapi/generated/gateway/zaixianzhuangtai.js';
import * as settingOpenAPI from '../../openapi/generated/gateway/shezhi.js';
import * as differenceOpenAPI from '../../openapi/generated/gateway/chaliangtongbu.js';
import * as userOpenAPI from '../../openapi/generated/gateway/yonghu.js';
import request from '../../openapi/request.js';
import { createOpenAPIRequestOptionsFactory, unwrapGatewayData as unwrapData, } from './request-support.js';
export function createGatewayHTTPClient(options) {
    const requestOptions = createOpenAPIRequestOptionsFactory(options);
    return {
        register: async (params) => unwrapData(await authOpenAPI.postV1AuthRegister(params, requestOptions())),
        login: async (params) => unwrapData(await authOpenAPI.postV1AuthUserLogin(params, requestOptions())),
        // The Gateway OpenAPI dropped the password/forgot endpoint (password reset
        // now requires the old password via postV1AuthPasswordReset). Surface a
        // clear capability error until the auth reset flow is reworked.
        forgotPassword: (params) => missingGatewayCapability('GATEWAY_PASSWORD_FORGOT_UNAVAILABLE', params),
        resetPassword: async (params) => {
            await unwrapData(await authOpenAPI.postV1AuthPasswordReset(params, requestOptions()));
        },
        setAccountPassword: async (params) => {
            await unwrapData(await userOpenAPI.postV1UserAccountPasswordSet(params, requestOptions()));
        },
        listCustomEmojis: async () => unwrapData(customEmojiOpenAPI.postV1EmojiList({}, requestOptions())),
        createCustomEmojis: async (params) => unwrapData(customEmojiOpenAPI.postV1EmojiCreate({ object_keys: [...params.object_keys] }, requestOptions())),
        addCustomEmoji: async (params) => unwrapData(customEmojiOpenAPI.postV1EmojiAdd(params, requestOptions())),
        deleteCustomEmojis: async (params) => {
            await unwrapData(await customEmojiOpenAPI.postV1EmojiBatchDelete({ emoji_ids: [...params.emoji_ids] }, requestOptions()));
        },
        refreshToken: (params) => unwrapData(authOpenAPI.postV1AuthRefreshToken(params, requestOptions())),
        logout: async (params = {}) => {
            await unwrapData(await authOpenAPI.postV1AuthLogout(params, requestOptions()));
        },
        checkToken: (params) => unwrapData(authOpenAPI.postV1AuthCheckToken(params, requestOptions())),
        checkClientVersion: (params) => unwrapData(platformOpenAPI.postV1PlatformClientVersionCheck(params, requestOptions())),
        startCall: (params) => unwrapData(callOpenAPI.postV1CallStart(params, requestOptions())),
        answerCall: (params) => unwrapData(callOpenAPI.postV1CallAnswer(params, requestOptions())),
        rejectCall: (params) => unwrapData(callOpenAPI.postV1CallReject(params, requestOptions())),
        cancelCall: (params) => unwrapData(callOpenAPI.postV1CallCancel(params, requestOptions())),
        hangupCall: (params) => unwrapData(callOpenAPI.postV1CallHangup(params, requestOptions())),
        refreshCallToken: (params) => unwrapData(callOpenAPI.postV1CallToken(params, requestOptions())),
        fetchCallDetail: (params) => unwrapData(callOpenAPI.postV1CallDetail(params, requestOptions())),
        fetchCallList: async (params = {}) => normalizeListCallData(await unwrapData(callOpenAPI.postV1CallList(params, requestOptions()))),
        deleteCalls: async (params) => {
            await unwrapData(callOpenAPI.postV1CallDelete({ call_ids: [...params.call_ids] }, requestOptions()));
        },
        fetchPendingCall: () => unwrapData(request('/v1/call/pending', {
            method: 'POST',
            data: {},
            ...requestOptions(),
        })),
        getUser: async (params) => {
            const userID = normalizeGatewayUserID(params);
            if (!userID) {
                throw new IMError({
                    code: 'INVALID_ARGUMENT',
                    message: 'User ID is required.',
                    source: 'transport',
                });
            }
            return readUser(await unwrapData(userOpenAPI.postV1UserDetail({ user_id: userID }, requestOptions())));
        },
        searchUsers: async (params) => {
            const keyword = params.keyword?.trim() ?? '';
            if (!keyword) {
                throw new IMError({
                    code: 'INVALID_ARGUMENT',
                    message: 'User search keyword is required.',
                    source: 'transport',
                });
            }
            return readUsers(await unwrapData(userOpenAPI.postV1UserSearch({ keyword }, requestOptions())));
        },
        getCurrentUserDetail: async () => readUser(await unwrapData(userOpenAPI.postV1UserCurrentDetail(requestOptions()))),
        batchGetUsers: async (params) => normalizeBatchGetUsersData(await unwrapData(userOpenAPI.postV1UserBatchDetail(params, requestOptions()))).users ?? [],
        listPresence: async (params) => normalizeListPresenceData(await unwrapData(presenceOpenAPI.postV1PresenceList(params, requestOptions()))),
        getUserDetail: async (params) => normalizeGetUserDetailData(await unwrapData(userOpenAPI.postV1UserDetail({ user_id: requireGatewayUserID(params) }, requestOptions()))),
        listUserInviteRecords: async (params = {}) => normalizeListUserInviteRecordsData(await unwrapData(request('/v1/user/invite-record/list', {
            method: 'POST',
            data: params,
            ...requestOptions(),
        }))),
        updateUserProfile: async (params) => readUser(await unwrapData(userOpenAPI.postV1UsersUpdateProfile(params, requestOptions()))),
        bindContact: async (params) => readUser(await unwrapData(userOpenAPI.postV1UsersContactBind(params, requestOptions()))),
        updateEmail: async (params) => readUser(await unwrapData(userOpenAPI.postV1UserEmailUpdate(params, requestOptions()))),
        updatePhone: async (params) => readUser(await unwrapData(userOpenAPI.postV1UserPhoneUpdate(params, requestOptions()))),
        getUserQRCode: (params = {}) => missingGatewayCapability('GATEWAY_USER_QRCODE_UNAVAILABLE', params),
        getUploadCredential: (params = {}) => unwrapData(commonOpenAPI.postV1CommonUploadCredential(params, requestOptions())),
        getNotificationSetting: async () => readNotificationSetting(await unwrapData(settingOpenAPI.postV1SettingNotificationDetail(requestOptions()))),
        updateNotificationSetting: async (params) => readNotificationSetting(await unwrapData(settingOpenAPI.postV1SettingNotificationSwitch(params, requestOptions()))),
        getPermissionSetting: async () => readPermissionSetting(await unwrapData(settingOpenAPI.postV1SettingPermissionDetail(requestOptions()))),
        updatePermissionSetting: async (params) => readPermissionSetting(await unwrapData(settingOpenAPI.postV1SettingPermissionSwitch(params, requestOptions()))),
        applyFriend: async (params) => readFriendApplication(await unwrapData(friendOpenAPI.postV1FriendsApply(params, requestOptions()))),
        listFriendApplications: async (params = {}) => normalizeListFriendApplicationsData(await unwrapData(friendOpenAPI.postV1FriendApplicationList(params, requestOptions()))),
        acceptFriendApplication: async (params) => readFriendApplication(await unwrapData(friendOpenAPI.postV1FriendsApplicationsAccept(params, requestOptions()))),
        rejectFriendApplication: async (params) => readFriendApplication(await unwrapData(friendOpenAPI.postV1FriendsApplicationsReject(params, requestOptions()))),
        cancelFriendApplication: async (params) => readFriendApplication(await unwrapData(friendOpenAPI.postV1FriendsApplicationsCancel(params, requestOptions()))),
        listFriends: async (params = {}) => normalizeListFriendsData(await unwrapData(friendOpenAPI.postV1FriendList(params, requestOptions()))),
        getFriendApplicationUnreadCount: async (params = {}) => unwrapData(friendOpenAPI.postV1FriendsApplicationsUnreadCount(params, requestOptions())),
        markFriendApplicationsRead: async (params) => {
            await unwrapData(friendOpenAPI.postV1FriendsApplicationsRead(params, requestOptions()));
        },
        updateFriendProfile: async (params) => readFriend(await unwrapData(friendOpenAPI.postV1FriendProfileUpdate(params, requestOptions()))),
        updateFriendStar: async (params) => readFriend(await unwrapData(friendOpenAPI.postV1FriendStarUpdate(params, requestOptions()))),
        getFriend: async (params) => readFriend(await unwrapData(friendOpenAPI.postV1FriendDetail(params, requestOptions()))),
        deleteFriend: async (params) => {
            await unwrapData(await friendOpenAPI.postV1FriendsDelete(params, requestOptions()));
        },
        addToBlacklist: async (params) => {
            await unwrapData(await friendOpenAPI.postV1BlacklistAdd(params, requestOptions()));
        },
        removeFromBlacklist: async (params) => {
            await unwrapData(await friendOpenAPI.postV1BlacklistRemove(params, requestOptions()));
        },
        listBlacklist: async (params = {}) => normalizeListBlacklistData(await unwrapData(friendOpenAPI.postV1BlacklistList(params, requestOptions()))),
        openDirectConversation: async (params) => readConversation(await unwrapData(conversationOpenAPI.postV1DirectConversationOpen(params, requestOptions()))),
        listConversations: async (params = {}) => normalizeListConversationsData(await unwrapData(conversationOpenAPI.postV1ConversationList(params, requestOptions()))),
        listArchivedConversations: async (params = {}) => normalizeListConversationsData(await unwrapData(request('/v1/conversation/archive/list', {
            method: 'POST',
            data: params,
            ...requestOptions(),
        }))),
        getConversation: async (params) => readConversation(await unwrapData(conversationOpenAPI.postV1ConversationDetail(params, requestOptions()))),
        getConversationSetting: (params) => unwrapData(conversationOpenAPI.postV1ConversationSettingDetail(params, requestOptions())),
        syncConversations: async (params = {}) => normalizeSyncConversationsData(await unwrapData(conversationOpenAPI.postV1ConversationSync(params, requestOptions()))),
        getDifference: (params = {}) => unwrapData(differenceOpenAPI.postV1UpdatesGetDifference(params, requestOptions())),
        getConversationDifference: (params) => unwrapData(differenceOpenAPI.postV1UpdatesGetConversationDifference(params, requestOptions())),
        pinConversation: (params) => unwrapData(conversationOpenAPI.postV1ConversationPin(params, requestOptions())),
        muteConversation: (params) => unwrapData(conversationOpenAPI.postV1ConversationMute(params, requestOptions())),
        updateConversationAutoDelete: async (params) => readConversation(await unwrapData(conversationOpenAPI.postV1ConversationAutoDeleteUpdate(params, requestOptions()))),
        ackConversation: (params) => unwrapData(conversationOpenAPI.postV1ConversationAck(params, requestOptions())),
        markConversationRead: (params) => unwrapData(conversationOpenAPI.postV1ConversationRead(params, requestOptions())),
        markConversationUnread: (params) => unwrapData(conversationOpenAPI.postV1ConversationUnreadMark(params, requestOptions())),
        clearConversation: (params) => unwrapData(conversationOpenAPI.postV1ConversationClear(params, requestOptions())),
        archiveConversation: (params) => unwrapData(request('/v1/conversation/archive', {
            method: 'POST',
            data: params,
            ...requestOptions(),
        })),
        hideConversation: (params) => unwrapData(request('/v1/conversation/archive', {
            method: 'POST',
            data: {
                conversation_id: params.conversation_id,
                archived: true,
            },
            ...requestOptions(),
        })),
        getReadState: async (params) => normalizeGetReadStateData(await unwrapData(conversationOpenAPI.postV1ConversationReadState(params, requestOptions()))),
        sendMessage: async (params) => readMessage(await unwrapData(messageOpenAPI.postV1MessagesSend(params, requestOptions()))),
        batchForwardMessage: (params) => unwrapData(messageOpenAPI.postV1MessageBatchForward(params, requestOptions())),
        batchDeleteMessage: (params) => unwrapData(messageOpenAPI.postV1MessageBatchDelete(params, requestOptions())),
        batchSendMessage: (params) => unwrapData(messageOpenAPI.postV1MessageBatchSend(params, requestOptions())),
        shareCard: async (params) => {
            await unwrapData(userOpenAPI.postV1MessageCardShare(params, requestOptions()));
        },
        pullMessages: async (params) => normalizePullMessagesData(await unwrapData(messageOpenAPI.postV1MessagesPull(params, requestOptions()))),
        batchPullMessages: async (params) => normalizeBatchPullMessagesData(await unwrapData(messageOpenAPI.postV1MessagesBatchPull(params, requestOptions()))),
        updateMessage: (params) => unwrapData(messageOpenAPI.postV1MessagesUpdate(params, requestOptions())),
        pullMessageUpdates: (params) => unwrapData(request('/v1/message/update/pull', {
            method: 'POST',
            data: params,
            ...requestOptions(),
        })),
        createGroup: async (params) => readGroup(await unwrapData(groupOpenAPI.postV1GroupsCreate(params, requestOptions()))),
        listGroups: async (params) => stripGroupMemberFromListData(normalizeListGroupsData(await unwrapData(request('/v1/group/list', {
            ...requestOptions(),
            method: 'POST',
            data: params ?? {},
        })))),
        myGroupList: async (params) => normalizeListGroupsData(await unwrapData(request('/v1/group/my/list', {
            ...requestOptions(),
            method: 'POST',
            data: params ?? {},
        }))),
        listCommonGroups: async (params) => normalizeListGroupsData(await unwrapData(request('/v1/group/common/list', {
            ...requestOptions(),
            method: 'POST',
            data: params,
        }))),
        searchGroups: async (params) => normalizeSearchGroupsData(await unwrapData(groupOpenAPI.postV1GroupSearch(params, requestOptions()))),
        getGroup: async (params) => readGroup(await unwrapData(groupOpenAPI.postV1GroupDetail(params, requestOptions()))),
        getPublicGroup: async (params) => normalizePublicGroupDetail(await unwrapData(groupOpenAPI.postV1GroupPublicDetail(params, requestOptions()))),
        updateGroup: async (params) => readGroup(await unwrapData(groupOpenAPI.postV1GroupsUpdate(params, requestOptions()))),
        updateGroupSetting: async (params) => readGroup(await unwrapData(groupOpenAPI.postV1GroupSettingUpdate(params, requestOptions()))),
        updateGroupAdminPermission: async (params) => readGroup(await unwrapData(groupOpenAPI.postV1GroupAdminPermissionUpdate(params, requestOptions()))),
        setGroupAdmin: async (params) => readGroup(await unwrapData(groupOpenAPI.postV1GroupAdminSet(params, requestOptions()))),
        cancelGroupAdmin: async (params) => readGroup(await unwrapData(groupOpenAPI.postV1GroupAdminCancel(params, requestOptions()))),
        transferGroupOwner: async (params) => readGroup(await unwrapData(groupOpenAPI.postV1GroupOwnerTransfer(params, requestOptions()))),
        updateGroupMute: async (params) => readGroup(await unwrapData(groupOpenAPI.postV1GroupMuteUpdate(params, requestOptions()))),
        updateGroupMemberMute: async (params) => readGroupMember(await unwrapData(groupOpenAPI.postV1GroupMemberMuteUpdate(params, requestOptions()))),
        updateGroupMemberNickname: async (params) => readGroupMember(await unwrapData(groupOpenAPI.postV1GroupMemberNicknameUpdate(params, requestOptions()))),
        listGroupMembers: async (params) => normalizeListGroupMembersData(await unwrapData(groupOpenAPI.postV1GroupMemberList(params, requestOptions()))),
        applyGroupApplication: async (params) => readGroupApplication(await unwrapData(groupOpenAPI.postV1GroupApplicationApply(params, requestOptions()))),
        inviteGroupApplication: async (params) => readInvitedGroupApplications(await unwrapData(groupOpenAPI.postV1GroupApplicationInvite(params, requestOptions()))),
        listGroupApplications: async (params) => normalizeListGroupApplicationsData(await unwrapData(groupOpenAPI.postV1GroupApplicationList(params, requestOptions()))),
        listGroupApplicationAudit: async (params) => normalizeListGroupApplicationAuditData(await unwrapData(groupOpenAPI.postV1GroupApplicationAuditList(params, requestOptions()))),
        acceptGroupApplication: async (params) => readGroupApplication(await unwrapData(groupOpenAPI.postV1GroupApplicationAccept(params, requestOptions()))),
        rejectGroupApplication: async (params) => readGroupApplication(await unwrapData(groupOpenAPI.postV1GroupApplicationReject(params, requestOptions()))),
        inviteGroupMembers: async (params) => readGroup(await unwrapData(groupOpenAPI.postV1GroupMemberInvite(params, requestOptions()))),
        removeGroupMember: async (params) => readGroup(await unwrapData(groupOpenAPI.postV1GroupsMembersRemove(params, requestOptions()))),
        leaveGroup: async (params) => readGroup(await unwrapData(groupOpenAPI.postV1GroupsLeave(params, requestOptions()))),
        dismissGroup: async (params) => readGroup(await unwrapData(groupOpenAPI.postV1GroupsDismiss(params, requestOptions()))),
        markGroupAnnouncementRead: async (params) => unwrapData(groupOpenAPI.postV1GroupAnnouncementRead(params, requestOptions())),
        getGroupAnnouncementReadStatus: async (params) => unwrapData(groupOpenAPI.postV1GroupAnnouncementReadStatus(params, requestOptions())),
    };
}
function normalizeBatchGetUsersData(data) {
    const users = readGatewayUserArray(data, 'users') ?? readGatewayUserArray(data, 'list');
    return {
        ...(users ? { users } : {}),
    };
}
function normalizeGatewayUserID(params) {
    return (params.userID ?? params.user_id ?? params.keyword ?? '').trim();
}
function requireGatewayUserID(params) {
    const userID = normalizeGatewayUserID(params);
    if (!userID) {
        throw new IMError({
            code: 'INVALID_ARGUMENT',
            message: 'User ID is required.',
            source: 'transport',
        });
    }
    return userID;
}
function normalizeGetUserDetailData(data) {
    const user = readUser(data);
    return {
        user,
        ...(data.is_friend === undefined ? {} : { is_friend: data.is_friend }),
    };
}
function normalizeListUserInviteRecordsData(data) {
    const records = readArray(data, 'records') ??
        readArray(data, 'list');
    const total = readNumber(data, 'total');
    return {
        ...(records ? { records } : {}),
        ...(total === undefined ? {} : { total }),
    };
}
function normalizeListFriendApplicationsData(data) {
    const items = readArray(data, 'list') ?? [];
    const applications = readArray(data, 'applications') ??
        (items
            .map(item => {
            if (!isRecord(item.application)) {
                return null;
            }
            return {
                ...item.application,
                ...(isRecord(item.user) ? { user: item.user } : {}),
                ...(typeof item.type === 'string' ? { type: item.type } : {}),
            };
        })
            .filter((item) => item !== null));
    const total = readNumber(data, 'total');
    return {
        ...(applications ? { applications } : {}),
        ...(total === undefined ? {} : { total }),
    };
}
function normalizeListFriendsData(data) {
    const items = readArray(data, 'list') ?? [];
    const friends = readArray(data, 'friends') ??
        items
            .map(item => {
            if (!isRecord(item.friend)) {
                return null;
            }
            return {
                ...item.friend,
                ...(isRecord(item.user) ? { user: item.user } : {}),
                ...(isRecord(item.permission) ? { permission: item.permission } : {}),
            };
        })
            .filter((item) => item !== null);
    const total = readNumber(data, 'total');
    return {
        ...(friends ? { friends } : {}),
        ...(total === undefined ? {} : { total }),
    };
}
function normalizeListBlacklistData(data) {
    const items = readArray(data, 'list') ?? [];
    const normalizedItems = readArray(data, 'items') ??
        items
            .map(item => {
            if (!isRecord(item.black)) {
                return null;
            }
            return {
                ...item.black,
                ...(isRecord(item.user) ? { user: item.user } : {}),
            };
        })
            .filter((item) => item !== null);
    const total = readNumber(data, 'total');
    return {
        ...(normalizedItems ? { items: normalizedItems } : {}),
        ...(total === undefined ? {} : { total }),
    };
}
function normalizeListCallData(data) {
    const list = data.list
        ?.map(item => {
        if (!item.call) {
            return null;
        }
        return {
            ...item.call,
            ...(item.direction ? { direction: item.direction } : {}),
            ...(item.answer_status !== undefined
                ? { answer_status: item.answer_status }
                : {}),
            ...(item.peer_user?.user_id ? { user_id: item.peer_user.user_id } : {}),
            ...(item.peer_user?.nickname
                ? { nickname: item.peer_user.nickname }
                : {}),
            ...(item.peer_user?.avatar_url
                ? { avatar_url: item.peer_user.avatar_url }
                : {}),
        };
    })
        .filter((item) => item !== null);
    return {
        ...(list ? { list } : {}),
        ...(data.total === undefined ? {} : { total: data.total }),
    };
}
function normalizeListConversationsData(data) {
    const rawConversations = readArray(data, 'conversations') ??
        readArray(data, 'list');
    const conversations = rawConversations
        ?.map(normalizeConversationItem)
        .filter((item) => Boolean(item));
    const nextPageToken = readString(data, 'next_page_token');
    return {
        ...(conversations ? { conversations } : {}),
        ...(nextPageToken ? { next_page_token: nextPageToken } : {}),
    };
}
function normalizeConversationItem(item) {
    const envelope = item.conversation;
    if (envelope) {
        const type = normalizeConversationType(envelope.type);
        const body = type === 'group'
            ? envelope.group_conversation
            : envelope.direct_conversation;
        if (!body) {
            return null;
        }
        return {
            ...body,
            ...(type === undefined ? {} : { type }),
        };
    }
    const direct = item.direct_conversation;
    if (direct) {
        return { ...direct, type: 'direct' };
    }
    const group = item.group_conversation;
    if (group) {
        return { ...group, type: 'group' };
    }
    return {
        ...item,
        ...(() => {
            const type = normalizeConversationType(item.type);
            return type === undefined ? {} : { type };
        })(),
    };
}
function normalizeConversationType(type) {
    if (type === 1 || type === '1' || type === 'direct') {
        return 'direct';
    }
    if (type === 2 || type === 3 || type === '2' || type === '3' || type === 'group') {
        return 'group';
    }
    return typeof type === 'string' || typeof type === 'number' ? type : undefined;
}
function normalizeSyncConversationsData(data) {
    const states = readArray(data, 'states') ??
        unwrapRecordArray(data, 'list', 'state');
    const nextPageToken = readString(data, 'next_page_token');
    const latestVersion = readString(data, 'latest_version');
    return {
        ...(states ? { states } : {}),
        ...(nextPageToken ? { next_page_token: nextPageToken } : {}),
        ...(latestVersion ? { latest_version: latestVersion } : {}),
    };
}
function normalizeGetReadStateData(data) {
    const readStates = readArray(data, 'read_states') ??
        unwrapRecordArray(data, 'list', 'state');
    return {
        ...(readStates ? { read_states: readStates } : {}),
    };
}
function normalizePullMessagesData(data) {
    return {
        ...data,
        messages: readArray(data, 'messages') ??
            unwrapRecordArray(data, 'list', 'message'),
    };
}
function normalizeBatchPullMessagesData(data) {
    const results = readArray(data, 'results') ?? readArray(data, 'list');
    return {
        ...(results ? { results } : {}),
    };
}
function normalizeListGroupMembersData(data) {
    const members = readArray(data, 'members') ??
        unwrapRecordArray(data, 'list', 'member');
    const nextPageToken = readString(data, 'next_page_token');
    return {
        ...(members ? { members } : {}),
        ...(nextPageToken ? { next_page_token: nextPageToken } : {}),
    };
}
function normalizeListGroupsData(data) {
    const groups = readArray(data, 'groups') ??
        readGroupList(data, 'list');
    const nextPageToken = readString(data, 'next_page_token');
    const total = readNumber(data, 'total');
    return {
        groups: groups ?? [],
        ...(nextPageToken ? { next_page_token: nextPageToken } : {}),
        ...(total === undefined ? {} : { total }),
    };
}
function stripGroupMemberFromListData(data) {
    return {
        ...data,
        groups: (data.groups ?? []).map(group => {
            const next = { ...group };
            delete next.member;
            return next;
        }),
    };
}
function readGroupList(data, key) {
    const items = readArray(data, key);
    if (!items) {
        return undefined;
    }
    return items
        .map(item => {
        if (!isRecord(item)) {
            return null;
        }
        const groupConversation = getGroupConversationFromListItem(item);
        if (groupConversation) {
            return {
                ...groupConversation,
                group_id: readString(groupConversation, 'group_id') ??
                    readString(item, 'group_id') ??
                    readString(item, 'target_id'),
                conversation_id: readString(groupConversation, 'conversation_id') ??
                    readString(item, 'conversation_id'),
            };
        }
        if (isRecord(item.group)) {
            return {
                ...item.group,
                conversation_id: readString(item.group, 'conversation_id') ??
                    readString(item, 'conversation_id'),
                group_id: readString(item.group, 'group_id') ??
                    readString(item, 'group_id') ??
                    readString(item, 'target_id'),
                // /v1/group/my/list 在 list[].member 携带当前用户的成员信息（含 role），
                // 需要保留以便上层判断"我创建/群主/管理员"。
                ...(isRecord(item.member) ? { member: item.member } : {}),
            };
        }
        return isRecord(item) && typeof item.group_id === 'string'
            ? item
            : null;
    })
        .filter((item) => item !== null);
}
/** 将群搜索专属 wrapper 收窄并保留命中来源与账号关系。 */
function normalizeSearchGroupsData(data) {
    /** list 只接纳包含公开群对象的搜索单项。 */
    const list = readArray(data, 'list')
        ?.flatMap(item => {
        if (!isRecord(item.group))
            return [];
        /** sourceType 保留 ID 精确或标题匹配来源。 */
        const sourceType = readString(item, 'source_type');
        /** membershipStatus 保留服务端未来扩展的关系字段。 */
        const membershipStatus = readGroupSearchMembershipStatus(item);
        /** applicationStatus 保留待审核防重状态。 */
        const applicationStatus = readString(item, 'application_status');
        return [{
                group: item.group,
                ...(sourceType ? { source_type: sourceType } : {}),
                ...(membershipStatus ? { membership_status: membershipStatus } : {}),
                ...(applicationStatus ? { application_status: applicationStatus } : {}),
            }];
    });
    return { list: list ?? [] };
}
/** 将搜索关系字段收窄到公开合同枚举。 */
function readGroupSearchMembershipStatus(item) {
    /** value 只接受 Gateway 声明的五种关系。 */
    const value = readString(item, 'membership_status');
    return value === 'none' || value === 'active' || value === 'left' ||
        value === 'removed' || value === 'banned' ? value : undefined;
}
function getGroupConversationFromListItem(item) {
    if (isRecord(item.group_conversation)) {
        return item.group_conversation;
    }
    if (isRecord(item.conversation)) {
        const conversation = item.conversation;
        if (isRecord(conversation.group_conversation)) {
            return conversation.group_conversation;
        }
    }
    return null;
}
function normalizeListGroupApplicationsData(data) {
    const applications = readArray(data, 'applications') ??
        readArray(data, 'list')
            ?.map(item => {
            if (!isRecord(item.application)) {
                return null;
            }
            return {
                ...item.application,
                ...(isRecord(item.requester_user) ? { requester_user: item.requester_user } : {}),
                ...(isRecord(item.inviter_user) ? { inviter_user: item.inviter_user } : {}),
            };
        })
            .filter((item) => item !== null);
    const total = readNumber(data, 'total');
    return {
        ...(applications ? { applications } : {}),
        ...(total === undefined ? {} : { total }),
    };
}
/** 将陌生人群公开资料 envelope 收窄为稳定 Gateway contract。 */
function normalizePublicGroupDetail(data) {
    /** rawGroup 保留 OpenAPI 返回的公开字段。 */
    const rawGroup = isRecord(data.group) ? data.group : null;
    /** membershipStatus 只接受服务端声明的关系枚举。 */
    const membershipStatus = readString(data, 'membership_status');
    /** applicationStatus 保留服务端申请状态供页面防重。 */
    const applicationStatus = readString(data, 'application_status');
    return {
        ...(rawGroup ? { group: rawGroup } : {}),
        ...(membershipStatus === 'none' || membershipStatus === 'active' ||
            membershipStatus === 'left' || membershipStatus === 'removed' ||
            membershipStatus === 'banned'
            ? { membership_status: membershipStatus }
            : {}),
        ...(applicationStatus ? { application_status: applicationStatus } : {}),
    };
}
function normalizeListGroupApplicationAuditData(data) {
    const list = readArray(data, 'list')
        ?.map(item => {
        if (!isRecord(item)) {
            return null;
        }
        return {
            ...(isRecord(item.application)
                ? { application: item.application }
                : {}),
            ...(isRecord(item.group) ? { group: item.group } : {}),
            ...(isRecord(item.requester_user)
                ? { requester_user: item.requester_user }
                : {}),
        };
    })
        .filter((item) => item !== null);
    const total = readNumber(data, 'total');
    return {
        ...(list ? { list } : {}),
        ...(total === undefined ? {} : { total }),
    };
}
function normalizeListPresenceData(data) {
    const list = readArray(data, 'list')
        ?.map(item => (isRecord(item) ? item : null))
        .filter((item) => item !== null);
    return { ...(list ? { list } : {}) };
}
function unwrapRecordArray(data, arrayKey, valueKey) {
    const items = readArray(data, arrayKey);
    if (!items) {
        return undefined;
    }
    return items
        .map(item => {
        if (!isRecord(item)) {
            return null;
        }
        const value = item[valueKey];
        return isRecord(value) ? value : null;
    })
        .filter((item) => item !== null);
}
function readArray(data, key) {
    const value = data[key];
    return Array.isArray(value) ? value : undefined;
}
function readNumber(data, key) {
    const value = data[key];
    return typeof value === 'number' ? value : undefined;
}
function readString(data, key) {
    const value = data[key];
    return typeof value === 'string' ? value : undefined;
}
function isRecord(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}
function missingGatewayCapability(code, cause) {
    throw new IMError({
        code,
        message: 'Gateway OpenAPI no longer exposes this capability.',
        source: 'transport',
        cause,
    });
}
function readGroup(data) {
    if (!data.group) {
        throw new IMError({
            code: 'GATEWAY_GROUP_MISSING',
            message: 'Gateway response is missing data.group.',
            source: 'transport',
            cause: data,
        });
    }
    return {
        ...data.group,
        ...(data.user_permission ? { user_permission: data.user_permission } : {}),
    };
}
function readGroupMember(data) {
    if (!data.member) {
        throw new IMError({
            code: 'GATEWAY_GROUP_MEMBER_MISSING',
            message: 'Gateway response is missing data.member.',
            source: 'transport',
            cause: data,
        });
    }
    return data.member;
}
function readGroupApplication(data) {
    if (!data.application) {
        throw new IMError({
            code: 'GATEWAY_GROUP_APPLICATION_MISSING',
            message: 'Gateway response is missing data.application.',
            source: 'transport',
            cause: data,
        });
    }
    return data.application;
}
/** 读取新版批量邀请申请响应并拒绝缺失的 application 单项。 */
function readInvitedGroupApplications(data) {
    if (!Array.isArray(data.list)) {
        throw new IMError({
            code: 'GATEWAY_GROUP_APPLICATION_LIST_MISSING',
            message: 'Gateway response is missing data.list.',
            source: 'transport',
            cause: data,
        });
    }
    /** applications 保持请求对应的服务端顺序。 */
    const applications = data.list.map(item => item.application);
    if (applications.some(application => !application)) {
        throw new IMError({
            code: 'GATEWAY_GROUP_APPLICATION_MISSING',
            message: 'Gateway response contains an item without application.',
            source: 'transport',
            cause: data,
        });
    }
    return applications;
}
function readUser(data) {
    if (data.user) {
        return data.user;
    }
    const direct = data;
    if (isGatewayUserLike(direct)) {
        return direct;
    }
    const list = readGatewayUserArray(data, 'users') ??
        readGatewayUserArray(data, 'list');
    const first = list?.find(isGatewayUserLike);
    if (!first) {
        throw new IMError({
            code: 'GATEWAY_USER_MISSING',
            message: `Gateway response is missing data.user. keys=${Object.keys(data).join(',')}`,
            source: 'transport',
            cause: data,
        });
    }
    return first;
}
function readUsers(data) {
    if (data.user) {
        return [data.user];
    }
    const direct = data;
    if (isGatewayUserLike(direct)) {
        return [direct];
    }
    const list = readGatewayUserArray(data, 'users') ??
        readGatewayUserArray(data, 'list');
    return list ?? [];
}
function readGatewayUserArray(data, key) {
    const items = readArray(data, key);
    if (!items) {
        return undefined;
    }
    return items
        .map(item => {
        if (isGatewayUserLike(item)) {
            return item;
        }
        if (isRecord(item) && isGatewayUserLike(item.user)) {
            return item.user;
        }
        return null;
    })
        .filter((item) => item !== null);
}
function isGatewayUserLike(value) {
    if (!isRecord(value)) {
        return false;
    }
    return Boolean(value.user_id ||
        value.userID ||
        value.id ||
        value.account ||
        value.username ||
        value.phone ||
        value.email ||
        value.nickname ||
        value.name);
}
function readFriendApplication(data) {
    if (!data.application) {
        throw new IMError({
            code: 'GATEWAY_FRIEND_APPLICATION_MISSING',
            message: 'Gateway response is missing data.application.',
            source: 'transport',
            cause: data,
        });
    }
    return data.application;
}
function readFriend(data) {
    if (!data.friend) {
        throw new IMError({
            code: 'GATEWAY_FRIEND_MISSING',
            message: 'Gateway response is missing data.friend.',
            source: 'transport',
            cause: data,
        });
    }
    return {
        ...data.friend,
        ...(data.user ? { user: data.user } : {}),
    };
}
function readNotificationSetting(data) {
    if (!data.setting) {
        throw new IMError({
            code: 'GATEWAY_NOTIFICATION_SETTING_MISSING',
            message: 'Gateway response is missing data.setting.',
            source: 'transport',
            cause: data,
        });
    }
    return data.setting;
}
function readPermissionSetting(data) {
    if (!data.setting) {
        throw new IMError({
            code: 'GATEWAY_PERMISSION_SETTING_MISSING',
            message: 'Gateway response is missing data.setting.',
            source: 'transport',
            cause: data,
        });
    }
    return data.setting;
}
function readConversation(data) {
    const conversation = data.conversation
        ? normalizeConversationItem(data.conversation)
        : null;
    if (!conversation) {
        throw new IMError({
            code: 'GATEWAY_CONVERSATION_MISSING',
            message: 'Gateway response is missing data.conversation.',
            source: 'transport',
            cause: data,
        });
    }
    return conversation;
}
function readMessage(data) {
    if (!data.message) {
        throw new IMError({
            code: 'GATEWAY_MESSAGE_MISSING',
            message: 'Gateway response is missing data.message.',
            source: 'transport',
            cause: data,
        });
    }
    return data.message;
}
//# sourceMappingURL=client.js.map