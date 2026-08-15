import { FriendshipRepository, UserRepository, } from '@im28/im-sdk/core';
import { formatIMUserDisplayName, normalizeIMUserNickname, } from '../modules/user/display-name.js';
import { createWebIMSyncError } from './sync-context.js';
import { replaceWebIMContactCache } from './contact-cache.js';
import { createIMContactActionsSync, } from './contact-actions.js';
/** 创建只通过共享 Gateway client 读取好友列表的 Web facade。 */
export function createWebIMContactSync(dependencies) {
    return new WebIMContactSyncImpl(dependencies);
}
/** 通讯录 service 负责分页与 Gateway 字段归一化。 */
class WebIMContactSyncImpl {
    // dependencies 保持唯一 Gateway client 和动态认证状态。
    dependencies;
    /** mutationQueue 让联系人快照写入与其他账号 cache mutation 串行。 */
    mutationQueue;
    /** actionsSync 复用同一 Gateway、账号数据库与 mutation queue。 */
    actionsSync;
    /** 保存 runtime owners，不复制 token 或 transport 状态。 */
    constructor(dependencies) {
        this.dependencies = dependencies;
        this.mutationQueue = dependencies.mutationQueue;
        this.actionsSync = createIMContactActionsSync(dependencies);
    }
    /** 删除好友完整委托中性 action facade。 */
    deleteFriend = options => this.actionsSync.deleteFriend(options);
    /** 分享用户卡片完整委托中性 action facade。 */
    shareUserCard = options => this.actionsSync.shareUserCard(options);
    /** 分享群名片完整委托中性 action facade。 */
    shareGroupCard = options => this.actionsSync.shareGroupCard(options);
    /** 好友备注完整委托中性 action facade。 */
    updateFriendRemark = (userID, remark) => this.actionsSync.updateFriendRemark(userID, remark);
    /** 好友星标完整委托中性 action facade。 */
    updateFriendStar = (userID, isStarred) => this.actionsSync.updateFriendStar(userID, isStarred);
    /** 黑名单加入/移出完整委托中性 action facade。 */
    setBlacklist = (userID, blocked) => this.actionsSync.setBlacklist(userID, blocked);
    /** 共同群聊完整委托中性 action facade。 */
    listCommonGroups = options => this.actionsSync.listCommonGroups(options);
    /** 从当前账号 SQLite 恢复好友关系与公开资料，不触发 Gateway。 */
    async listCached() {
        /** currentUserID 在缓存读取前证明当前会话仍已认证。 */
        this.requireAuthenticatedUser();
        /** database 必须是 runtime 当前已打开的账号数据库。 */
        const database = this.dependencies.accountDatabase.getDatabase();
        if (!database) {
            throw createWebIMSyncError('CONTACT_DATABASE_UNAVAILABLE', 'Contact cache requires an open account database.');
        }
        /** friendshipRepository 是好友关系快照的唯一读取 owner。 */
        const friendshipRepository = new FriendshipRepository(database);
        /** friendships 只包含服务端确认的好友关系。 */
        const friendships = await friendshipRepository.listFriends();
        /** userRepository 批量补齐公开昵称和头像，避免逐项查询。 */
        const userRepository = new UserRepository(database);
        /** users 与关系来自同一账号数据库快照。 */
        const users = await userRepository.getByIDs(friendships.map(friendship => friendship.userID));
        /** usersByID 供关系映射以稳定身份常数时间查找。 */
        const usersByID = new Map(users.map(user => [user.userID, user]));
        return sortWebIMContacts(friendships.map(friendship => mapCachedWebIMContact(friendship.userID, friendship.payload, usersByID.get(friendship.userID))));
    }
    /** 拉取全部好友分页并返回稳定、去重的页面记录。 */
    async list(options = {}) {
        /** operation 在真正执行时重新绑定当前认证账号与数据库。 */
        const operation = () => this.listDirect(options);
        return this.mutationQueue ? this.mutationQueue.enqueue(operation) : operation();
    }
    /** 完整分页成功后在同一队列 operation 中替换联系人 cache。 */
    async listDirect(options) {
        this.requireAuthenticatedUser();
        /** database 必须来自当前已打开账号，禁止把联系人写入跨账号缓存。 */
        const database = this.dependencies.accountDatabase.getDatabase();
        if (!database) {
            throw createWebIMSyncError('CONTACT_DATABASE_UNAVAILABLE', 'Contact list requires an open account database.');
        }
        // pageSize 限制异常调用造成的服务端压力。
        const pageSize = clampContactPageSize(options.pageSize);
        // contacts 仅在远端分页完整成功后交给页面。
        const contacts = [];
        /** cachedFriends 保留与页面首见去重一致的远端关系快照。 */
        const cachedFriends = [];
        // seenUserIDs 防止服务端跨页重复好友。
        const seenUserIDs = new Set();
        // page 从 Gateway 的 1-based 首屏递增，最多执行安全上限次数。
        for (let page = 1; page <= 1000; page += 1) {
            // response 复用共享 client 的 endpoint 和 envelope 错误语义。
            const response = await this.dependencies.gatewayClient.listFriends({
                page,
                page_size: pageSize,
            });
            // friends 保留当前页原始顺序供 addedAt 排序稳定回退。
            if (!Array.isArray(response.friends)) {
                throw createWebIMSyncError('CONTACT_INVALID_RESPONSE', 'Gateway friend list did not explicitly return friends.');
            }
            // friends 只有明确数组响应才参与分页完成判定和缓存替换。
            const friends = response.friends;
            for (const friend of friends) {
                // contact 丢弃没有稳定用户 ID 的无效记录。
                const contact = normalizeWebIMContact(friend);
                if (contact && !seenUserIDs.has(contact.userID)) {
                    seenUserIDs.add(contact.userID);
                    contacts.push(contact);
                    cachedFriends.push(friend);
                }
            }
            // total 在服务端提供时优先作为完成信号。
            const total = Math.max(0, Math.trunc(response.total ?? 0));
            if (friends.length < pageSize || (total > 0 && contacts.length >= total)) {
                await replaceWebIMContactCache(database, cachedFriends);
                return sortWebIMContacts(contacts);
            }
        }
        throw createWebIMSyncError('CONTACT_PAGE_LIMIT_EXCEEDED', 'Gateway friend pagination exceeded the safety limit.');
    }
    /** 通过共享 Gateway operation 搜索公开用户并过滤本人和重复记录。 */
    async searchUsers(keyword) {
        // currentUserID 同时证明认证状态并用于排除本人。
        const currentUserID = this.requireAuthenticatedUser();
        // query 对齐 RN 搜索页的首尾空白语义。
        const query = keyword.trim();
        if (!query)
            return [];
        // users 保留 Gateway 搜索结果顺序。
        const users = await this.dependencies.gatewayClient.searchUsers({ keyword: query });
        // results 只收集可导航且不重复的页面模型。
        const results = [];
        // seenUserIDs 防止服务端重复结果生成不稳定 React key。
        const seenUserIDs = new Set();
        for (const user of users) {
            // result 丢弃没有稳定用户 ID 的无效记录。
            const result = normalizeWebIMContactSearchUser(user);
            if (!result || result.userID === currentUserID || seenUserIDs.has(result.userID)) {
                continue;
            }
            seenUserIDs.add(result.userID);
            results.push(result);
        }
        return results;
    }
    /** 在网络请求前拒绝匿名通讯录读取。 */
    requireAuthenticatedUser() {
        // currentUserID 每次读取动态认证 owner，避免缓存失效会话。
        const currentUserID = this.dependencies.getCurrentUserID()?.trim() ?? '';
        if (!currentUserID) {
            throw createWebIMSyncError('CONTACT_AUTH_REQUIRED', 'Contact list requires an authenticated Web IM session.');
        }
        return currentUserID;
    }
}
/** 将共享 Gateway user 映射为联系人搜索页面模型。 */
function normalizeWebIMContactSearchUser(user) {
    // userID 是搜索结果进入联系人资料页的稳定主键。
    const userID = user.user_id?.trim() ?? '';
    if (!userID)
        return null;
    // nickname 保留远端原始昵称供匹配摘要使用。
    const nickname = normalizeIMUserNickname(user.nickname, userID);
    // account 是账号搜索命中的可见候选字段。
    const account = user.account?.trim() ?? '';
    // phone 保留服务端已允许公开的手机号字段。
    const phone = user.phone?.trim() ?? '';
    // email 保留服务端已允许公开的邮箱字段。
    const email = user.email?.trim() ?? '';
    return {
        userID,
        displayName: nickname || formatIMUserDisplayName(userID),
        nickname,
        account,
        phone,
        email,
        avatarURL: user.avatar_url?.trim() ?? '',
        gender: user.gender ?? 0,
        bio: user.bio?.trim() ?? '',
    };
}
/** 将共享 Gateway friend 映射为最小 Web 页面模型。 */
function normalizeWebIMContact(friend) {
    // user 保存 Gateway 嵌套的公开用户资料。
    const user = friend.user;
    // userID 优先使用好友关系主键，回退公开用户 ID。
    const userID = (friend.friend_user_id ?? user?.user_id ?? '').trim();
    if (!userID)
        return null;
    // remark 对齐 RN alias 优先显示语义。
    const remark = friend.alias?.trim() ?? '';
    // nickname 保留联系人原始昵称供副标题使用。
    const nickname = normalizeIMUserNickname(user?.nickname, userID);
    // displayName 按 RN remark -> nickname -> im-ID 规则回退。
    const displayName = remark || nickname || formatIMUserDisplayName(userID);
    /** allowGroupInvite 保留服务端缺失与明确 false 的差异。 */
    const allowGroupInvite = readBoolean(friend.permission?.allow_group_invite);
    return {
        userID,
        displayName,
        nickname,
        remark,
        account: user?.account?.trim() ?? '',
        phone: user?.phone?.trim() ?? '',
        email: user?.email?.trim() ?? '',
        avatarURL: user?.avatar_url?.trim() ?? '',
        isStarred: friend.is_starred ?? false,
        ...(allowGroupInvite === undefined ? {} : { allowGroupInvite }),
        addedAt: friend.created_at?.trim() ?? '',
    };
}
/** 将关系 raw 快照与 users 表资料恢复为页面联系人模型。 */
function mapCachedWebIMContact(userID, friendshipPayload, user) {
    /** friendship 保存 Gateway friend 顶层字段。 */
    const friendship = asRecord(friendshipPayload);
    /** nestedUser 兼容关系快照自带的公开用户资料。 */
    const nestedUser = asRecord(friendship.user);
    /** userPayload 是 users 表中更完整的公开资料快照。 */
    const userPayload = asRecord(user?.payload);
    /** remark 延续 RN 备注优先规则。 */
    const remark = readString(friendship.alias);
    /** nickname 优先使用 users 表规范字段，再回退 raw 快照。 */
    const nickname = normalizeIMUserNickname(user?.nickname?.trim() || readString(userPayload.nickname) ||
        readString(nestedUser.nickname), userID);
    /** account 保留可见账号字段供搜索命中摘要使用。 */
    const account = readString(userPayload.account) || readString(nestedUser.account);
    /** phone 保留服务端允许缓存的手机号字段。 */
    const phone = readString(userPayload.phone) || readString(nestedUser.phone);
    /** email 保留服务端允许缓存的邮箱字段。 */
    const email = readString(userPayload.email) || readString(nestedUser.email);
    /** allowGroupInvite 从好友关系 permission 恢复并保留缺失状态。 */
    const allowGroupInvite = readBoolean(asRecord(friendship.permission).allow_group_invite);
    return {
        userID,
        displayName: remark || nickname || formatIMUserDisplayName(userID),
        nickname,
        remark,
        account,
        phone,
        email,
        avatarURL: user?.faceURL?.trim() || readString(userPayload.avatar_url) ||
            readString(nestedUser.avatar_url),
        isStarred: friendship.is_starred === true,
        ...(allowGroupInvite === undefined ? {} : { allowGroupInvite }),
        addedAt: readString(friendship.created_at),
    };
}
/** 从缓存对象读取真实布尔值并保留缺失状态。 */
function readBoolean(value) {
    return typeof value === 'boolean' ? value : undefined;
}
/** 将未知缓存值收窄为只读普通对象。 */
function asRecord(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value)
        ? value
        : {};
}
/** 从缓存对象读取去除首尾空白的字符串。 */
function readString(value) {
    return typeof value === 'string' ? value.trim() : '';
}
/** 按 RN 好友添加时间倒序，并保持无时间记录的原始顺序。 */
function sortWebIMContacts(contacts) {
    return contacts
        .map((contact, index) => ({ contact, index }))
        .sort((left, right) => {
        // rightTime 与 leftTime 只接受可解析时间。
        const rightTime = Date.parse(right.contact.addedAt);
        // leftTime 与原列表 index 共同保证稳定排序。
        const leftTime = Date.parse(left.contact.addedAt);
        if (Number.isFinite(rightTime) && Number.isFinite(leftTime)) {
            return rightTime - leftTime || left.index - right.index;
        }
        if (Number.isFinite(rightTime))
            return 1;
        if (Number.isFinite(leftTime))
            return -1;
        return left.index - right.index;
    })
        .map(item => item.contact);
}
/** 将通讯录 page size 限制在 Gateway 可控范围。 */
function clampContactPageSize(value) {
    if (!Number.isFinite(value))
        return 100;
    return Math.min(200, Math.max(1, Math.trunc(value ?? 100)));
}
//# sourceMappingURL=contact-sync.js.map