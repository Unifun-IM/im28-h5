import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  selectIMEarliestGroupAdmin,
  type Conversation,
  type WebIMGroupMember,
  type WebIMJoinedGroup,
  type WebIMRuntime,
} from '@im28/im-sdk/web';
import { useNavigate } from 'react-router-dom';

import { useAppToast } from '../../components/interaction/index.js';
import { useChatShareModal } from '../share/ChatShareModalProvider.js';
import {
  buildJoinedGroupProfileRoute,
  getJoinedGroupActionMenuState,
  getJoinedGroupQuitMode,
  type JoinedGroupActionKey,
  type JoinedGroupActionMenuState,
  type JoinedGroupActionPoint,
  type JoinedGroupQuitMode,
} from './joined-group-actions-view.js';
import { filterJoinedGroups } from './joined-group-view.js';

/** 我的群聊状态 owner 只接收当前账号 runtime 事实。 */
interface UseJoinedGroupsPageStateOptions {
  readonly runtime: WebIMRuntime | null;
  readonly userID: string;
}

/** 我的群聊页面消费的稳定状态与显式动作。 */
interface JoinedGroupsPageStateBinding {
  readonly groups: readonly WebIMJoinedGroup[];
  readonly visibleGroups: readonly WebIMJoinedGroup[];
  readonly keyword: string;
  readonly loading: boolean;
  readonly refreshing: boolean;
  readonly openingGroupID: string;
  readonly actionMenu: JoinedGroupActionMenuState | null;
  readonly quitTarget: WebIMJoinedGroup | null;
  readonly quitMode: JoinedGroupQuitMode | null;
  readonly ownerQuitAdmin: WebIMGroupMember | null;
  readonly lifecycleSubmitting: boolean;
  readonly error: string | null;
  readonly changeKeyword: (keyword: string) => void;
  readonly loadGroups: () => Promise<void>;
  readonly refreshGroups: () => Promise<void>;
  readonly openGroup: (group: WebIMJoinedGroup) => Promise<void>;
  readonly openGroupActions: (
    group: WebIMJoinedGroup,
    point: JoinedGroupActionPoint,
  ) => void;
  readonly closeGroupActions: () => void;
  readonly handleGroupAction: (action: JoinedGroupActionKey) => Promise<void>;
  readonly cancelQuit: () => void;
  readonly leaveGroup: (clearHistory: boolean) => Promise<void>;
  readonly openOwnerAdminSettings: () => Promise<void>;
}

