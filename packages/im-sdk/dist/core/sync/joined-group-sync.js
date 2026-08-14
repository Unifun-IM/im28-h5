import { createIMGroupCreationSync, } from './group-creation.js';
import { GroupRepository, } from '@im28/im-sdk/core';
import { createWebIMSyncError, requireWebIMSyncContext, } from './sync-context.js';
import { sendWebIMTextMessage } from './message-text-send.js';
import { getIMGroupAnnouncementReadStatus, markIMGroupAnnouncementRead, publishIMGroupAnnouncement, } from './group-announcement.js';
import { updateIMJoinedGroupAvatar, updateIMJoinedGroupIntroduction, updateIMJoinedGroupName, } from './joined-group-profile-actions.js';
import { mapCoreGroupToWeb, mergeGatewayGroupDetailToCore, mapGatewayGroupToCore, readJoinedGroupCache, } from './joined-group-mappers.js';
/** 创建当前账号绑定的我的群聊 facade。 */
export function createWebIMJoinedGroupSync(dependencies) {
    return new WebIMJoinedGroupSyncImpl(dependencies);
}
/** 我的群聊 service 负责分页、归一化和 SQLite 快照替换。 */
class WebIMJoinedGroupSyncImpl {
    // dependencies 保持唯一认证、Gateway、数据库与队列 owners。
    dependencies;
    /** 保存 runtime owners，不复制 token 或数据库连接。 */
    constructor(dependencies) {
        this.dependencies = dependencies;
    }
    /** 从当前账号 SQLite 返回按服务端顺序恢复的群列表。 */
    async listCached() {
        // context 同时拒绝匿名状态和未打开数据库。
        const context = requireWebIMSyncContext(this.dependencies, 'Joined group cache read');
        return readJoinedGroupCache(new GroupRepository(context.database), context.userID);
    }
    /** 完整拉取远端群列表后原子替换当前账号 SQLite 快照。 */
    sync(options = {}) {
        // operation 在 FIFO 真正执行时重新绑定当前账号，防止切号写错库。
        const operation = async () => {
            // context 冻结本轮认证用户和 account database。
            const context = requireWebIMSyncContext(this.dependencies, 'Joined group sync');
            // remoteGroups 在全分页成功前只驻留内存。
            const remoteGroups = await fetchAllJoinedGroups(this.dependencies.gatewayClient, clampJoinedGroupPageSize(options.pageSize));
            // groups 在任何 SQLite 写入前完成字段验证和映射。
            const groups = remoteGroups
                .map((group, index) => mapGatewayGroupToCore(group, index))
                .filter((group) => group !== null);
            // repository 是 groups 表唯一读写 owner。
            const repository = new GroupRepository(context.database);
            await repository.replaceAll(groups);
            return readJoinedGroupCache(repository, context.userID);
        };
        // mutationQueue 与会话、消息和其他 cache mutation 共用顺序。
        const queue = this.dependencies.mutationQueue;
        return queue ? queue.enqueue(operation) : operation();
    }
    /** 拉取单群权威详情并在身份校验通过后合并当前账号缓存。 */
    fetchDetail(groupID) {
        /** normalizedGroupID 拒绝空身份进入 Gateway 或缓存。 */
        const normalizedGroupID = groupID.trim();
        if (!normalizedGroupID) {
            throw createWebIMSyncError('GROUP_DETAIL_ID_REQUIRED', 'Group detail requires a group ID.');
        }
        /** operation 在共享队列执行时重新绑定当前账号。 */
        const operation = async () => {
            /** context 冻结详情请求对应的账号和数据库。 */
            const context = requireWebIMSyncContext(this.dependencies, 'Joined group detail sync');
            /** remoteGroup 只接受与请求主键完全一致的响应。 */
            const remoteGroup = await this.dependencies.gatewayClient.getGroup({
                group_id: normalizedGroupID,
            });
            if (remoteGroup.group_id?.trim() !== normalizedGroupID) {
                throw createWebIMSyncError('GROUP_DETAIL_ID_MISMATCH', 'Gateway group detail does not match the requested group.');
            }
            /** repository 是单群详情缓存合并的唯一写入 owner。 */
            const repository = new GroupRepository(context.database);
            /** existingGroup 保留列表顺序和详情接口未返回的已确认字段。 */
            const existingGroup = await repository.getByID(normalizedGroupID);
            /** nextGroup 由共享 mapper 合并 raw payload，避免页面持有 DTO 规则。 */
            const nextGroup = mergeGatewayGroupDetailToCore(existingGroup, remoteGroup);
            await repository.upsert(nextGroup);
            return mapCoreGroupToWeb(nextGroup, context.userID);
        };
        /** queue 与群列表和其他缓存 mutation 共用账号时序。 */
        const queue = this.dependencies.mutationQueue;
        return queue ? queue.enqueue(operation) : operation();
    }
    /** 更新群昵称并只在 Gateway 成功后收敛当前群缓存。 */
    updateName(groupID, name) {
        return updateIMJoinedGroupName(this.dependencies, groupID, name, mapCoreGroupToWeb);
    }
    /** 上传群头像后在共享写队列内收敛远端群资料。 */
    async updateAvatar(groupID, input) {
        return updateIMJoinedGroupAvatar(this.dependencies, groupID, input, mapCoreGroupToWeb);
    }
    /** 更新群简介并只在 Gateway 精确成功后收敛当前群缓存。 */
    updateIntroduction(groupID, introduction) {
        return updateIMJoinedGroupIntroduction(this.dependencies, groupID, introduction, mapCoreGroupToWeb);
    }
    /** 发布公告并复用同一写队列完成群缓存与消息状态收敛。 */
    publishAnnouncement(options) {
        // operation 内部消息端口直接调用底层发送，避免同一 FIFO 递归入队。
        const operation = async () => {
            // context 冻结公告更新和文本消息共同使用的账号数据库。
            const context = requireWebIMSyncContext(this.dependencies, 'Group announcement publish');
            // result 保留 shared owner 的部分失败与真实 message 状态。
            const result = await publishIMGroupAnnouncement(context, options, this.dependencies.gatewayClient, {
                sendText: messageOptions => sendWebIMTextMessage(context, messageOptions, this.dependencies),
            });
            return {
                group: mapCoreGroupToWeb(result.group, context.userID),
                message: result.message,
            };
        };
        // queue 防止公告资料、消息和其他 cache mutation 交错覆盖。
        const queue = this.dependencies.mutationQueue;
        return queue ? queue.enqueue(operation) : operation();
    }
    /** 查询服务端公告版本状态并成功后更新群权限快照。 */
    getAnnouncementReadStatus(groupID) {
        // operation 在队列执行时绑定当前认证账号。
        const operation = () => getIMGroupAnnouncementReadStatus(requireWebIMSyncContext(this.dependencies, 'Group announcement read status'), groupID, this.dependencies.gatewayClient);
        // queue 阻止状态写回与群列表刷新交错。
        const queue = this.dependencies.mutationQueue;
        return queue ? queue.enqueue(operation) : operation();
    }
    /** 标记实际展示版本并复查权威状态，旧版本不会清除新公告未读。 */
    markAnnouncementRead(groupID, announcementVersion) {
        // operation 将 mark、status 复查和 cache 写回保持顺序。
        const operation = () => markIMGroupAnnouncementRead(requireWebIMSyncContext(this.dependencies, 'Group announcement read mark'), groupID, announcementVersion, this.dependencies.gatewayClient);
        // queue 与 realtime/full sync 共用唯一 mutation 顺序。
        const queue = this.dependencies.mutationQueue;
        return queue ? queue.enqueue(operation) : operation();
    }
    /** 创建群完整委托平台中立 owner，页面不直接调用 Gateway 或写缓存。 */
    create(options) {
        return createIMGroupCreationSync(this.dependencies).create(options);
    }
}
/** 拉取全部 token 分页并按首见 group ID 去重。 */
async function fetchAllJoinedGroups(gatewayClient, pageSize) {
    // groups 保存首见顺序，重复记录由后页新值覆盖。
    const groups = new Map();
    // seenTokens 拒绝服务端循环 token。
    const seenTokens = new Set();
    // pageToken 为空表示首屏。
    let pageToken;
    for (let page = 0; page < 1000; page += 1) {
        // response 复用 shared myGroupList endpoint 和 envelope 语义。
        const response = await gatewayClient.myGroupList({
            limit: pageSize,
            ...(pageToken ? { page_token: pageToken } : {}),
        });
        for (const group of response.groups ?? []) {
            // groupID 是去重、缓存和路由的稳定主键。
            const groupID = group.group_id?.trim() ?? '';
            if (groupID)
                groups.set(groupID, group);
        }
        // nextPageToken 只接受非空稳定 token。
        const nextPageToken = response.next_page_token?.trim();
        if (!nextPageToken)
            return [...groups.values()];
        if (seenTokens.has(nextPageToken)) {
            throw createWebIMSyncError('JOINED_GROUP_PAGINATION_LOOP', 'Gateway joined group pagination returned a repeated token.');
        }
        seenTokens.add(nextPageToken);
        pageToken = nextPageToken;
    }
    throw createWebIMSyncError('JOINED_GROUP_PAGE_LIMIT_EXCEEDED', 'Gateway joined group pagination exceeded the safety limit.');
}
/** 限制 myGroupList 单页大小。 */
function clampJoinedGroupPageSize(value) {
    if (!Number.isFinite(value))
        return 50;
    return Math.min(200, Math.max(1, Math.trunc(value ?? 50)));
}
//# sourceMappingURL=joined-group-sync.js.map