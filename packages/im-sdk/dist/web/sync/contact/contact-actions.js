import { FriendshipRepository, GroupRepository, } from '@im28/im-sdk/core';
import { statement } from '../../db/database.js';
import { normalizeIMUserNickname } from '../../modules/user/display-name.js';
import { createWebIMSyncError, requireWebIMSyncContext, } from '../sync-context.js';
import { createWebIMSyncMutationQueue, } from '../sync-mutation-queue.js';
import { openAndCacheWebIMDirectConversation } from './peer-profile-sync.js';
import { sendWebIMTextMessage } from '../message/message-text-send.js';
import { shareIMGroupCard, } from '../group/group-card-share.js';
/** 创建 RN、Web、Desktop 共用的联系人写动作 facade。 */
export function createIMContactActionsSync(dependencies) {
    /** mutationQueue 保证远端成功与本地清理不和同账号同步交错。 */
    const mutationQueue = dependencies.mutationQueue ?? createWebIMSyncMutationQueue();
    return new IMContactActionsSyncImpl(dependencies, mutationQueue);
}
/** 中性实现统一删除好友的幂等请求和 success-only 缓存收敛。 */
class IMContactActionsSyncImpl {
    /** dependencies 动态读取账号、Gateway 和 ID 端口。 */
    dependencies;
    /** mutationQueue 持有完整 destructive operation 的执行顺序。 */
    mutationQueue;
    /** 保存注入端口，不持有 UI、路由或数据库生命周期。 */
    constructor(dependencies, mutationQueue) {
        this.dependencies = dependencies;
        this.mutationQueue = mutationQueue;
    }
    /** 冻结当前账号后执行一次 Gateway 删除与本地原子清理。 */
    deleteFriend(options) {
        /** context 防止排队期间切号后误删另一个账号缓存。 */
        const context = requireWebIMSyncContext(this.dependencies, 'Friend deletion');
        return this.mutationQueue.enqueue(() => this.deleteFriendDirect(context, options));
    }
    /** 冻结当前账号后执行一次名片分享和可选附言发送。 */
    shareUserCard(options) {
        /** context 保证目标过滤、会话和消息均属于同一认证账号。 */
        const context = requireWebIMSyncContext(this.dependencies, 'User card sharing');
        return this.mutationQueue.enqueue(() => this.shareUserCardDirect(context, options));
    }
    /** 冻结当前账号后执行一次群名片分享和可选附言发送。 */
    shareGroupCard(options) {
        /** context 防止排队期间切号后向错误账号会话发送卡片。 */
        const context = requireWebIMSyncContext(this.dependencies, 'Group card sharing');
        return this.mutationQueue.enqueue(() => shareIMGroupCard(context, options, this.dependencies));
    }
    /** 冻结账号后串行更新备注和当前关系快照。 */
    updateFriendRemark(friendUserID, remark) {
        /** context 防止排队期间切号后写错账号缓存。 */
        const context = requireWebIMSyncContext(this.dependencies, 'Friend remark update');
        return this.mutationQueue.enqueue(() => this.updateFriendProfileDirect(context, friendUserID, { remark: remark.trim() }));
    }
    /** 冻结账号后串行更新星标和当前关系快照。 */
    updateFriendStar(friendUserID, isStarred) {
        /** context 防止排队期间切号后写错账号缓存。 */
        const context = requireWebIMSyncContext(this.dependencies, 'Friend star update');
        return this.mutationQueue.enqueue(() => this.updateFriendProfileDirect(context, friendUserID, { isStarred }));
    }
    /** 加入或移出黑名单只在统一身份校验后调用对应 Gateway operation。 */
    async setBlacklist(userID, blocked) {
        /** context 固定当前账号并防止操作本人。 */
        const context = requireWebIMSyncContext(this.dependencies, 'Blacklist update');
        /** targetUserID 是黑名单关系的稳定目标。 */
        const targetUserID = requireOtherContactUserID(context, userID, 'INVALID_BLACKLIST_TARGET');
        await this.mutationQueue.enqueue(async () => {
            if (blocked) {
                await this.dependencies.gatewayClient.addToBlacklist({ blocked_user_id: targetUserID });
            }
            else {
                await this.dependencies.gatewayClient.removeFromBlacklist({ blocked_user_id: targetUserID });
            }
        });
    }
    /** 分页读取共同群聊，完整成功后逐项 upsert 而不替换我的群聊快照。 */
    listCommonGroups(options) {
        /** context 固定读取账号和唯一数据库。 */
        const context = requireWebIMSyncContext(this.dependencies, 'Common group list');
        return this.mutationQueue.enqueue(() => this.listCommonGroupsDirect(context, options));
    }
    /** 校验身份和 operation ID，Gateway 成功后再提交 SQLite 事务。 */
    async deleteFriendDirect(context, options) {
        /** friendUserID 是好友关系与单聊 target 的共同稳定身份。 */
        const friendUserID = options.friendUserID.trim();
        if (!friendUserID || friendUserID === context.userID) {
            throw createWebIMSyncError('INVALID_FRIEND_DELETE_TARGET', 'Friend deletion requires another user ID.');
        }
        /** operationID 在一次调用和 transport retry 中保持不变。 */
        const operationID = options.operationID?.trim() || createContactOperationID(this.dependencies);
        await this.dependencies.gatewayClient.deleteFriend({
            friend_user_id: friendUserID,
            clear_scope: options.clearScope,
            operation_id: operationID,
        });
        /** conversationIDs 只包含当前账号 SQLite 中目标用户的单聊。 */
        const conversationIDs = await deleteCachedFriendState(context, friendUserID);
        return { friendUserID, conversationIDs };
    }
    /** 校验稳定身份，先分享名片，再逐目标发送非空附言。 */
    async shareUserCardDirect(context, options) {
        /** cardUserID 是 Gateway 卡片内容的稳定用户身份。 */
        const cardUserID = options.cardUserID.trim();
        if (!cardUserID) {
            throw createWebIMSyncError('INVALID_CARD_USER_ID', 'User card sharing requires a card user ID.');
        }
        /** targetUserIDs 保序去重，并排除本人和名片用户。 */
        const targetUserIDs = Array.from(new Set(options.targetUserIDs
            .map(userID => userID.trim())
            .filter(userID => userID && userID !== context.userID && userID !== cardUserID)));
        if (targetUserIDs.length === 0) {
            throw createWebIMSyncError('INVALID_CARD_SHARE_TARGETS', 'User card sharing requires at least one valid target.');
        }
        await this.dependencies.gatewayClient.shareCard({
            card_user_id: cardUserID,
            target_user_ids: targetUserIDs,
        });
        /** message 沿用 RN trim 语义，空附言不创建会话或消息。 */
        const message = options.message?.trim() ?? '';
        /** noteMessages 保留各目标已由共享发送状态机持久化的最终实体。 */
        const noteMessages = [];
        if (message) {
            for (const targetUserID of targetUserIDs) {
                /** conversation 使用共享 Gateway mapper 和 Repository 写入。 */
                const conversation = await openAndCacheWebIMDirectConversation(context, targetUserID, this.dependencies.gatewayClient);
                /** noteMessage 复用 type101 optimistic/final 状态收敛。 */
                const noteMessage = await sendWebIMTextMessage(context, { conversationID: conversation.conversationID, text: message }, this.dependencies);
                noteMessages.push(noteMessage);
            }
        }
        return { cardUserID, targetUserIDs, noteMessages };
    }
    /** 执行一次备注或星标更新，并与缓存原始关系做字段级合并。 */
    async updateFriendProfileDirect(context, friendUserID, update) {
        /** targetUserID 必须是当前账号之外的稳定身份。 */
        const targetUserID = requireOtherContactUserID(context, friendUserID, 'INVALID_FRIEND_PROFILE_TARGET');
        /** friendshipRepository 提供成功后的唯一关系缓存 owner。 */
        const friendshipRepository = new FriendshipRepository(context.database);
        /** cached 证明目标当前确实是好友并保留服务端未回显字段。 */
        const cached = await friendshipRepository.getByUserID(targetUserID);
        if (!cached?.isFriend) {
            throw createWebIMSyncError('FRIEND_PROFILE_RELATION_REQUIRED', 'Friend profile update requires an existing friendship.');
        }
        /** gatewayFriend 是远端确认后的部分或完整好友快照。 */
        const gatewayFriend = update.remark !== undefined
            ? await this.dependencies.gatewayClient.updateFriendProfile({
                friend_user_id: targetUserID,
                alias: update.remark,
            })
            : await this.dependencies.gatewayClient.updateFriendStar({
                friend_user_id: targetUserID,
                is_starred: update.isStarred === true,
            });
        /** cachedPayload 只接受对象，防止畸形历史数据污染合并。 */
        const cachedPayload = isRecord(cached.payload) ? cached.payload : {};
        /** mergedRaw 保留原 user/addedAt 等字段并覆盖远端确认值。 */
        const mergedRaw = {
            ...cachedPayload,
            ...gatewayFriend,
            friend_user_id: targetUserID,
            ...(update.remark !== undefined ? { alias: update.remark } : {}),
            ...(update.isStarred !== undefined ? { is_starred: update.isStarred } : {}),
            user: {
                ...(isRecord(cachedPayload.user) ? cachedPayload.user : {}),
                ...(gatewayFriend.user ?? {}),
            },
        };
        await friendshipRepository.upsert({ userID: targetUserID, isFriend: true, payload: mergedRaw });
        return mapContactFriendProfile(mergedRaw, targetUserID);
    }
    /** 完整拉取共同群聊并增量写入共享 group repository。 */
    async listCommonGroupsDirect(context, options) {
        /** targetUserID 必须是当前账号之外的稳定身份。 */
        const targetUserID = requireOtherContactUserID(context, options.targetUserID, 'INVALID_COMMON_GROUP_TARGET');
        /** pageSize 限制异常 caller 造成的服务端压力。 */
        const pageSize = clampCommonGroupPageSize(options.pageSize);
        /** groups 按首见顺序保存并允许后页覆盖同 ID 新值。 */
        const groups = new Map();
        /** seenTokens 拒绝服务端循环分页。 */
        const seenTokens = new Set();
        /** pageToken 为空表示首屏。 */
        let pageToken;
        for (let page = 0; page < 1000; page += 1) {
            /** response 复用 shared common-group endpoint。 */
            const response = await this.dependencies.gatewayClient.listCommonGroups({
                target_user_id: targetUserID,
                limit: pageSize,
                ...(pageToken ? { page_token: pageToken } : {}),
            });
            for (const group of response.groups ?? []) {
                /** groupID 是共同群聊的稳定身份。 */
                const groupID = group.group_id?.trim() ?? '';
                if (groupID)
                    groups.set(groupID, group);
            }
            /** nextToken 为空代表完整分页结束。 */
            const nextToken = response.next_page_token?.trim();
            if (!nextToken)
                break;
            if (seenTokens.has(nextToken)) {
                throw createWebIMSyncError('COMMON_GROUP_PAGINATION_LOOP', 'Gateway common group pagination returned a repeated token.');
            }
            seenTokens.add(nextToken);
            pageToken = nextToken;
            if (page === 999) {
                throw createWebIMSyncError('COMMON_GROUP_PAGE_LIMIT_EXCEEDED', 'Gateway common group pagination exceeded the safety limit.');
            }
        }
        /** result 丢弃无稳定 ID 的异常项并生成跨端投影。 */
        const result = [...groups.values()].map(mapContactCommonGroup);
        /** repository 仅增量写入命中群，不覆盖“我的群聊”其他快照。 */
        const repository = new GroupRepository(context.database);
        for (const group of result) {
            await repository.upsert({
                groupID: group.groupID,
                name: group.name,
                faceURL: group.avatarURL,
                memberCount: group.memberCount,
                payload: group.raw,
            });
        }
        return result;
    }
}
/** 校验联系人动作目标存在且不是当前账号。 */
function requireOtherContactUserID(context, userID, code) {
    /** normalizedUserID 统一 trim 后再比较身份。 */
    const normalizedUserID = userID.trim();
    if (!normalizedUserID || normalizedUserID === context.userID) {
        throw createWebIMSyncError(code, 'Contact action requires another user ID.');
    }
    return normalizedUserID;
}
/** 将合并后的好友关系映射为跨端资料写结果。 */
function mapContactFriendProfile(friend, fallbackUserID) {
    /** user 保存 Gateway 公开资料，可能在部分更新响应中缺失。 */
    const user = friend.user;
    /** userID 优先使用关系目标再回退 caller 身份。 */
    const userID = friend.friend_user_id?.trim() || user?.user_id?.trim() || fallbackUserID;
    return {
        userID,
        remark: friend.alias?.trim() || friend.remark?.trim() || '',
        nickname: normalizeIMUserNickname(user?.nickname, userID),
        avatarURL: user?.avatar_url?.trim() ?? '',
        isStarred: friend.is_starred === true,
        raw: friend,
    };
}
/** 将 Gateway 共同群聊映射为跨端稳定投影。 */
function mapContactCommonGroup(group) {
    /** groupID 已在调用方过滤，回退只用于类型完整。 */
    const groupID = group.group_id?.trim() ?? '';
    return {
        groupID,
        conversationID: group.conversation_id?.trim() ?? '',
        name: group.title?.trim() || groupID,
        avatarURL: group.avatar_url?.trim() ?? '',
        introduction: group.description?.trim() ?? '',
        memberCount: Math.max(0, Math.trunc(group.member_count ?? 0)),
        ownerUserID: group.owner_user_id?.trim() ?? '',
        raw: group,
    };
}
/** 共同群聊分页尺寸保持在 Gateway 可控范围。 */
function clampCommonGroupPageSize(value) {
    if (!Number.isFinite(value))
        return 50;
    return Math.min(200, Math.max(1, Math.trunc(value ?? 50)));
}
/** 判断未知缓存 payload 是否可安全做字段级合并。 */
function isRecord(value) {
    return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}
