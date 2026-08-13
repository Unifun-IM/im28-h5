import { createWebIMSyncError } from './sync-context.js';
import { normalizeIMUserPresence, normalizeIMUserPresenceIDs, normalizeIMUserPresencePayload, } from './user-presence-normalization.js';
/** Gateway 单次 presence 查询允许的最大用户数。 */
const IM_USER_PRESENCE_BATCH_SIZE = 100;
/** 创建不持久化在线状态的共享 presence facade。 */
export function createIMUserPresenceSync(dependencies) {
    return new IMUserPresenceSyncImpl(dependencies);
}
/** Presence service 统一 HTTP 首值、WS 增量和账号隔离。 */
class IMUserPresenceSyncImpl {
    /** dependencies 保留唯一 Gateway client 和认证 owner。 */
    dependencies;
    /** subscribers 只驻留当前 runtime 内存，不写入账号 SQLite。 */
    subscribers = new Set();
    /** 保存 transport 与认证依赖，不创建第二套 session。 */
    constructor(dependencies) {
        this.dependencies = dependencies;
    }
    /** 批量查询在线状态并按首次出现的用户 ID 去重。 */
    async list(userIDs) {
        this.requireAuthenticatedUser();
        /** normalizedUserIDs 避免空 ID、重复 ID 和超限单请求。 */
        const normalizedUserIDs = normalizeIMUserPresenceIDs(userIDs);
        if (!normalizedUserIDs.length)
            return [];
        /** resultByUserID 保留请求顺序并让后批次覆盖同用户旧值。 */
        const resultByUserID = new Map();
        for (
        /** offset 是当前 Gateway presence 批次起点。 */
        let offset = 0; offset < normalizedUserIDs.length; offset += IM_USER_PRESENCE_BATCH_SIZE) {
            /** batch 严格满足 OpenAPI 的单次 100 人上限。 */
            const batch = normalizedUserIDs.slice(offset, offset + IM_USER_PRESENCE_BATCH_SIZE);
            /** response 由共享 Gateway client 统一处理 envelope 和认证错误。 */
            const response = await this.dependencies.gatewayClient.listPresence({
                user_ids: batch,
            });
            for (const item of response.list ?? []) {
                /** presence 丢弃缺少稳定用户 ID 的服务端异常项。 */
                const presence = normalizeIMUserPresence(item);
                if (presence)
                    resultByUserID.set(presence.userID, presence);
            }
        }
        return normalizedUserIDs.flatMap(userID => {
            /** presence 按请求顺序返回，未命中保持未知而非伪造离线。 */
            const presence = resultByUserID.get(userID);
            return presence ? [presence] : [];
        });
    }
    /** 先订阅实时变化再查询首值，且不让慢首值覆盖更新后的状态。 */
    observe(userIDs, listener) {
        /** accountUserID 把监听器固定到创建时账号，防止切号串状态。 */
        const accountUserID = this.requireAuthenticatedUser();
        /** normalizedUserIDs 同时用于查询和实时事件过滤。 */
        const normalizedUserIDs = normalizeIMUserPresenceIDs(userIDs);
        /** targetUserIDs 让每次 WS 更新只通知相关观察者。 */
        const targetUserIDs = new Set(normalizedUserIDs);
        /** realtimeRevision 阻止首值请求返回前的实时新状态被旧响应覆盖。 */
        let realtimeRevision = 0;
        /** realtimeListener 仅推进本观察任务的竞态版本。 */
        const realtimeListener = presence => {
            realtimeRevision += 1;
            listener(presence);
        };
        /** observedSubscriber 是 clear/unsubscribe 可精确移除的稳定引用。 */
        const observedSubscriber = {
            accountUserID,
            userIDs: targetUserIDs,
            listener: realtimeListener,
        };
        this.subscribers.add(observedSubscriber);
        /** ready 公开首值失败，调用方可保持未知态但不会丢失后续实时更新。 */
        const ready = this.list(normalizedUserIDs)
            .then(presence => {
            if (realtimeRevision === 0 &&
                this.subscribers.has(observedSubscriber) &&
                this.dependencies.getCurrentUserID()?.trim() === accountUserID) {
                listener(presence);
            }
        })
            .catch(cause => {
            if (realtimeRevision > 0)
                return;
            throw cause;
        });
        return {
            ready,
            unsubscribe: () => {
                this.subscribers.delete(observedSubscriber);
            },
        };
    }
    /** 解析 `user_status` frame 并同步通知当前账号相关观察者。 */
    handleRealtimeEvent(event) {
        if (event.type !== 'user_status')
            return false;
        /** presence 是与 RN Gateway fallback 相同别名规则的标准状态列表。 */
        const presence = normalizeIMUserPresencePayload(event.data ?? event.raw);
        if (!presence.length)
            return false;
        /** currentUserID 阻止匿名期或旧账号 frame 触发页面更新。 */
        const currentUserID = this.dependencies.getCurrentUserID()?.trim() ?? '';
        if (!currentUserID)
            return false;
        for (const subscriber of [...this.subscribers]) {
            if (subscriber.accountUserID !== currentUserID)
                continue;
            /** matched 只保留该观察者声明的用户。 */
            const matched = presence.filter(item => subscriber.userIDs.has(item.userID));
            if (!matched.length)
                continue;
            try {
                subscriber.listener(matched);
            }
            catch (cause) {
                this.dependencies.reportListenerError?.(cause);
            }
        }
        return true;
    }
    /** 清除账号会话持有的全部内存监听器。 */
    clear() {
        this.subscribers.clear();
    }
    /** 在网络或订阅前读取唯一认证账号。 */
    requireAuthenticatedUser() {
        /** userID 只来自 runtime 私有认证会话。 */
        const userID = this.dependencies.getCurrentUserID()?.trim() ?? '';
        if (!userID) {
            throw createWebIMSyncError('USER_PRESENCE_AUTH_REQUIRED', 'User presence requires an authenticated IM session.');
        }
        return userID;
    }
}
//# sourceMappingURL=user-presence.js.map