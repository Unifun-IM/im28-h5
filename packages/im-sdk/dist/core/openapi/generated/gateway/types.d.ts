export declare namespace GatewayOpenAPI {
    type AcceptFriendApplicationEnvelope = ResponseBase & {
        data?: {
            application?: FriendApplication;
            conversation?: Conversation;
        };
    };
    type AcceptGroupApplicationRequest = {
        application_id: string;
    };
    type AccountStatus = "active" | "disabled";
    type AccountType = "account" | "email" | "phone";
    type AckConversationRequest = {
        /** 要确认送达的会话 ID。 */
        conversation_id: string;
        /** 当前设备已收到的最大消息序号。 */
        delivered_seq: Uint64String;
        /** 当前设备 ID，用于区分不同设备的消息送达状态。 */
        device_id?: string;
    };
    type AddCustomEmojiEnvelope = ResponseBase & {
        data?: {
            emoji?: CustomEmoji;
        };
    };
    type AddCustomEmojiRequest = {
        /** 从收到的 type=115 消息中取得的 emoji_id。 */
        emoji_id: string;
    };
    type AdminListGroupEnvelope = ResponseBase & {
        data?: {
            list?: {
                group?: Group;
            }[];
            total?: number;
        };
    };
    type AdminListGroupRequest = {
        /** 按群 ID、会话 ID、群名或群主 ID 模糊查询。 */
        keyword?: string;
        status?: GroupStatus;
        page?: number;
        page_size?: number;
    };
    type AdminListUserEnvelope = ResponseBase & {
        data?: {
            list?: User[];
            total?: number;
        };
    };
    type AdminListUserRequest = {
        /** 按用户 ID、手机号、邮箱或昵称模糊查询。 */
        keyword?: string;
        status?: AccountStatus;
        page?: number;
        page_size?: number;
    };
    type AdminTraceMessageEnvelope = ResponseBase & {
        data?: {
            list?: {
                message?: Message;
            }[];
        };
    };
    type AdminTraceMessageRequest = {
        trace_id?: string;
        request_id?: string;
        /** 要查看的会话 ID。 */
        conversation_id?: string;
        msg_id?: string;
        client_msg_id?: string;
        sender_id?: string;
        limit?: number;
    };
    type AdminUpgradeGroupRequest = {
        group_id: string;
        /** 后台升级备注。 */
        remark?: string;
    };
    type AnswerCallRequest = {
        call_id: string;
        /** 当前接听设备 ID，可为空。 */
        device_id?: string;
    };
    type ApiCode = 0 | 100001 | 100002 | 100003 | 100004 | 100005 | 100006 | 100007 | 100008 | 100009 | 100010 | 100011 | 100012 | 100013 | 100014 | 100015 | 100016 | 100017 | 100018 | 100019 | 100020 | 100021 | 100022 | 100023 | 100024 | 100025 | 100026;
    type ApplyFriendRequest = {
        target_id: string;
        message?: string;
        /** 添加来源标记。可传 phone、email、user_id、group、card、qrcode。 */
        source_type?: string;
    };
    type ApplyGroupApplicationRequest = {
        group_id: string;
        /** 来源类型，前端标记，例如 search/qrcode/card。 */
        source_type?: string;
        message?: string;
    };
    type ArchiveConversationRequest = {
        /** 要设置归档状态的会话 ID。 */
        conversation_id: string;
        /** true 表示归档，false 表示取消归档。 */
        archived?: boolean;
    };
    type AudioMessage = {
        media_id?: string;
        url?: string;
        duration_seconds?: number;
        size_bytes?: Uint64String;
    };
    type AudioMessageBody = {
        audio: AudioMessage;
    };
    type AuthEnvelope = ResponseBase & {
        data?: {
            token?: Token;
            user?: User;
            sys_user?: SysUser;
            is_new_user?: boolean;
            must_change_password?: boolean;
        };
    };
    type BatchDeleteCustomEmojiRequest = {
        /** 要从当前用户列表中删除的表情 ID。只删除用户关系，不影响底层资源和历史消息。 */
        emoji_ids: string[];
    };
    type BatchDeleteMessageEnvelope = ResponseBase & {
        data?: {
            success_count?: number;
            failed_count?: number;
            list?: BatchDeleteMessageResult[];
        };
    };
    type BatchDeleteMessageItem = {
        /** 要删除的目标消息 ID，可以是自己或对方发送的消息，具体权限由会话类型和 scope 决定。 */
        target_msg_id: string;
        /** 此条删除操作的客户端幂等 ID；重试整批请求时必须保持不变，不能用于另一目标消息或另一 scope。 */
        client_msg_id: string;
    };
    type BatchDeleteMessageRequest = {
        /** 客户端生成的批次追踪 ID，整批重试时保持不变。 */
        batch_id: string;
        /** 本批消息所属的同一个会话 ID。 */
        conversation_id: string;
        /** self 仅当前用户隐藏；all 对会话相关用户全局删除。详细权限与单条删除一致。 */
        scope: "self" | "all";
        /** 可选删除原因，整批消息共用。 */
        reason?: string;
        /** 要删除的消息列表；target_msg_id 和 client_msg_id 在同一批内均不能重复。 */
        items: BatchDeleteMessageItem[];
    };
    type BatchDeleteMessageResult = {
        target_msg_id?: string;
        client_msg_id?: string;
        /** 此条删除的业务结果码，0 表示成功。 */
        code?: number;
        /** 此条删除的业务结果说明。 */
        msg?: string;
        target_message?: Message;
        update?: MessageUpdate;
    };
    type BatchDetailUserEnvelope = ResponseBase & {
        data?: {
            list?: User[];
        };
    };
    type BatchDetailUserRequest = {
        user_ids: string[];
    };
    type BatchForwardMessageComment = {
        /** 补充文字的客户端幂等 ID；不能与 items[].client_msg_id 重复，重试时保持不变。 */
        client_msg_id: string;
        /** 补充文字，作为当前用户发送的普通 type=101 文本消息。 */
        text: string;
    };
    type BatchForwardMessageCommentResult = {
        client_msg_id?: string;
        /** 补充文字的业务结果码，0 表示发送成功。 */
        code?: number;
        /** 补充文字的业务结果说明。 */
        msg?: string;
        data?: SendMessageData;
    };
    type BatchForwardMessageEnvelope = ResponseBase & {
        data?: {
            success_count?: number;
            failed_count?: number;
            list?: BatchForwardMessageResult[];
            comment?: BatchForwardMessageCommentResult;
        };
    };
    type BatchForwardMessageItem = {
        /** 当前用户可见且允许转发的源消息 ID。 */
        source_msg_id: string;
        /** 此条新消息的客户端幂等 ID，重试时保持不变。 */
        client_msg_id: string;
    };
    type BatchForwardMessageRequest = {
        /** 客户端生成的整批追踪 ID；顶层系统错误后原样重试时保持不变。 */
        batch_id: string;
        /** 所有消息共同转发到的目标会话 ID。 */
        conversation_id: string;
        /** 按数组顺序转发；source_msg_id 和 client_msg_id 在批次内都不能重复。 */
        items: BatchForwardMessageItem[];
        comment?: BatchForwardMessageComment;
    };
    type BatchForwardMessageResult = {
        source_msg_id?: string;
        client_msg_id?: string;
        /** 此条消息的业务结果码，0 表示转发成功。 */
        code?: number;
        /** 此条消息的业务结果说明。 */
        msg?: string;
        data?: SendMessageData;
    };
    type BatchPullMessagesEnvelope = ResponseBase & {
        data?: {
            list?: BatchPullMessagesResult[];
        };
    };
    type BatchPullMessagesItem = {
        conversation_id: string;
        from_seq: Uint64String;
        limit?: number;
        desc?: boolean;
    };
    type BatchPullMessagesRequest = {
        items: BatchPullMessagesItem[];
    };
    type BatchPullMessagesResult = {
        conversation_id?: string;
        response?: PullMessagesData;
        error_code?: string;
        error_message?: string;
    };
    type BatchSendMessageEnvelope = ResponseBase & {
        data?: {
            success_count?: number;
            failed_count?: number;
            list?: BatchSendMessageResult[];
        };
    };
    type BatchSendMessageRequest = {
        /** 客户端生成的整批幂等及追踪 ID，重试时保持不变。 */
        batch_id: string;
        body?: MessageBody;
        /** 要批量转发的源消息 ID，所有目标共享同一份服务端内容副本。 */
        source_msg_id?: string;
        /** 所有目标消息共用的文本范围实体；批量转发时继承源消息实体。 */
        entities?: MessageEntity[];
        /** 好友和群聊目标可以混合传入；同一好友或群聊不能重复。 */
        targets: BatchSendMessageTarget[];
    };
    type BatchSendMessageResult = {
        friend_user_id?: string;
        group_id?: string;
        conversation_id?: string;
        client_msg_id?: string;
        /** 此目标的业务结果码，0 表示发送成功。 */
        code?: number;
        /** 此目标的业务结果说明。 */
        msg?: string;
        message?: Message;
    };
    type BatchSendMessageTarget = {
        /** 好友用户 ID。与 `group_id` 必须且只能传一个。 */
        friend_user_id?: string;
        /** 群 ID。与 `friend_user_id` 必须且只能传一个。 */
        group_id?: string;
        /** 此目标会话内的消息幂等 ID，重试时保持不变。 */
        client_msg_id: string;
        /** 此目标会话独立的 @ 目标。 */
        mentions?: MentionTarget[];
    };
    type BindContactRequest = {
        /** 绑定类型。 */
        type: "phone" | "email";
        /** 绑定值。`type=phone` 时传 11 位大陆手机号，`type=email` 时传邮箱且网关会校验邮箱格式。 */
        account: string;
        /** type=phone 时必填且当前仅允许 +86；非 +86 手机号暂不支持绑定。 */
        phone_area_code?: string;
        /** 当前阶段固定传 `666666`，错误时返回“验证码错误或验证失败”。 */
        verification_code: string;
    };
    type BlacklistItem = {
        user_id?: string;
        blocked_user_id?: string;
        created_at?: RFC3339Time;
    };
    type BlacklistListItem = {
        black?: BlacklistItem;
        user?: User;
    };
    type BlacklistRequest = {
        blocked_user_id: string;
    };
    type Call = {
        /** 服务端生成的通话 ID。 */
        call_id?: string;
        /** 主叫客户端生成的幂等 ID。 */
        client_call_id?: string;
        /** 单聊会话 ID；当前不支持群会话。 */
        conversation_id?: string;
        /** 服务端生成的 LiveKit room name。 */
        room_name?: string;
        /** 主叫用户 ID。 */
        caller_id?: string;
        call_type?: CallType;
        status?: CallStatus;
        /** 发起时间，RFC3339Nano 格式。 */
        started_at?: string;
        /** 接听时间；未接听时为空字符串。 */
        answered_at?: string;
        /** 结束时间；未结束时为空字符串。 */
        ended_at?: string;
        /** 结束或失败原因。 */
        end_reason?: string;
    };
    type CallEnvelope = ResponseBase & {
        data?: {
            call?: Call;
        };
    };
    type CallIDRequest = {
        call_id: string;
    };
    type CallParticipant = {
        call_id?: string;
        user_id?: string;
        device_id?: string;
        role?: "caller" | "callee";
        status?: "ringing" | "joined" | "left" | "rejected";
        /** 入房时间，未入房时为空字符串。 */
        joined_at?: string;
        /** 离房时间，未离房时为空字符串。 */
        left_at?: string;
    };
    type CallPeerUser = {
        user_id?: string;
        nickname?: string;
        avatar_url?: string;
    };
    type CallStatus = "ringing" | "active" | "ended" | "canceled" | "rejected" | "missed" | "failed";
    type CallTokenEnvelope = ResponseBase & {
        data?: {
            call?: Call;
            livekit_url?: string;
            livekit_token?: string;
            expires_in?: number;
            e2ee_required?: boolean;
        };
    };
    type CallType = "audio" | "video";
    type CancelGroupAdminRequest = {
        group_id: string;
        member_user_ids: string[];
    };
    type CardGroup = {
        /** 群 ID。发送群名片时客户端只需提供此字段。 */
        group_id: string;
        /** 群名称快照。发送时由服务端按 group_id 查询并回填，客户端传值会被忽略。 */
        title?: string;
        /** 群头像快照。发送时由服务端按 group_id 查询并回填，客户端传值会被忽略。 */
        avatar_url?: string;
        /** 群成员数快照。发送时由服务端按 group_id 查询并回填，客户端传值会被忽略。 */
        member_count?: number;
        /** 群简介快照。发送时由服务端按 group_id 查询并回填，客户端传值会被忽略；服务端按 Unicode 字符截取前 50 个，群未设置简介时为空字符串。 */
        description?: string;
    };
    type CardMessage = {
        /** 名片类型。user=用户名片，group=群名片。 */
        type: "user" | "group";
        user?: CardUser;
        group?: CardGroup;
    };
    type CardMessageBody = {
        card: CardMessage;
    };
    type CardUser = {
        user_id: string;
        nickname?: string;
        avatar_url?: string;
    };
    type CheckClientVersionEnvelope = ResponseBase & {
        data?: {
            need_update?: boolean;
            client_version?: ClientVersion;
        };
    };
    type CheckClientVersionRequest = {
        /** 客户端平台，如 ios/android/windows/macos/web。 */
        platform: string;
        /** 当前客户端版本号。 */
        version?: string;
        /** 当前客户端构建号，可选；不传按 0 处理。 */
        build_number?: Uint64String;
    };
    type CheckSysPermissionEnvelope = ResponseBase & {
        data?: {
            allowed?: boolean;
        };
    };
    type CheckSysPermissionRequest = {
        permission_key: string;
    };
    type CheckTokenEnvelope = ResponseBase & {
        data?: {
            valid?: boolean;
            subject_type?: SubjectType;
            subject_id?: string;
            roles?: string[];
            permissions?: string[];
            must_change_password?: boolean;
        };
    };
    type CheckTokenRequest = {
        access_token: string;
    };
    type ClearConversationRequest = {
        /** 要清空记录的会话 ID。 */
        conversation_id: string;
        /** 清空范围。self 仅自己；both 单聊双方；all_members 群主或有清空群聊消息权限的管理员清空所有群成员。 */
        scope?: "self" | "both" | "all_members";
        /** 可选。前端生成的操作唯一 ID；重试时保持不变，避免重复清空和重复通知。 */
        operation_id?: string;
    };
    type ClientVersion = {
        id?: Uint64String;
        /** 客户端平台，如 ios/android/windows/macos/web。 */
        platform?: string;
        version?: string;
        build_number?: Uint64String;
        /** 是否强制更新。 */
        force_update?: boolean;
        download_url?: string;
        title?: string;
        description?: string;
        is_enable?: boolean;
        created_at?: RFC3339Time;
        updated_at?: RFC3339Time;
    };
    type Conversation = {
        type?: ConversationType;
        direct_conversation?: DirectConversation;
        group_conversation?: GroupConversation;
    };
    type ConversationCursor = {
        conversation_id?: string;
        /** 当前用户会话状态。left 或 removed 时，客户端应从本地会话列表移除该会话。 */
        state?: "active" | "left" | "removed" | "muted";
        last_msg_seq?: Uint64String;
        /** 当前会话最新消息编辑或删除更新序号。 */
        last_update_seq?: Uint64String;
        last_read_seq?: Uint64String;
        last_delivered_seq?: Uint64String;
        version?: Uint64String;
        unread_count?: number;
        clear_before_seq?: Uint64String;
        /** 当前用户置顶此会话的时间；空字符串表示未置顶。 */
        pinned_at?: RFC3339Time;
        /** 当前用户置顶区排序权重；值越大越靠前，未置顶为 0。 */
        pinned_sort?: number;
        /** 当前用户是否对该会话开启免打扰。 */
        notification_muted?: boolean;
        /** 当前用户是否手动标记该会话未读。 */
        manual_unread?: boolean;
        /** 当前用户是否已归档该会话。 */
        archived?: boolean;
    };
    type ConversationCursorEnvelope = ResponseBase & {
        data?: {
            state?: ConversationCursor;
        };
    };
    type ConversationExitInfo = {
        /** 当前用户退出态。 */
        state?: "left" | "removed";
        /** 触发退出态的操作人用户 ID；主动退出时为当前用户。 */
        operator_user_id?: string;
        operator_role?: RoleLevel;
        /** 退出原因。 */
        reason?: "left" | "removed" | "dismissed";
        occurred_at?: RFC3339Time;
        operator_user?: User;
    };
    type ConversationReadState = {
        conversation_id?: string;
        user_id?: string;
        last_read_seq?: Uint64String;
        read_at?: RFC3339Time;
    };
    type ConversationReadStateEnvelope = ResponseBase & {
        data?: {
            list?: {
                state?: ConversationReadState;
            }[];
        };
    };
    type ConversationReadStateRequest = {
        /** 要查询已读状态的会话 ID。 */
        conversation_id: string;
        /** 要查询已读位置的用户 ID 列表。 */
        user_ids: string[];
    };
    type ConversationSetting = {
        conversation_id?: string;
        type?: ConversationType;
        /** 当前用户是否置顶该会话。 */
        is_pinned?: boolean;
        /** 当前用户置顶此会话的时间；空字符串表示未置顶。 */
        pinned_at?: RFC3339Time;
        /** 当前用户置顶区排序权重；值越大越靠前，未置顶为 0。 */
        pinned_sort?: number;
        /** 当前用户是否对该会话开启免打扰；不影响消息投递和未读数，只影响提醒展示。 */
        notification_muted?: boolean;
        /** 当前用户是否手动标记该会话未读；不影响真实已读游标和真实未读数。 */
        manual_unread?: boolean;
        /** 当前用户是否已归档该会话。 */
        archived?: boolean;
        /** 自动删除消息秒数，0 表示关闭；只影响设置后新发送的消息。 */
        auto_delete_seconds?: number;
        /** 自动删除设置最后修改用户 ID。 */
        auto_delete_updated_by?: string;
        /** 自动删除设置最后修改时间；空字符串表示未设置过。 */
        auto_delete_updated_at?: RFC3339Time;
    };
    type ConversationType = 1 | 3 | 4;
    type CreateCustomEmojiEnvelope = ResponseBase & {
        data?: {
            list?: CreateCustomEmojiResponseDataWrap[];
        };
    };
    type CreateCustomEmojiRequest = {
        /** 通过 `/v1/common/upload-credential` 上传成功后得到的对象 Key；仅支持 jpg、jpeg、png、gif、webp 图片。 */
        object_keys: string[];
    };
    type CreateCustomEmojiResponseDataWrap = {
        emoji?: CustomEmoji;
    };
    type CreateGroupRequest = {
        title: string;
        avatar_url?: string;
        /** 群简介。 */
        description?: string;
        /** 群公告。 */
        announcement?: string;
        /** 初始成员用户 ID 列表；调用方会自动加入。 */
        member_user_ids?: string[];
    };
    type CreateSysPermissionRequest = {
        key: string;
        name: string;
        description?: string;
        type?: string;
        is_enable?: boolean;
    };
    type CreateSysRoleRequest = {
        code: string;
        name: string;
        description?: string;
        is_enable?: boolean;
        permission_ids?: number[];
    };
    type CreateSysUserRequest = {
        username: string;
        display_name?: string;
        description?: string;
        status?: AccountStatus;
        role_ids?: number[];
    };
    type CustomEmoji = {
        /** 全局稳定的自定义表情 ID；发送和添加别人表情时使用该字段。 */
        emoji_id: string;
        /** 自定义表情的正式访问地址。 */
        url: string;
        added_at: RFC3339Time;
    };
    type CustomMessage = {
        /** 自定义业务类型。通话历史消息使用 type=110、key=rtc.call.summary；1601-1608 通话过程通知改用 body.system。 */
        key: string;
        /** 自定义 JSON 字符串。rtc.call.summary 包含 call_id、conversation_id、call_type、room_name、caller_id、operator_id、status、status_text、reason_code、reason、e2ee_required、started_at、answered_at、ended_at、duration_seconds。 */
        data?: string;
    };
    type CustomMessageBody = {
        custom: CustomMessage;
    };
    type DeleteCallRecordsRequest = {
        /** 需要从当前用户通话记录中隐藏的通话 ID，单次最多 100 条。 */
        call_ids: string[];
    };
    type DeleteFriendRequest = {
        friend_user_id: string;
        /** self 仅清空自己的聊天记录；both 清空双方聊天记录。 */
        clear_scope: "self" | "both";
        /** 前端生成的本次删除操作唯一 ID，用于关系通知和清空操作幂等。 */
        operation_id: string;
    };
    type DeleteMessageOperation = {
        /** self 仅当前用户隐藏，允许删除会话内任意消息；all 对会话相关用户全局删除。单聊双方均可删除任意一方消息；群聊中可删除自己的消息，群主可删除任意成员消息，管理员需具备清理消息权限才能删除其他成员消息。 */
        scope: "self" | "all";
        reason?: string;
    };
    type DeleteSysPermissionRequest = {
        id: number;
    };
    type DeleteSysRoleRequest = {
        id: number;
    };
    type DeleteSysUserRequest = {
        id: number;
    };
    type DetailCallEnvelope = ResponseBase & {
        data?: {
            call?: Call;
            participants?: CallParticipant[];
        };
    };
    type DetailCallV2Envelope = ResponseBase & {
        data?: {
            call?: Call;
            participants?: CallParticipant[];
            direction?: "outgoing" | "incoming";
            peer_user?: CallPeerUser;
        };
    };
    type DetailConversationEnvelope = ResponseBase & {
        data?: {
            conversation?: Conversation;
        };
    };
    type DetailConversationRequest = {
        conversation_id: string;
    };
    type DetailConversationSettingEnvelope = ResponseBase & {
        data?: {
            setting?: ConversationSetting;
        };
    };
    type DetailConversationSettingRequest = {
        /** 要查询设置的会话 ID。 */
        conversation_id: string;
    };
    type DetailCurrentUserEnvelope = ResponseBase & {
        data?: {
            user?: User;
            permission?: UserPermissionSetting;
        };
    };
    type DetailFriendEnvelope = ResponseBase & {
        data?: {
            friend?: Friend;
            user?: User;
            permission?: UserPermissionSetting;
        };
    };
    type DetailFriendRequest = {
        friend_user_id: string;
    };
    type DetailSysPermissionRequest = {
        id: number;
    };
    type DetailSysRoleRequest = {
        id: number;
    };
    type DetailSysUserRequest = {
        id: number;
    };
    type DetailUserEnvelope = ResponseBase & {
        data?: {
            user?: User;
            is_friend?: boolean;
            permission?: UserPermissionSetting;
        };
    };
    type DetailUserRequest = {
        /** 目标用户 ID。 */
        user_id: string;
    };
    type DirectConversation = {
        conversation_id?: string;
        /** 单聊对端用户 ID。 */
        peer_user_id?: string;
        user?: User;
        last_msg_seq?: Uint64String;
        /** 当前会话最新消息编辑或删除更新序号。 */
        last_update_seq?: Uint64String;
        version?: Uint64String;
        my_user_state?: "active" | "left" | "removed" | "muted";
        join_seq?: Uint64String;
        leave_seq?: Uint64String;
        last_read_seq?: Uint64String;
        last_delivered_seq?: Uint64String;
        clear_before_seq?: Uint64String;
        last_message?: Message;
        unread_count?: number;
        created_at?: RFC3339Time;
        updated_at?: RFC3339Time;
        /** 当前用户置顶此会话的时间；空字符串表示未置顶。 */
        pinned_at?: RFC3339Time;
        /** 当前用户置顶区排序权重；值越大越靠前，未置顶为 0。 */
        pinned_sort?: number;
        /** 自动删除消息秒数，0 表示关闭；只影响设置后新发送的消息。 */
        auto_delete_seconds?: number;
        /** 自动删除设置最后修改用户 ID。 */
        auto_delete_updated_by?: string;
        /** 自动删除设置最后修改时间；空字符串表示未设置过。 */
        auto_delete_updated_at?: RFC3339Time;
        /** 当前用户是否对该会话开启免打扰；不影响消息投递和未读数，只影响提醒展示。 */
        notification_muted?: boolean;
        /** 当前用户是否手动标记该会话未读；不影响真实已读游标和真实未读数。 */
        manual_unread?: boolean;
        /** 当前用户是否已归档该会话。 */
        archived?: boolean;
    };
    type DismissGroupRequest = {
        group_id: string;
    };
    type EditMessageOperation = {
        body: MessageBody;
        /** 编辑后的完整消息级 @ 目标；省略或传空数组表示清除原 @ 信息。 */
        mentions?: MentionTarget[];
        /** 编辑后的完整文本范围实体；省略或传空数组表示清除原实体。 */
        entities?: MessageEntity[];
    };
    type EmojiMessage = {
        /** 自定义表情 ID。发送时必填，服务端据此读取底层资源。 */
        emoji_id: string;
        /** 表情地址快照。发送请求无需填写，由服务端根据 emoji_id 回填；消息响应和推送中返回。 */
        url?: string;
    };
    type EmojiMessageBody = {
        emoji: EmojiMessage;
    };
    type ErrorResponse = ResponseBase;
    type FileMessage = {
        media_id?: string;
        url?: string;
        name?: string;
        mime_type?: string;
        size_bytes?: Uint64String;
    };
    type FileMessageBody = {
        file: FileMessage;
    };
    type ForwardOrigin = {
        /** 来源类型，当前固定为 user。 */
        type: "user";
        /** 最初来源消息的发送者用户 ID。 */
        user_id: string;
        /** 来源用户展示昵称；HTTP 返回由 users 中的用户资料补充。 */
        name?: string;
        /** 来源用户头像 URL；HTTP 返回由 users 中的用户资料补充。 */
        avatar_url?: string;
    };
    type Friend = {
        user_id?: string;
        friend_user_id?: string;
        /** 当前用户给好友设置的别名，用于会话和好友列表展示覆盖。 */
        alias?: string;
        /** 当前用户给好友设置的手机号备注。 */
        phone?: string;
        /** 当前用户给好友设置的备注。 */
        remark?: string;
        /** 当前用户给好友设置的标签，数据库使用 JSON 数组保存。 */
        tags?: string[];
        /** 当前用户是否已将该好友标记为星标。 */
        is_starred?: boolean;
        /** 建立好友关系时的来源类型，来自好友申请 source_type。 */
        source_type?: string;
        created_at?: RFC3339Time;
    };
    type FriendApplication = {
        application_id?: string;
        requester_id?: string;
        target_id?: string;
        message?: string;
        /** 添加来源标记，只用于记录来源，最终目标用户仍通过 target_id 确定。 */
        source_type?: "phone" | "email" | "user_id" | "group" | "card" | "qrcode";
        status?: FriendApplicationStatus;
        /** 当前用户作为申请接收方时是否已读；当前用户是发起方时固定为 true。 */
        is_read?: boolean;
        handled_at?: RFC3339Time;
        created_at?: RFC3339Time;
        updated_at?: RFC3339Time;
    };
    type FriendApplicationEnvelope = ResponseBase & {
        data?: {
            application?: FriendApplication;
        };
    };
    type FriendApplicationListItem = {
        application?: FriendApplication;
        /** 对方用户信息；sent 时为目标用户，received 时为申请人。 */
        user?: User;
        type?: FriendApplicationListType;
    };
    type FriendApplicationListType = "sent" | "received";
    type FriendApplicationStatus = "pending" | "accepted" | "rejected" | "canceled" | "expired";
    type FriendApplicationUnreadCountEnvelope = ResponseBase & {
        data?: {
            unread_count?: number;
        };
    };
    type FriendApplicationUnreadCountRequest = {};
    type FriendListItem = {
        friend?: Friend;
        user?: User;
        /** 好友当前权限配置；前端可据此控制直接群邀请等入口，服务端仍会再次校验。 */
        permission?: UserPermissionSetting;
    };
    type GetGroupAnnouncementReadStatusEnvelope = ResponseBase & {
        data?: {
            announcement_version?: Uint64String;
            announcement_read_version?: Uint64String;
            is_read?: boolean;
        };
    };
    type GetGroupAnnouncementReadStatusRequest = {
        group_id: string;
    };
    type GetGroupRequest = {
        group_id: string;
    };
    type GetPlatformTermRequest = {
        /** 条款业务键，例如 user_agreement、privacy_policy。 */
        key: string;
    };
    type Group = {
        group_id?: string;
        conversation_id?: string;
        title?: string;
        avatar_url?: string;
        /** 群简介。 */
        description?: string;
        /** 群公告。 */
        announcement?: string;
        /** 群公告版本；公告内容变化时递增。 */
        announcement_version?: Uint64String;
        owner_user_id?: string;
        mode?: GroupType;
        status?: GroupStatus;
        member_count?: number;
        /** 全体禁言开关；普通成员不能发言，群主仍可发言，管理员由 admin_send_message 控制。 */
        mute_all?: boolean;
        /** 普通成员禁言开关；开启后仅普通成员不能发言。 */
        mute_member?: boolean;
        /** 群发言频率开关；开启后普通成员按 send_frequency_seconds 限制发言间隔。 */
        send_frequency_enabled?: boolean;
        /** 群发言频率间隔秒数。 */
        send_frequency_seconds?: 30 | 60 | 180 | 300 | 600 | 1800 | 3600;
        /** 入群是否需要审核。 */
        join_approval_required?: boolean;
        /** 是否允许群成员互相加好友。 */
        allow_member_add_friend?: boolean;
        /** 是否允许普通成员邀请用户入群；开启入群验证时普通成员仍不能邀请。 */
        allow_member_invite?: boolean;
        /** 是否允许群成员设置群昵称。 */
        allow_member_nickname?: boolean;
        /** 全体禁言时管理员是否可以发消息；未开启全体禁言时不限制管理员日常发言。 */
        admin_send_message?: boolean;
        /** 管理员是否可以手动禁言成员。 */
        admin_mute_member?: boolean;
        /** 管理员是否可以移除成员。 */
        admin_remove_member?: boolean;
        /** 管理员是否可以邀请好友加群。 */
        admin_invite_member?: boolean;
        /** 管理员是否可以审核入群申请或邀请。 */
        admin_audit_application?: boolean;
        /** 管理员是否可以清空群聊消息。 */
        admin_clear_message?: boolean;
        /** 管理员是否可以修改群资料。 */
        admin_update_profile?: boolean;
        created_at?: RFC3339Time;
        updated_at?: RFC3339Time;
    };
    type GroupApplication = {
        application_id?: string;
        group_id?: string;
        /** 申请人；邀请入群时表示被邀请人。 */
        requester_user_id?: string;
        /** 邀请人；主动申请时为空。 */
        inviter_user_id?: string;
        type?: "apply" | "invite";
        source_type?: string;
        message?: string;
        status?: "pending" | "accepted" | "rejected";
        handled_by?: string;
        handled_at?: RFC3339Time;
        created_at?: RFC3339Time;
        updated_at?: RFC3339Time;
    };
    type GroupApplicationEnvelope = ResponseBase & {
        data?: {
            application?: GroupApplication;
        };
    };
    type GroupConversation = {
        conversation_id?: string;
        group_id?: string;
        group_type?: GroupType;
        title?: string;
        avatar_url?: string;
        member_count?: number;
        last_msg_seq?: Uint64String;
        /** 当前会话最新消息编辑或删除更新序号。 */
        last_update_seq?: Uint64String;
        version?: Uint64String;
        my_user_state?: "active" | "left" | "removed" | "muted";
        my_role?: RoleLevel;
        join_seq?: Uint64String;
        leave_seq?: Uint64String;
        last_read_seq?: Uint64String;
        last_delivered_seq?: Uint64String;
        clear_before_seq?: Uint64String;
        last_message?: Message;
        unread_count?: number;
        created_at?: RFC3339Time;
        updated_at?: RFC3339Time;
        /** 当前用户置顶此会话的时间；空字符串表示未置顶。 */
        pinned_at?: RFC3339Time;
        /** 当前用户置顶区排序权重；值越大越靠前，未置顶为 0。 */
        pinned_sort?: number;
        /** 自动删除消息秒数，0 表示关闭；只影响设置后新发送的消息。 */
        auto_delete_seconds?: number;
        /** 自动删除设置最后修改用户 ID。 */
        auto_delete_updated_by?: string;
        /** 自动删除设置最后修改时间；空字符串表示未设置过。 */
        auto_delete_updated_at?: RFC3339Time;
        /** 当前用户是否对该会话开启免打扰；不影响消息投递和未读数，只影响提醒展示。 */
        notification_muted?: boolean;
        /** 当前用户是否手动标记该会话未读；不影响真实已读游标和真实未读数。 */
        manual_unread?: boolean;
        /** 当前用户是否已归档该会话。 */
        archived?: boolean;
        exit_info?: ConversationExitInfo;
    };
    type GroupEnvelope = ResponseBase & {
        data?: {
            group?: Group;
            user_permission?: GroupUserPermission;
        };
    };
    type GroupMember = {
        group_id?: string;
        user_id?: string;
        /** 群内昵称；空表示前端使用用户昵称。 */
        nickname?: string;
        role?: RoleLevel;
        state?: "active" | "left" | "removed" | "banned";
        joined_at?: RFC3339Time;
        updated_at?: RFC3339Time;
        /** 成员单独禁言到期时间；空表示未单独禁言。 */
        mute_until?: RFC3339Time;
        /** 是否被单独禁言；用于管理筛选。 */
        is_muted?: boolean;
        /** 成为当前管理员的时间；非管理员为空。 */
        admin_since?: RFC3339Time;
    };
    type GroupMemberFilter = 0 | 1 | 2 | 3 | 4 | 5;
    type GroupStatus = 0 | 1 | 2 | 3;
    type GroupType = 1 | 2;
    type GroupUserPermission = {
        role?: RoleLevel;
        state?: "active" | "left" | "removed" | "banned";
        /** 是否被群封禁；当前等同于成员状态 banned。 */
        is_banned?: boolean;
        /** 是否已被移出群。 */
        is_removed?: boolean;
        /** 是否已主动退群。 */
        is_left?: boolean;
        /** 是否正在被禁言，包含群全体禁言、普通成员禁言、单成员禁言。 */
        is_muted?: boolean;
        /** 是否因为群全体禁言或普通成员禁言而不能发言。 */
        group_muted?: boolean;
        /** 是否因为单成员禁言而不能发言。 */
        member_muted?: boolean;
        mute_until?: RFC3339Time;
        can_send_message?: boolean;
        can_invite_member?: boolean;
        can_audit_application?: boolean;
        can_mute_member?: boolean;
        can_remove_member?: boolean;
        can_clear_message?: boolean;
        can_update_profile?: boolean;
    };
    type HandleFriendApplicationRequest = {
        application_id: string;
    };
    type HangupCallRequest = {
        call_id: string;
        /** 挂断原因；为空时服务端使用 hangup。 */
        reason?: string;
    };
    type HealthResponse = ResponseBase & {
        data?: {
            status?: string;
        };
    };
    type ImageItem = {
        media_id?: string;
        url?: string;
        thumbnail_url?: string;
        width?: number;
        height?: number;
        size_bytes?: Uint64String;
    };
    type ImageMessage = {
        list: ImageItem[];
    };
    type ImageMessageBody = {
        image: ImageMessage;
    };
    type InviteGroupApplicationEnvelope = ResponseBase & {
        data?: {
            list?: {
                application?: GroupApplication;
            }[];
        };
    };
    type InviteGroupApplicationRequest = {
        group_id: string;
        /** 被邀请用户 ID 列表。 */
        requester_user_ids: string[];
        /** 来源类型，前端标记。 */
        source_type?: string;
        message?: string;
    };
    type InviteGroupMemberRequest = {
        group_id: string;
        member_user_ids: string[];
    };
    type LeaveGroupRequest = {
        group_id: string;
        /** 是否全局清除本人退出前在本群发送的历史消息；清除后所有成员均不可见。 */
        clear_history?: boolean;
    };
    type ListAuditGroupApplicationEnvelope = ResponseBase & {
        data?: {
            list?: {
                application?: GroupApplication;
                group?: Group;
                requester_user?: User;
            }[];
            total?: number;
        };
    };
    type ListAuditGroupApplicationRequest = {
        page?: number;
        page_size?: number;
    };
    type ListBlacklistEnvelope = ResponseBase & {
        data?: {
            list?: BlacklistListItem[];
            total?: number;
        };
    };
    type ListBlacklistRequest = {
        page?: number;
        page_size?: number;
    };
    type ListCallEnvelope = ResponseBase & {
        data?: {
            list?: Call[];
            total?: number;
        };
    };
    type ListCallRequest = {
        /** 可选，按单聊会话筛选。 */
        conversation_id?: string;
        /** 可选。answered=已接通；missed=当前用户作为被叫时未接。自己呼出但对方未接不会进入 missed；不传或传空字符串表示全部通话。进行中的 ringing/active 通话只会出现在全部通话中。 */
        answer_status?: "answered" | "missed";
        /** 页码，从 1 开始；不传默认 1。 */
        page?: number;
        /** 每页数量，最大 50；不传默认 20。 */
        page_size?: number;
    };
    type ListCallV2Envelope = ResponseBase & {
        data?: {
            list?: ListCallV2ResponseDataWrap[];
            total?: number;
        };
    };
    type ListCallV2ResponseDataWrap = {
        call?: Call;
        /** 相对当前用户的通话方向。outgoing=呼出，incoming=呼入。 */
        direction?: "outgoing" | "incoming";
        /** answered=已接通；missed=当前用户作为被叫时未接。呼出未接通及进行中的通话返回空字符串。 */
        answer_status?: "answered" | "missed" | "";
        peer_user?: CallPeerUser;
    };
    type ListCommonGroupEnvelope = ResponseBase & {
        data?: {
            list?: {
                group?: Group;
            }[];
            next_page_token?: string;
            total?: number;
        };
    };
    type ListCommonGroupRequest = {
        /** 目标用户 ID。 */
        target_user_id: string;
        limit?: number;
        page_token?: string;
    };
    type ListConversationEnvelope = ResponseBase & {
        data?: {
            list?: {
                conversation?: Conversation;
            }[];
            next_page_token?: string;
        };
    };
    type ListConversationRequest = {
        /** 分页大小。 */
        limit?: number;
        /** 上一页返回的分页游标。 */
        page_token?: string;
    };
    type ListCustomEmojiEnvelope = ResponseBase & {
        data?: {
            list?: ListCustomEmojiResponseDataWrap[];
            total?: number;
            max_count?: number;
        };
    };
    type ListCustomEmojiResponseDataWrap = {
        emoji?: CustomEmoji;
    };
    type ListFriendApplicationEnvelope = ResponseBase & {
        data?: {
            list?: FriendApplicationListItem[];
            total?: number;
        };
    };
    type ListFriendApplicationRequest = {
        page?: number;
        page_size?: number;
    };
    type ListFriendEnvelope = ResponseBase & {
        data?: {
            list?: FriendListItem[];
            total?: number;
        };
    };
    type ListFriendRequest = {
        page?: number;
        page_size?: number;
    };
    type ListGroupAdminRequest = {
        group_id: string;
        limit?: number;
        page_token?: string;
    };
    type ListGroupApplicationEnvelope = ResponseBase & {
        data?: {
            list?: {
                application?: GroupApplication;
                requester_user?: User;
                inviter_user?: User;
            }[];
            total?: number;
        };
    };
    type ListGroupApplicationRequest = {
        group_id: string;
        status?: "pending" | "accepted" | "rejected";
        type?: "apply" | "invite";
        page?: number;
        page_size?: number;
    };
    type ListGroupMemberEnvelope = ResponseBase & {
        data?: {
            list?: {
                member?: GroupMember;
                user?: User;
            }[];
            next_page_token?: string;
        };
    };
    type ListGroupMemberRequest = {
        group_id: string;
        limit?: number;
        page_token?: string;
        filter?: GroupMemberFilter;
        /** 是否仅查看被单独禁言的成员。 */
        muted_only?: boolean;
    };
    type ListMyGroupEnvelope = ResponseBase & {
        data?: {
            list?: {
                group?: Group;
                member?: GroupMember;
            }[];
            next_page_token?: string;
        };
    };
    type ListMyGroupRequest = {
        limit?: number;
        page_token?: string;
    };
    type ListPresenceEnvelope = ResponseBase & {
        data?: {
            list?: UserPresence[];
        };
    };
    type ListPresenceRequest = {
        /** 要查询的用户 ID；服务端自动去重。 */
        user_ids: string[];
    };
    type ListSysPermissionEnvelope = ResponseBase & {
        data?: {
            list?: SysPermission[];
            total?: number;
        };
    };
    type ListSysPermissionRequest = {
        page?: number;
        page_size?: number;
        keyword?: string;
        type?: string;
        is_enable?: boolean;
    };
    type ListSysRoleEnvelope = ResponseBase & {
        data?: {
            list?: SysRoleWrap[];
            total?: number;
        };
    };
    type ListSysRoleRequest = {
        page?: number;
        page_size?: number;
        keyword?: string;
        is_enable?: boolean;
    };
    type ListSysUserEnvelope = ResponseBase & {
        data?: {
            list?: SysUserWrap[];
            total?: number;
        };
    };
    type ListSysUserRequest = {
        page?: number;
        page_size?: number;
        keyword?: string;
        role_id?: number;
        status?: AccountStatus;
    };
    type LogoutRequest = {
        access_token?: string;
    };
    type MarkConversationUnreadRequest = {
        /** 要设置手动未读标记的会话 ID。 */
        conversation_id: string;
        /** true 表示标记未读，false 表示取消手动未读标记；不影响真实已读游标和真实未读数。 */
        manual_unread?: boolean;
    };
    type MarkFriendApplicationsReadRequest = {
        /** 可选。不传或传空数组时，标记当前用户收到的全部待验证申请为已读。 */
        application_ids?: string[];
    };
    type MarkReadRequest = {
        /** 要标记已读的会话 ID。 */
        conversation_id: string;
        /** 前端确认已读到的消息序号；不传或传 0 表示标记到服务端当前最新消息序号，兼容旧逻辑。 */
        read_seq?: Uint64String;
    };
    type MentionTarget = {
        /** @目标类型：user=用户，all=所有人 */
        type?: "user" | "all";
        /** 被@用户ID；type=all时为空 */
        user_id?: string;
        /** 展示昵称；type=all时为所有人 */
        nickname?: string;
    };
    type Message = {
        msg_id?: string;
        conversation_id?: string;
        msg_seq?: Uint64String;
        sender_id?: string;
        client_msg_id?: string;
        type?: MessageType;
        /** 消息状态。1=发送中，2=发送成功，3=发送失败，5=已删除。 */
        status?: 1 | 2 | 3 | 5;
        body?: MessageBody;
        /** 消息内容版本，首次发送为 1，每次编辑递增。 */
        version?: Uint64String;
        /** 最后编辑时间；未编辑时为空。 */
        edited_at?: RFC3339Time;
        /** 消息级@目标列表。 */
        mentions?: MentionTarget[];
        /** 消息文本范围实体。历史拉取、发送响应和 WebSocket 推送使用相同结构。 */
        entities?: MessageEntity[];
        sent_at?: RFC3339Time;
        updated_at?: RFC3339Time;
        /** 消息自动删除时间；空字符串表示不会自动删除。 */
        expire_at?: RFC3339Time;
        forward_origin?: ForwardOrigin;
    };
    type MessageBody = Record<string, any>;
    type MessageEntity = {
        /** 实体类型。 */
        type: string;
        /** 实体在文本中的起始偏移量。 */
        offset?: number;
        /** 实体覆盖的文本长度。 */
        length: number;
        /** 预设资源 ID；当前实体类型不需要时为空。 */
        preset_id?: string;
    };
    type MessageType = 101 | 102 | 103 | 104 | 105 | 108 | 110 | 113 | 114 | 115 | 1200 | 1201 | 1202 | 1400 | 1501 | 1502 | 1503 | 1504 | 1507 | 1508 | 1509 | 1510 | 1511 | 1512 | 1513 | 1514 | 1515 | 1516 | 1519 | 1520 | 1521 | 1601 | 1602 | 1603 | 1604 | 1605 | 1606 | 1607 | 1608 | 1701 | 2102;
    type MessageUpdate = {
        update_id?: string;
        conversation_id?: string;
        update_seq?: Uint64String;
        type?: "edited" | "deleted";
        target_msg_id?: string;
        operator_user_id?: string;
        delete_scope?: "self" | "all";
        message?: Message;
        occurred_at?: RFC3339Time;
    };
    type MuteConversationRequest = {
        /** 要设置免打扰状态的会话 ID。 */
        conversation_id: string;
        /** true 表示开启免打扰，false 表示关闭免打扰；不影响消息投递和未读数。 */
        notification_muted?: boolean;
    };
    type NotificationType = "private_chat" | "group_chat" | "mention" | "application" | "system_notice" | "call" | "notification";
    type OpenDirectConversationEnvelope = ResponseBase & {
        data?: {
            conversation?: Conversation;
        };
    };
    type OpenDirectConversationRequest = {
        /** 对方用户 ID。 */
        peer_user_id: string;
    };
    type PendingCallEnvelope = ResponseBase & {
        data?: {
            has_pending?: boolean;
            call?: Call;
        };
    };
    type PermissionType = "friend_apply_verify" | "allow_search" | "allow_group_invite" | "show_gender" | "show_bio";
    type PinConversationRequest = {
        /** 要设置置顶状态的会话 ID。 */
        conversation_id: string;
        /** true 表示置顶，false 表示取消置顶。 */
        is_pinned?: boolean;
    };
    type PlatformTerm = {
        id?: Uint64String;
        /** 条款业务键，例如 user_agreement、privacy_policy。 */
        key?: string;
        title?: string;
        /** 条款正文。 */
        content?: string;
        /** 条款版本号。 */
        version?: string;
        is_enable?: boolean;
        created_at?: RFC3339Time;
        updated_at?: RFC3339Time;
    };
    type PlatformTermEnvelope = ResponseBase & {
        data?: {
            term?: PlatformTerm;
        };
    };
    type postV1AuthCheckTokenParams = {};
    type postV1AuthLogoutParams = {};
    type postV1AuthPasswordResetParams = {};
    type postV1AuthRefreshTokenParams = {};
    type postV1AuthRegisterParams = {};
    type postV1AuthUserLoginParams = {};
    type postV1BlacklistAddParams = {};
    type postV1BlacklistListParams = {};
    type postV1BlacklistRemoveParams = {};
    type postV1CallAnswerParams = {};
    type postV1CallCancelParams = {};
    type postV1CallDetailParams = {};
    type postV1CallHangupParams = {};
    type postV1CallListParams = {};
    type postV1CallPendingParams = {};
    type postV1CallRejectParams = {};
    type postV1CallStartParams = {};
    type postV1CallTokenParams = {};
    type postV1CommonUploadCredentialParams = {};
    type postV1ConversationAckParams = {};
    type postV1ConversationArchiveListParams = {};
    type postV1ConversationArchiveParams = {};
    type postV1ConversationAutoDeleteUpdateParams = {};
    type postV1ConversationClearParams = {};
    type postV1ConversationDetailParams = {};
    type postV1ConversationListParams = {};
    type postV1ConversationMuteParams = {};
    type postV1ConversationPinParams = {};
    type postV1ConversationPinSortParams = {};
    type postV1ConversationReadParams = {};
    type postV1ConversationReadStateParams = {};
    type postV1ConversationSettingDetailParams = {};
    type postV1ConversationSyncParams = {};
    type postV1ConversationUnreadMarkParams = {};
    type postV1DirectConversationOpenParams = {};
    type postV1EmojiAddParams = {};
    type postV1EmojiBatchDeleteParams = {};
    type postV1EmojiCreateParams = {};
    type postV1EmojiListParams = {};
    type postV1FriendApplicationListParams = {};
    type postV1FriendDetailParams = {};
    type postV1FriendListParams = {};
    type postV1FriendProfileUpdateParams = {};
    type postV1FriendsApplicationsAcceptParams = {};
    type postV1FriendsApplicationsCancelParams = {};
    type postV1FriendsApplicationsReadParams = {};
    type postV1FriendsApplicationsRejectParams = {};
    type postV1FriendsApplicationsUnreadCountParams = {};
    type postV1FriendsApplyParams = {};
    type postV1FriendsDeleteParams = {};
    type postV1FriendStarUpdateParams = {};
    type postV1GroupAdminCancelParams = {};
    type postV1GroupAdminListParams = {};
    type postV1GroupAdminPermissionUpdateParams = {};
    type postV1GroupAdminSetParams = {};
    type postV1GroupAnnouncementReadParams = {};
    type postV1GroupAnnouncementReadStatusParams = {};
    type postV1GroupApplicationAcceptParams = {};
    type postV1GroupApplicationApplyParams = {};
    type postV1GroupApplicationAuditListParams = {};
    type postV1GroupApplicationInviteParams = {};
    type postV1GroupApplicationListParams = {};
    type postV1GroupApplicationRejectParams = {};
    type postV1GroupCommonListParams = {};
    type postV1GroupDetailParams = {};
    type postV1GroupMemberInviteParams = {};
    type postV1GroupMemberListParams = {};
    type postV1GroupMemberMuteUpdateParams = {};
    type postV1GroupMemberNicknameUpdateParams = {};
    type postV1GroupMuteUpdateParams = {};
    type postV1GroupMyListParams = {};
    type postV1GroupOwnerTransferParams = {};
    type postV1GroupPublicDetailParams = {};
    type postV1GroupsCreateParams = {};
    type postV1GroupsDismissParams = {};
    type postV1GroupSearchParams = {};
    type postV1GroupSettingUpdateParams = {};
    type postV1GroupsLeaveParams = {};
    type postV1GroupsMembersRemoveParams = {};
    type postV1GroupsUpdateParams = {};
    type postV1MessageBatchDeleteParams = {};
    type postV1MessageBatchForwardParams = {};
    type postV1MessageBatchSendParams = {};
    type postV1MessageCardShareParams = {};
    type postV1MessagesBatchPullParams = {};
    type postV1MessagesPullParams = {};
    type postV1MessagesSendParams = {};
    type postV1MessagesUpdateParams = {};
    type postV1MessageUpdatesPullParams = {};
    type postV1PlatformClientVersionCheckParams = {};
    type postV1PlatformTermGetParams = {};
    type postV1PresenceListParams = {};
    type postV1SettingNotificationDetailParams = {};
    type postV1SettingNotificationSwitchParams = {};
    type postV1SettingPermissionDetailParams = {};
    type postV1SettingPermissionSwitchParams = {};
    type postV1UserAccountPasswordSetParams = {};
    type postV1UserBatchDetailParams = {};
    type postV1UserCurrentDetailParams = {};
    type postV1UserDetailParams = {};
    type postV1UserEmailUpdateParams = {};
    type postV1UserPhoneUpdateParams = {};
    type postV1UsersContactBindParams = {};
    type postV1UserSearchParams = {};
    type postV1UsersUpdateProfileParams = {};
    type postV2CallDeleteParams = {};
    type postV2CallDetailParams = {};
    type postV2CallListParams = {};
    type PublicGroup = {
        group_id?: string;
        title?: string;
        avatar_url?: string;
        /** 群简介。 */
        description?: string;
        mode?: GroupType;
        member_count?: number;
        join_approval_required?: boolean;
    };
    type PublicGroupEnvelope = ResponseBase & {
        data?: {
            group?: PublicGroup;
            membership_status?: "none" | "active" | "left" | "removed" | "banned";
            application_status?: string;
        };
    };
    type PullMessagesData = {
        list?: {
            message?: Message;
        }[];
        /** 本次消息列表中出现过的发送者和转发来源用户资料，前端可按 message.sender_id 或 message.forward_origin.user_id 映射。 */
        users?: User[];
        next_seq?: Uint64String;
        has_more?: boolean;
        latest_seq?: Uint64String;
    };
    type PullMessagesEnvelope = ResponseBase & {
        data?: PullMessagesData;
    };
    type PullMessagesRequest = {
        conversation_id: string;
        from_seq: Uint64String;
        limit?: number;
        /** 是否倒序拉取。 */
        desc?: boolean;
    };
    type PullMessageUpdatesEnvelope = ResponseBase & {
        data?: {
            list?: MessageUpdate[];
            next_update_seq?: Uint64String;
            has_more?: boolean;
        };
    };
    type PullMessageUpdatesRequest = {
        conversation_id: string;
        after_update_seq?: Uint64String;
        limit?: number;
    };
    type QuoteMessage = {
        msg_id: string;
        text?: string;
        reply_text?: string;
        /** 被引用消息发送人用户 ID，由服务端根据 msg_id 填充。 */
        sender_id?: string;
    };
    type QuoteMessageBody = {
        quote: QuoteMessage;
    };
    type ReadGroupAnnouncementRequest = {
        group_id: string;
        /** 前端实际展示并确认已读的公告版本。 */
        announcement_version: Uint64String;
    };
    type ReadyResponse = ResponseBase & {
        data?: {
            status?: string;
            im_core_grpc_addr?: string;
        };
    };
    type RefreshTokenRequest = {
        refresh_token: string;
        device_id?: string;
    };
    type RegisterUserRequest = {
        type: AccountType;
        /** 账号输入框的值。type=account 时传账号名，要求 8-24 位 ASCII 可打印字符（0x21-0x7E），不允许空格。type=email 时传邮箱且网关会校验邮箱格式；type=phone 时传 11 位大陆手机号。 */
        account: string;
        /** type=phone 时必填且当前仅允许 +86；非 +86 手机号暂不支持注册。 */
        phone_area_code?: string;
        /** type=account 时必填，要求 8-24 位且至少包含字母、数字、特殊字符中的两类；type=email 或 type=phone 时不需要。 */
        password?: string;
        /** type=email 或 type=phone 时必填；当前开发阶段固定传 666666，错误时返回“验证码错误或验证失败”。 */
        verification_code?: string;
        device_id: string;
    };
    type RejectGroupApplicationRequest = {
        application_id: string;
    };
    type RemoveGroupMemberRequest = {
        group_id: string;
        member_user_ids: string[];
    };
    type ResetPasswordRequest = {
        /** 当前旧密码。 */
        old_password: string;
        /** 新密码。 */
        password: string;
    };
    type ResetSysUserPasswordRequest = {
        id: number;
        remark?: string;
        two_factor_code: string;
    };
    type ResponseBase = {
        code: ApiCode;
        message: string;
    };
    type RFC3339Time = string;
    type RoleLevel = 20 | 60 | 100;
    type SearchGroupEnvelope = ResponseBase & {
        data?: {
            list?: {
                group?: PublicGroup;
                source_type?: "group_id" | "title";
            }[];
        };
    };
    type SearchGroupRequest = {
        /** 统一搜索关键字，群 ID 精确匹配，群名称前缀匹配。 */
        keyword: string;
    };
    type SearchUserEnvelope = ResponseBase & {
        data?: {
            list?: {
                user?: User;
                source_type?: "user_id" | "phone" | "email" | "account" | "nickname";
                permission?: UserPermissionSetting;
            }[];
        };
    };
    type SearchUserRequest = {
        /** 统一搜索关键字，按用户 ID、手机号、邮箱、账号、昵称搜索。 */
        keyword: string;
    };
    type SendMessageData = {
        message?: Message;
    };
    type SendMessageEnvelope = ResponseBase & {
        data?: {
            message?: Message;
        };
    };
    type SendMessageRequest = {
        conversation_id: string;
        /** 客户端生成的幂等 ID，重试必须保持不变。 */
        client_msg_id: string;
        body?: MessageBody;
        /** 要转发的源消息 ID。服务端校验当前用户可见性并复制内容，响应不会暴露此 ID。 */
        source_msg_id?: string;
        /** 消息级@目标列表；文本、图片、视频、文件、引用、Markdown 等消息都可以携带。 */
        mentions?: MentionTarget[];
        /** 文本范围实体列表。转发时忽略前端传值并继承源消息实体。 */
        entities?: MessageEntity[];
    };
    type SetGroupAdminRequest = {
        group_id: string;
        member_user_ids: string[];
    };
    type SetUserAccountPasswordRequest = {
        /** 要设置的账号名；要求 8-24 位 ASCII 可打印字符（0x21-0x7E），不允许空格，且未被其他用户占用。 */
        account: string;
        /** 要设置的登录密码。 */
        password: string;
    };
    type ShareCardMessageEnvelope = ResponseBase & {
        data?: {
            list?: ShareCardMessageResult[];
        };
    };
    type ShareCardMessageRequest = {
        /** 要分享的名片用户 ID。可以是自己，也可以是其他用户。 */
        card_user_id: string;
        /** 接收名片的用户 ID 列表；不能包含当前用户，也不能包含名片用户。 */
        target_user_ids: string[];
    };
    type ShareCardMessageResult = {
        target_user_id?: string;
        conversation_id?: string;
        message?: Message;
    };
    type SortPinnedConversationRequest = {
        /** 要移动的已置顶会话 ID。 */
        conversation_id: string;
        /** 移动后排在它前面的置顶会话 ID；移动到顶部时为空。 */
        before_conversation_id?: string;
        /** 移动后排在它后面的置顶会话 ID；移动到底部时为空。 */
        after_conversation_id?: string;
    };
    type StartCallRequest = {
        /** 单聊会话 ID。群会话会被拒绝，且不会创建 LiveKit 房间。 */
        conversation_id: string;
        call_type: CallType;
        /** 客户端生成的幂等 ID；重试必须保持不变。 */
        client_call_id: string;
    };
    type SubjectType = "user" | "sys_user";
    type SyncConversationEnvelope = ResponseBase & {
        data?: {
            list?: {
                state?: ConversationCursor;
            }[];
            next_page_token?: string;
            latest_version?: Uint64String;
        };
    };
    type SyncConversationRequest = {
        limit?: number;
        /** 上一页返回的分页游标。 */
        page_token?: string;
        /** 上次同步返回的 latest_version；首次同步传 0 或不传。 */
        after_version?: Uint64String;
    };
    type SysPermission = {
        id?: number;
        key?: string;
        name?: string;
        description?: string;
        type?: string;
        is_enable?: boolean;
        created_at?: RFC3339Time;
        updated_at?: RFC3339Time;
    };
    type SysPermissionEnvelope = ResponseBase & {
        data?: {
            permission?: SysPermission;
        };
    };
    type SysRole = {
        id?: number;
        code?: string;
        name?: string;
        description?: string;
        is_enable?: boolean;
        created_at?: RFC3339Time;
        updated_at?: RFC3339Time;
    };
    type SysRoleEnvelope = ResponseBase & {
        data?: {
            role?: SysRole;
            permissions?: SysRolePermissionWrap;
        };
    };
    type SysRolePermissionWrap = {
        permission_ids?: number[];
        permissions?: SysPermission[];
    };
    type SysRoleWrap = {
        role?: SysRole;
        permissions?: SysRolePermissionWrap;
    };
    type SystemMessage = {
        /** 系统事件类型；通话实时通知使用 rtc.call.invite、rtc.call.accept、rtc.call.reject、rtc.call.cancel、rtc.call.hangup、rtc.call.ended。 */
        event_type?: string;
        /** 兼容兜底文本，不动态拼接昵称或配置值；前端不得用它做业务判断。 */
        text?: string;
        /** 系统事件业务字段；通话通知包含 call_id、conversation_id、call_type、room_name、caller_id、operator_id、status、status_text、reason_code、reason、e2ee_required。status 和 reason_code 是稳定协议码，status_text 和 reason 是中文展示文案。 */
        extra?: Record<string, any>;
    };
    type SystemMessageBody = {
        system: SystemMessage;
    };
    type SysUser = {
        id?: number;
        username?: string;
        display_name?: string;
        status?: AccountStatus;
        description?: string;
        last_login_at?: RFC3339Time;
        last_login_ip?: string;
        created_at?: RFC3339Time;
        updated_at?: RFC3339Time;
    };
    type SysUserAuthEnvelope = ResponseBase & {
        data?: {
            token?: Token;
            sys_user?: SysUser;
            rbac?: SysUserRBAC;
        };
    };
    type SysUserEnvelope = ResponseBase & {
        data?: {
            sys_user?: SysUser;
            rbac?: SysUserRBAC;
        };
    };
    type SysUserLoginRequest = {
        username: string;
        password: string;
    };
    type SysUserRBAC = {
        role_ids?: number[];
        roles?: string[];
        permissions?: string[];
    };
    type SysUserWrap = {
        sys_user?: SysUser;
        rbac?: SysUserRBAC;
    };
    type TextMessage = {
        text: string;
    };
    type TextMessageBody = {
        text: TextMessage;
    };
    type Token = {
        access_token?: string;
        refresh_token?: string;
        expires_in?: number;
        refresh_expires_in?: number;
        subject_type?: SubjectType;
        subject_id?: string;
    };
    type TransferGroupOwnerRequest = {
        group_id: string;
        new_owner_user_id: string;
    };
    type TypingMessage = {
        action: string;
    };
    type TypingMessageBody = {
        typing: TypingMessage;
    };
    type Uint64String = string;
    type UpdateConversationAutoDeleteRequest = {
        /** 要设置自动删除消息的会话 ID。 */
        conversation_id: string;
        /** 自动删除消息秒数，0 表示关闭；支持 6小时、12小时、1天、3天、7天、15天、1个月、2个月、3个月、6个月。 */
        auto_delete_seconds?: 0 | 21600 | 43200 | 86400 | 259200 | 604800 | 1296000 | 2592000 | 5184000 | 7776000 | 15552000;
    };
    type UpdateEmailRequest = {
        /** 新邮箱地址。 */
        email: string;
        /** 新邮箱验证码；当前开发阶段固定传 `666666`。 */
        verification_code: string;
    };
    type UpdateFriendProfileRequest = {
        friend_user_id: string;
        /** 好友别名；未传不更新，传空字符串表示清空别名。 */
        alias?: string;
        /** 好友手机号备注；未传不更新，传空字符串表示清空手机号备注。 */
        phone?: string;
        /** 好友备注；未传不更新，传空字符串表示清空备注。 */
        remark?: string;
        /** 好友标签；未传不更新，传空数组表示清空标签。 */
        tags?: string[];
    };
    type UpdateFriendStarRequest = {
        friend_user_id: string;
        /** 是否标记为星标好友；false 表示取消星标。 */
        is_starred: boolean;
    };
    type UpdateGroupAdminPermissionRequest = {
        group_id: string;
        /** 全体禁言时管理员是否可以发消息；未开启全体禁言时不限制管理员日常发言。 */
        admin_send_message?: boolean;
        /** 管理员是否可以手动禁言成员。 */
        admin_mute_member?: boolean;
        /** 管理员是否可以移除成员。 */
        admin_remove_member?: boolean;
        /** 管理员是否可以邀请好友加群。 */
        admin_invite_member?: boolean;
        /** 管理员是否可以审核入群申请或邀请。 */
        admin_audit_application?: boolean;
        /** 管理员是否可以清空群聊消息。 */
        admin_clear_message?: boolean;
        /** 管理员是否可以修改群资料。 */
        admin_update_profile?: boolean;
    };
    type UpdateGroupMemberMuteEnvelope = ResponseBase & {
        data?: {
            member?: GroupMember;
        };
    };
    type UpdateGroupMemberMuteRequest = {
        group_id: string;
        member_user_id: string;
        /** 单成员禁言到期时间；不传或空字符串表示取消单独禁言。 */
        mute_until?: RFC3339Time;
    };
    type UpdateGroupMemberNicknameEnvelope = ResponseBase & {
        data?: {
            member?: GroupMember;
        };
    };
    type UpdateGroupMemberNicknameRequest = {
        group_id: string;
        /** 当前用户在群内的昵称；空字符串表示清除群昵称。 */
        nickname?: string;
    };
    type UpdateGroupMuteRequest = {
        group_id: string;
        /** 全体禁言开关；未传保持原值。普通成员不能发言，群主仍可发言，管理员由 admin_send_message 控制。 */
        mute_all?: boolean;
        /** 普通成员禁言开关；未传保持原值，开启后仅普通成员不能发言。 */
        mute_member?: boolean;
        /** 群发言频率开关；未传保持原值，开启后普通成员按 send_frequency_seconds 限制发言间隔。 */
        send_frequency_enabled?: boolean;
        /** 群发言频率间隔秒数；未传保持原值。 */
        send_frequency_seconds?: 30 | 60 | 180 | 300 | 600 | 1800 | 3600;
    };
    type UpdateGroupRequest = {
        group_id: string;
        title?: string;
        avatar_url?: string;
        /** 群简介；不传或空字符串表示保持不变。 */
        description?: string;
        /** 群公告；不传或空字符串表示保持不变。 */
        announcement?: string;
    };
    type UpdateGroupSettingRequest = {
        group_id: string;
        /** 全体禁言开关；未传保持原值。 */
        mute_all?: boolean;
        /** 普通成员禁言开关；未传保持原值。 */
        mute_member?: boolean;
        /** 群发言频率开关；未传保持原值。 */
        send_frequency_enabled?: boolean;
        /** 群发言频率间隔秒数；未传保持原值。 */
        send_frequency_seconds?: 30 | 60 | 180 | 300 | 600 | 1800 | 3600;
        /** 入群是否需要审核；未传保持原值。 */
        join_approval_required?: boolean;
        /** 是否允许群成员互相加好友；未传保持原值。 */
        allow_member_add_friend?: boolean;
        /** 是否允许普通成员邀请用户入群；未传保持原值。 */
        allow_member_invite?: boolean;
        /** 是否允许群成员设置群昵称；未传保持原值。 */
        allow_member_nickname?: boolean;
    };
    type UpdateMessageEnvelope = ResponseBase & {
        data?: {
            target_message?: Message;
            update?: MessageUpdate;
        };
    };
    type UpdateMessageRequest = {
        conversation_id: string;
        target_msg_id: string;
        /** 操作消息的客户端幂等 ID。网络重试必须保持不变，但不能跨目标消息、编辑/删除操作或删除 scope 复用。 */
        client_msg_id: string;
        edit?: EditMessageOperation;
        delete?: DeleteMessageOperation;
    };
    type UpdatePhoneRequest = {
        /** 新手机号，当前仅支持 11 位大陆手机号。 */
        phone: string;
        /** 新手机号区号，当前固定为 +86。 */
        phone_area_code: "+86";
        /** 新手机号验证码；当前开发阶段固定传 `666666`。 */
        verification_code: string;
    };
    type UpdateSysPermissionRequest = CreateSysPermissionRequest & {
        id: number;
    };
    type UpdateSysRoleRequest = CreateSysRoleRequest & {
        id: number;
    };
    type UpdateSysUserRequest = {
        id: number;
        username?: string;
        display_name?: string;
        description?: string;
        status?: AccountStatus;
        role_ids?: number[];
    };
    type UpdateUserNotificationSettingRequest = {
        type: NotificationType;
        /** 是否开启。 */
        enabled: boolean;
    };
    type UpdateUserPermissionSettingRequest = {
        type: PermissionType;
        /** 是否开启。 */
        enabled: boolean;
    };
    type UpdateUserProfileRequest = {
        /** 昵称。 */
        nickname?: string;
        /** 头像 URL。通常由上传头像接口返回后再传入。 */
        avatar_url?: string;
        /** 性别。0=未设置或保密，1=男，2=女；不传时保持原值。 */
        gender?: 0 | 1 | 2;
        /** 个人简介；不传时保持原值，传空字符串时清空。 */
        bio?: string;
    };
    type UploadCredential = {
        /** OSS AccessKeyId，前端表单上传时作为 OSSAccessKeyId 字段。 */
        access_key_id?: string;
        /** Base64 编码后的上传策略，前端表单上传时作为 policy 字段。 */
        policy?: string;
        /** 上传签名，前端表单上传时作为 Signature/signature 字段。 */
        signature?: string;
        /** 后端生成的 OSS 对象 Key，前端表单上传时作为 key 字段。 */
        object_key?: string;
        /** OSS 表单上传地址。 */
        host?: string;
        /** 上传成功后的 CDN/访问 URL，业务接口保存这个 URL。 */
        url?: string;
        /** 凭证过期时间戳，单位秒。 */
        expire?: number;
    };
    type UploadCredentialEnvelope = ResponseBase & {
        data?: UploadCredential;
    };
    type UploadCredentialRequest = {
        /** 文件扩展名；支持常用图片、音频、视频、文档和压缩包，不传默认 jpg。 */
        ext?: string;
    };
    type User = {
        user_id?: string;
        account?: string;
        phone?: string;
        /** 手机号区号，仅用于记录和展示，例如 +86。 */
        phone_area_code?: string;
        email?: string;
        nickname?: string;
        avatar_url?: string;
        /** 性别。0=未设置或保密，1=男，2=女。 */
        gender?: 0 | 1 | 2;
        /** 个人简介。 */
        bio?: string;
        status?: AccountStatus;
        created_at?: RFC3339Time;
        updated_at?: RFC3339Time;
    };
    type UserAuthEnvelope = ResponseBase & {
        data?: {
            token?: Token;
            user?: User;
            is_new_user?: boolean;
            must_change_password?: boolean;
        };
    };
    type UserEnvelope = ResponseBase & {
        data?: {
            user?: User;
        };
    };
    type UserLoginRequest = {
        type: AccountType;
        /** 账号输入框的值。type=account 时传账号名；type=email 时传邮箱且网关会校验邮箱格式；type=phone 时传 11 位大陆手机号。 */
        account: string;
        /** type=phone 时必填且当前仅允许 +86；非 +86 手机号暂不支持登录。 */
        phone_area_code?: string;
        /** type=account 时必填；type=email 或 type=phone 时不需要。 */
        password?: string;
        /** type=email 或 type=phone 时必填；当前开发阶段固定传 666666，错误时返回“验证码错误或验证失败”。 */
        verification_code?: string;
        device_id: string;
    };
    type UserNotificationSetting = {
        user_id: string;
        /** 私聊消息通知。 */
        private_chat: boolean;
        /** 群聊消息通知。 */
        group_chat: boolean;
        /** @我通知。 */
        mention: boolean;
        /** 好友/群聊申请通知。 */
        application: boolean;
        /** 系统通知。 */
        system_notice: boolean;
        /** 语音视频通话通知。 */
        call: boolean;
        /** 通知消息总开关，优先级最高；关闭后各子开关保留原值但不生效。 */
        notification: boolean;
        created_at: RFC3339Time;
        updated_at: RFC3339Time;
    };
    type UserNotificationSettingEnvelope = ResponseBase & {
        data?: {
            setting?: UserNotificationSetting;
        };
    };
    type UserPermissionSetting = {
        user_id: string;
        /** 加我是否需要验证；true=需要验证，false=允许直接添加。 */
        friend_apply_verify: boolean;
        /** 是否允许其他用户通过 `/v1/user/search` 搜索到当前用户；不影响本人搜索自己。 */
        allow_search: boolean;
        /** 是否允许其他用户在创建群或直接邀请时将当前用户加入群；不影响用户主动申请或待审核邀请。 */
        allow_group_invite: boolean;
        /** 是否向其他用户展示性别；关闭后跨用户资料中的 gender 返回 0。 */
        show_gender: boolean;
        /** 是否向其他用户展示个人简介；关闭后跨用户资料中的 bio 返回空字符串。 */
        show_bio: boolean;
        created_at: RFC3339Time;
        updated_at: RFC3339Time;
    };
    type UserPermissionSettingEnvelope = ResponseBase & {
        data?: {
            setting?: UserPermissionSetting;
        };
    };
    type UserPresence = {
        user_id?: string;
        /** 最近 30 秒内存在 WebSocket 活动时为 true。 */
        online?: boolean;
        /** 离线用户最后活跃时间；在线或无记录时为空。 */
        last_seen_at?: string;
    };
    type VideoMessage = {
        media_id?: string;
        url?: string;
        thumbnail_url?: string;
        duration_seconds?: number;
        width?: number;
        height?: number;
        size_bytes?: Uint64String;
    };
    type VideoMessageBody = {
        video: VideoMessage;
    };
}
//# sourceMappingURL=types.d.ts.map