/** Gateway 成功后在一个事务中清理好友关系、单聊消息和会话。 */
async function deleteCachedFriendState(context, friendUserID) {
    return context.database.transaction(async (transaction) => {
        /** rows 允许历史上同一 peer 存在多个单聊 ID 时全部收敛。 */
        const rows = await transaction.query(statement('SELECT conversation_id FROM conversations WHERE type = ? AND target_id = ?', ['single', friendUserID]));
        /** conversationIDs 去重并过滤畸形缓存主键。 */
        const conversationIDs = Array.from(new Set(rows
            .map(row => String(row.conversation_id ?? '').trim())
            .filter(Boolean)));
        for (const conversationID of conversationIDs) {
            await transaction.execute(statement('DELETE FROM messages WHERE conversation_id = ?', [conversationID]));
            await transaction.execute(statement('DELETE FROM conversations WHERE conversation_id = ?', [conversationID]));
        }
        await transaction.execute(statement('DELETE FROM friendships WHERE user_id = ?', [friendUserID]));
        return conversationIDs;
    });
}
/** 创建浏览器、RN 和 Desktop 均可注入或生成的稳定 operation ID。 */
function createContactOperationID(dependencies) {
    /** operationID 优先使用宿主端口，Web 回退标准 crypto.randomUUID。 */
    const operationID = (dependencies.createClientMessageID?.() ?? globalThis.crypto?.randomUUID?.())?.trim();
    if (!operationID) {
        throw createWebIMSyncError('CONTACT_OPERATION_ID_UNAVAILABLE', 'Friend deletion requires a stable operation ID generator.');
    }
    return operationID;
}
//# sourceMappingURL=contact-actions.js.map