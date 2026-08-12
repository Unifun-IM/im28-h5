import { useState } from 'react';
import type { WebIMConversationListItem, WebIMSync } from '@im28/im-sdk/web';

import type {
  ConversationAction,
  ConversationActionAnchor,
} from './ConversationActionMenu.js';

/** 会话动作 hook 参数只接收现有共享 facade 与页面 cache 重读函数。 */
interface UseConversationActionsOptions {
  readonly sync: WebIMSync | null;
  readonly archiveValue: boolean;
  readonly reloadCachedConversations: () => Promise<void>;
  readonly reportError: (message: string) => void;
}

/** 普通列表和归档列表共用的会话操作状态。 */
export interface ConversationActionsBinding {
  readonly actionTarget: WebIMConversationListItem | null;
  readonly actionAnchor: ConversationActionAnchor | null;
  readonly actionPending: boolean;
  readonly deleteTarget: WebIMConversationListItem | null;
  readonly canDeleteForAll: boolean;
  readonly closeActionMenu: () => void;
  readonly openActionMenu: (
    item: WebIMConversationListItem,
    anchor: ConversationActionAnchor,
  ) => void;
  readonly runConversationAction: (action: ConversationAction) => Promise<void>;
  readonly closeDeleteSheet: () => void;
  readonly confirmDeleteConversation: (deleteForAll: boolean) => Promise<void>;
}

/** 统一编排 RN 会话菜单动作，页面不得复制 Gateway 或 SQLite 状态机。 */
export function useConversationActions({
  sync,
  archiveValue,
  reloadCachedConversations,
  reportError,
}: UseConversationActionsOptions): ConversationActionsBinding {
  /** actionTarget 保存当前长按会话的共享缓存快照。 */
  const [actionTarget, setActionTarget] = useState<WebIMConversationListItem | null>(null);
  /** actionAnchor 保存长按行的视口定位信息。 */
  const [actionAnchor, setActionAnchor] = useState<ConversationActionAnchor | null>(null);
  /** actionPending 阻止会话 mutation 重复提交。 */
  const [actionPending, setActionPending] = useState(false);
  /** deleteTarget 只在用户选择删除后打开范围确认层。 */
  const [deleteTarget, setDeleteTarget] = useState<WebIMConversationListItem | null>(null);
  /** canDeleteForAll 是共享群角色快照的界面权限投影。 */
  const [canDeleteForAll, setCanDeleteForAll] = useState(false);

  /** closeActionMenu 清理气泡目标和定位，避免路由滚动后残留。 */
  function closeActionMenu(): void {
    setActionTarget(null);
    setActionAnchor(null);
  }

  /** openActionMenu 接收会话行计算出的真实视口锚点。 */
  function openActionMenu(
    item: WebIMConversationListItem,
    anchor: ConversationActionAnchor,
  ): void {
    setDeleteTarget(null);
    setActionTarget(item);
    setActionAnchor(anchor);
  }

  /** openDeleteSheet 读取共享群 capability 后展示允许的删除范围。 */
  async function openDeleteSheet(target: WebIMConversationListItem): Promise<void> {
    if (!sync) return;
    closeActionMenu();
    setCanDeleteForAll(target.conversation.type === 'single');
    setDeleteTarget(target);
    if (target.conversation.type !== 'group') return;
    try {
      /** groups 是 SDK 已规范化的当前账号已加入群缓存。 */
      const groups = await sync.groups.listCached();
      /** group 必须与会话 targetID 精确匹配。 */
      const group = groups.find(item => item.groupID === target.conversation.targetID);
      setCanDeleteForAll(group?.permissions.canClearMessages === true);
    } catch (cause) {
      setCanDeleteForAll(false);
      reportError(readConversationActionError(cause));
    }
  }

  /** runConversationAction 只编排共享 facade，不在页面复制状态机。 */
  async function runConversationAction(action: ConversationAction): Promise<void> {
    if (!sync || !actionTarget || actionPending) return;
    /** target 冻结用户长按时选择的会话，避免异步期间串目标。 */
    const target = actionTarget;
    if (action === 'delete') {
      await openDeleteSheet(target);
      return;
    }
    setActionPending(true);
    try {
      /** conversation 保存动作所需的 canonical 当前状态。 */
      const conversation = target.conversation;
      if (action === 'read') {
        /** hasUnread 同时覆盖服务端未读和本地手动未读。 */
        const hasUnread = conversation.unreadCount > 0 || conversation.manualUnread === true;
        await (hasUnread
          ? sync.conversations.markRead(conversation.conversationID)
          : sync.conversations.markUnread(conversation.conversationID));
      } else if (action === 'pin') {
        await sync.conversations.setPinned(conversation.conversationID, !conversation.isPinned);
      } else if (action === 'mute') {
        await sync.conversations.setMuted(conversation.conversationID, !conversation.isMuted);
      } else if (action === 'archive') {
        await sync.conversations.setArchived(conversation.conversationID, archiveValue);
      }
      await reloadCachedConversations();
      closeActionMenu();
    } catch (cause) {
      reportError(readConversationActionError(cause));
    } finally {
      setActionPending(false);
    }
  }

  /** confirmDeleteConversation 在用户二次确认后调用共享清空状态机。 */
  async function confirmDeleteConversation(deleteForAll: boolean): Promise<void> {
    if (!sync || !deleteTarget || actionPending) return;
    setActionPending(true);
    try {
      /** conversation 冻结确认层当前 destructive target。 */
      const conversation = deleteTarget.conversation;
      /** scope 严格区分本端、单聊双方和群全员。 */
      const scope = deleteForAll
        ? (conversation.type === 'group' ? 'all_members' : 'both')
        : 'self';
      await sync.conversations.clear({
        conversationID: conversation.conversationID,
        scope,
      });
      await reloadCachedConversations();
      setDeleteTarget(null);
    } catch (cause) {
      reportError(readConversationActionError(cause));
    } finally {
      setActionPending(false);
    }
  }

  return {
    actionTarget,
    actionAnchor,
    actionPending,
    deleteTarget,
    canDeleteForAll,
    closeActionMenu,
    openActionMenu,
    runConversationAction,
    closeDeleteSheet: () => setDeleteTarget(null),
    confirmDeleteConversation,
  };
}

/** 将未知会话动作异常转换为稳定中文提示。 */
function readConversationActionError(cause: unknown): string {
  return cause instanceof Error && cause.message ? cause.message : '会话操作失败，请稍后重试';
}