/** 承载我的群聊 cache-first、会话解析和 lifecycle 事务。 */
export function useJoinedGroupsPageState({
  runtime,
  userID,
}: UseJoinedGroupsPageStateOptions): JoinedGroupsPageStateBinding {
  // navigate 只负责 React Router SPA 页面切换。
  const navigate = useNavigate();
  // toast 统一承载打开群聊和退群 mutation 反馈。
  const { toast } = useAppToast();
  /** shareModal 统一持有群名片目标选择和真实发送。 */
  const shareModal = useChatShareModal();
  // groups 保存 SQLite 或完整远端同步结果。
  const [groups, setGroups] = useState<readonly WebIMJoinedGroup[]>([]);
  // keyword 驱动群名和群 ID 本地搜索。
  const [keyword, setKeyword] = useState('');
  // loading 覆盖首次缓存读取和远端刷新。
  const [loading, setLoading] = useState(false);
  // refreshing 区分用户下拉刷新和首次 cache-first 恢复。
  const [refreshing, setRefreshing] = useState(false);
  // openingGroupID 阻止重复打开群会话。
  const [openingGroupID, setOpeningGroupID] = useState('');
  // actionMenu 保存当前长按群和 RN 气泡位置。
  const [actionMenu, setActionMenu] = useState<JoinedGroupActionMenuState | null>(null);
  // quitTarget 保存等待退出确认的真实群快照。
  const [quitTarget, setQuitTarget] = useState<WebIMJoinedGroup | null>(null);
  // quitMode 只消费 shared lifecycle capability。
  const [quitMode, setQuitMode] = useState<JoinedGroupQuitMode | null>(null);
  // ownerQuitAdmin 由 SDK 选择最早添加的管理员供 RN 同款面板展示。
  const [ownerQuitAdmin, setOwnerQuitAdmin] = useState<WebIMGroupMember | null>(null);
  // lifecycleSubmitting 阻止破坏性群动作重复提交。
  const [lifecycleSubmitting, setLifecycleSubmitting] = useState(false);
  // lifecycleBlockedGroupID 阻止远端已成功动作被页面重放。
  const [lifecycleBlockedGroupID, setLifecycleBlockedGroupID] = useState('');
  // error 显示真实数据库、Gateway 或会话失败。
  const [error, setError] = useState<string | null>(null);

  /** 先读取当前账号 SQLite，再用完整 Gateway 快照刷新。 */
  const loadGroups = useCallback(async (): Promise<void> => {
    if (!runtime || !userID) return;
    // facade 绑定 runtime 的 account database 和 Gateway owners。
    const facade = runtime.getSync().groups;
    setLoading(true);
    setError(null);
    try {
      // cachedGroups 允许离线或弱网时立即展示上次完整快照。
      const cachedGroups = await facade.listCached();
      setGroups(cachedGroups);
      // syncedGroups 只在远端全分页成功并替换 SQLite 后返回。
      const syncedGroups = await facade.sync({ pageSize: 50 });
      setGroups(syncedGroups);
    } catch (cause) {
      setError(readJoinedGroupError(cause));
    } finally {
      setLoading(false);
    }
  }, [runtime, userID]);

  useEffect(() => {
    void loadGroups();
  }, [loadGroups]);

  /** 下拉刷新只执行 shared groups 全量同步，失败时保留当前列表。 */
  const refreshGroups = useCallback(async (): Promise<void> => {
    if (!runtime || !userID || refreshing) return;
    setRefreshing(true);
    setError(null);
    try {
      setGroups(await runtime.getSync().groups.sync({ pageSize: 50 }));
    } catch (cause) {
      setError(readJoinedGroupError(cause));
    } finally {
      setRefreshing(false);
    }
  }, [refreshing, runtime, userID]);

  /** 通过 shared 会话 facade 解析规范群会话身份。 */
  const resolveGroupConversation = useCallback(async (
    group: WebIMJoinedGroup,
  ): Promise<Conversation | null> => {
    if (!runtime || openingGroupID) return null;
    setOpeningGroupID(group.groupID);
    setError(null);
    try {
      // conversation 由 SDK 统一完成 cache、Gateway 身份校验和 SQLite 收敛。
      const conversation = await runtime.getSync().conversations.openGroup({
        groupID: group.groupID,
        conversationID: group.conversationID,
      });
      return conversation;
    } catch (cause) {
      toast.error(readJoinedGroupError(cause, '打开群聊失败'));
      return null;
    } finally {
      setOpeningGroupID('');
    }
  }, [openingGroupID, runtime, toast]);

  /** 解析 canonical Conversation 后进入聊天页。 */
  const openGroup = useCallback(async (group: WebIMJoinedGroup): Promise<void> => {
    // conversation 只能来自 shared openGroup facade。
    const conversation = await resolveGroupConversation(group);
    if (conversation) {
      navigate(`/conversations/${encodeURIComponent(conversation.conversationID)}`);
    }
  }, [navigate, resolveGroupConversation]);

  /** 按长按点和 shared capability 打开群列表动作气泡。 */
  const openGroupActions = useCallback((
    group: WebIMJoinedGroup,
    point: JoinedGroupActionPoint,
  ): void => {
    setActionMenu(getJoinedGroupActionMenuState({
      group,
      point,
      viewportWidth: globalThis.innerWidth,
      viewportHeight: globalThis.innerHeight,
    }));
  }, []);

  /** 关闭当前群列表动作气泡。 */
  const closeGroupActions = useCallback(() => setActionMenu(null), []);

  /** 菜单动作只进入现有 SPA 路由或 shared lifecycle 前置确认。 */
  const handleGroupAction = useCallback(async (
    action: JoinedGroupActionKey,
  ): Promise<void> => {
    // group 在关闭菜单前冻结，避免异步期间目标漂移。
    const group = actionMenu?.group;
    setActionMenu(null);
    if (!group) return;
    if (action === 'share-card') {
      shareModal.openShare({
        kind: 'group-card',
        groupID: group.groupID,
        displayName: group.name,
        avatarURL: group.avatarURL,
      });
      return;
    }
    if (action === 'quit') {
      // mode 只按 shared capability 区分普通成员、群主和不可用入口。
      const mode = getJoinedGroupQuitMode(group);
      if (mode === 'owner') {
        if (!runtime || lifecycleSubmitting) return;
        setLifecycleSubmitting(true);
        setError(null);
        try {
          // members 必须来自 shared 完整同步，避免页面复制继任者规则或使用分页快照。
          const members = await runtime.getSync().groupMembers.sync(group.groupID, { pageSize: 100 });
          setOwnerQuitAdmin(selectIMEarliestGroupAdmin(members));
          setQuitTarget(group);
          setQuitMode(mode);
        } catch (cause) {
          toast.error(readJoinedGroupError(cause, '群成员加载失败'));
        } finally {
          setLifecycleSubmitting(false);
        }
        return;
      }
      setQuitTarget(group);
      setOwnerQuitAdmin(null);
      setQuitMode(mode);
      return;
    }
    // conversation 为群资料路由提供 canonical 身份。
    const conversation = await resolveGroupConversation(group);
    if (!conversation) return;
    navigate(buildJoinedGroupProfileRoute(conversation.conversationID, true));
  }, [actionMenu?.group, lifecycleSubmitting, navigate, resolveGroupConversation, runtime, shareModal, toast]);

  /** 普通成员或已具备管理员继任条件的群主只调用 shared groupLifecycle.leave。 */
  const leaveGroup = useCallback(async (clearHistory: boolean): Promise<void> => {
    if (!runtime || !quitTarget || lifecycleSubmitting
      || lifecycleBlockedGroupID === quitTarget.groupID) return;
    setLifecycleSubmitting(true);
    setError(null);
    try {
      // result 区分本地收敛和远端成功但本地待同步。
      const result = await runtime.getSync().groupLifecycle.leave({
        groupID: quitTarget.groupID,
        clearHistory,
      });
      setQuitMode(null);
      setOwnerQuitAdmin(null);
      if (result.cacheState === 'remote-only') {
        setLifecycleBlockedGroupID(quitTarget.groupID);
        setError('退群已在服务端完成，本地缓存同步失败；为避免重复操作，请刷新群列表');
        return;
      }
      setGroups(current => current.filter(group => group.groupID !== quitTarget.groupID));
      setQuitTarget(null);
      toast.success('已退出群聊');
    } catch (cause) {
      toast.error(readJoinedGroupError(cause, '退出群聊失败'));
    } finally {
      setLifecycleSubmitting(false);
    }
  }, [lifecycleBlockedGroupID, lifecycleSubmitting, quitTarget, runtime, toast]);

  /** 无管理员群主解析真实会话后进入管理员设置。 */
  const openOwnerAdminSettings = useCallback(async (): Promise<void> => {
    if (!quitTarget) return;
    // conversation 防止群 ID 被错误拼成会话路由。
    const conversation = await resolveGroupConversation(quitTarget);
    if (!conversation) return;
    setQuitMode(null);
    setOwnerQuitAdmin(null);
    navigate(`/conversations/${encodeURIComponent(conversation.conversationID)}/settings/manage/admins`);
  }, [navigate, quitTarget, resolveGroupConversation]);

  /** 非提交期间关闭退出确认并释放目标快照。 */
  const cancelQuit = useCallback(() => {
    if (!lifecycleSubmitting) {
      setQuitMode(null);
      setQuitTarget(null);
      setOwnerQuitAdmin(null);
    }
  }, [lifecycleSubmitting]);

  // visibleGroups 保持 SDK 服务端顺序并应用本地搜索。
  const visibleGroups = useMemo(
    () => filterJoinedGroups(groups, keyword),
    [groups, keyword],
  );
  /** changeKeyword 暴露受控搜索更新而不泄漏 React setter。 */
  const changeKeyword = useCallback((nextKeyword: string) => setKeyword(nextKeyword), []);

  return {
    groups, visibleGroups, keyword, loading, refreshing, openingGroupID,
    actionMenu, quitTarget, quitMode, ownerQuitAdmin, lifecycleSubmitting, error,
    changeKeyword, loadGroups, refreshGroups, openGroup, openGroupActions,
    closeGroupActions, handleGroupAction, cancelQuit, leaveGroup,
    openOwnerAdminSettings,
  };
}

/** 将未知异常转换为不包含敏感数据的页面文案。 */
function readJoinedGroupError(
  cause: unknown,
  fallback = '群聊加载失败，请稍后重试',
): string {
  return cause instanceof Error && cause.message ? cause.message : fallback;
}
