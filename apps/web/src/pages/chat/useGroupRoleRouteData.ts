import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Conversation, WebIMGroupMember, WebIMJoinedGroup } from '@im28/im-sdk/web';

import { useAppToast } from '../../components/interaction/index.js';
import { useWebIMRuntime } from '../../runtime/index.js';

/** 群角色子路由共用的真实会话、群权限和成员快照。 */
export interface GroupRoleRouteData {
  readonly restoring: boolean;
  readonly runtimeAvailable: boolean;
  readonly authenticated: boolean;
  readonly currentUserID: string;
  readonly loading: boolean;
  readonly submitting: boolean;
  readonly conversation: Conversation | null;
  readonly group: WebIMJoinedGroup | null;
  readonly members: readonly WebIMGroupMember[];
  readonly error: string | null;
  readonly refresh: () => Promise<void>;
  readonly addAdmins: (userIDs: readonly string[]) => Promise<boolean>;
  readonly removeAdmin: (userID: string) => Promise<boolean>;
  readonly transferOwner: (userID: string) => Promise<boolean>;
}

/** 为管理员和群主转让子路由组合唯一 cache-first SDK 调用链。 */
export function useGroupRoleRouteData(conversationID: string): GroupRoleRouteData {
  /** toast 跨路由承载角色操作的瞬时成功与失败。 */
  const { toast } = useAppToast();
  /** runtimeSnapshot 提供当前账号和 Web SDK composition。 */
  const { runtime, snapshot, restoring, startupError } = useWebIMRuntime();
  /** sync 跟随当前认证 runtime，页面不直接接触 Gateway 或 Repository。 */
  const sync = useMemo(() => runtime?.getSync() ?? null, [runtime]);
  /** conversation 保存已验证的群会话。 */
  const [conversation, setConversation] = useState<Conversation | null>(null);
  /** group 保存 shared 权限投影。 */
  const [group, setGroup] = useState<WebIMJoinedGroup | null>(null);
  /** members 保存完整群成员快照。 */
  const [members, setMembers] = useState<readonly WebIMGroupMember[]>([]);
  /** loading 覆盖 cache 恢复和权威刷新。 */
  const [loading, setLoading] = useState(true);
  /** submitting 阻止角色 mutation 重复提交。 */
  const [submitting, setSubmitting] = useState(false);
  /** error 展示真实 runtime、Gateway 或 SQLite 失败。 */
  const [error, setError] = useState<string | null>(startupError);

  /** load 先恢复账号缓存，再用 shared facade 完成权威刷新。 */
  const load = useCallback(async (): Promise<void> => {
    if (!sync || !snapshot.userID || !conversationID) return;
    setLoading(true);
    setError(null);
    try {
      /** conversations 缺失目标时才执行远端同步。 */
      let conversations = await sync.conversations.listCached({ limit: 500 });
      /** target 必须是当前账号真实群会话。 */
      let target = conversations.find(item => item.conversationID === conversationID);
      if (!target) {
        conversations = await sync.conversations.sync({ pageSize: 100 });
        target = conversations.find(item => item.conversationID === conversationID);
      }
      if (!target || target.type !== 'group' || !target.targetID.trim()) {
        throw new Error('群聊不存在或尚未同步');
      }
      setConversation(target);
      /** groupID 只取已验证会话稳定目标。 */
      const groupID = target.targetID.trim();
      /** cachedFacts 允许弱网先恢复上次完整快照。 */
      const [cachedGroups, cachedMembers] = await Promise.all([
        sync.groups.listCached(),
        sync.groupMembers.listCached(groupID),
      ]);
      setGroup(cachedGroups.find(item => item.groupID === groupID) ?? null);
      setMembers(cachedMembers);
      /** refreshedGroups 必须先落群资料，冷缓存成员同步依赖该稳定群身份。 */
      const refreshedGroups = await sync.groups.sync({ pageSize: 100 });
      /** refreshedMembers 随后执行完整分页和 success-only 快照替换。 */
      const refreshedMembers = await sync.groupMembers.sync(groupID, { pageSize: 100 });
      setGroup(refreshedGroups.find(item => item.groupID === groupID) ?? null);
      setMembers(refreshedMembers);
    } catch (cause) {
      setError(readGroupRoleRouteError(cause));
    } finally {
      setLoading(false);
    }
  }, [conversationID, snapshot.userID, sync]);

  useEffect(() => { void load(); }, [load]);

  /** changeAdmins 只把稳定身份交给 shared exactly-once owner。 */
  async function changeAdmins(userIDs: readonly string[], role: 'admin' | 'member'): Promise<boolean> {
    if (!sync || !conversation || submitting) return false;
    setSubmitting(true);
    setError(null);
    try {
      /** result 显式区分本地已收敛和远端部分成功。 */
      const result = role === 'admin'
        ? await sync.groupMembers.setAdmins({ groupID: conversation.targetID, userIDs })
        : await sync.groupMembers.cancelAdmins({ groupID: conversation.targetID, userIDs });
      setMembers(result.members);
      if (result.cacheState === 'remote-only') {
        setError('服务端操作已完成，本地成员快照尚未刷新；请稍后重新进入页面。');
        return false;
      }
      toast.success(role === 'admin' ? '管理员已添加' : '已移除管理员权限');
      return true;
    } catch (cause) {
      toast.error(readGroupRoleRouteError(cause, '群角色操作失败，请稍后重试'));
      return false;
    } finally {
      setSubmitting(false);
    }
  }

  /** transferOwner 将唯一稳定成员身份交给 shared exactly-once owner。 */
  async function transferOwner(userID: string): Promise<boolean> {
    if (!sync || !conversation || submitting) return false;
    setSubmitting(true);
    setError(null);
    try {
      /** result 包含转让后的权威或当前可用成员快照。 */
      const result = await sync.groupMembers.transferOwner({
        groupID: conversation.targetID,
        newOwnerUserID: userID,
      });
      setMembers(result.members);
      if (result.cacheState === 'remote-only') {
        setError('服务端操作已完成，本地成员快照尚未刷新；请稍后重新进入页面。');
        return false;
      }
      toast.success('群主已转让');
      return true;
    } catch (cause) {
      toast.error(readGroupRoleRouteError(cause, '群主转让失败，请稍后重试'));
      return false;
    } finally {
      setSubmitting(false);
    }
  }

  return {
    restoring,
    runtimeAvailable: Boolean(runtime),
    authenticated: Boolean(snapshot.userID),
    currentUserID: snapshot.userID ?? '',
    loading,
    submitting,
    conversation,
    group,
    members,
    error,
    refresh: load,
    addAdmins: userIDs => changeAdmins(userIDs, 'admin'),
    removeAdmin: userID => changeAdmins([userID], 'member'),
    transferOwner,
  };
}

/** 将群角色子路由异常转换为不包含凭据的可见文案。 */
function readGroupRoleRouteError(cause: unknown, fallback = '群角色信息加载失败，请稍后重试'): string {
  return cause instanceof Error && cause.message
    ? cause.message
    : fallback;
}
