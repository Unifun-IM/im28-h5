import { useCallback, useState } from 'react';
import {
  formatIMUserDisplayName,
  type WebIMContact,
  type WebIMRuntime,
} from '@im28/im-sdk/web';
import { useNavigate } from 'react-router-dom';

import { useAppToast } from '../../components/interaction/index.js';
import { useWebIMCall } from '../../runtime/index.js';
import { useChatShareModal } from '../share/ChatShareModalProvider.js';
import {
  getContactActionMenuState,
  type ContactActionKey,
  type ContactActionMenuState,
  type ContactActionPoint,
} from './contact-action-view.js';

/** 通讯录动作 Hook 只编排现有 shared facade、全局通话 owner 和 SPA 路由。 */
export interface UseContactsPageActionsOptions {
  readonly runtime: WebIMRuntime | null;
  readonly onContactDeleted: (userID: string) => void;
}

/** 通讯录页面消费的联系人动作状态与入口。 */
export interface ContactsPageActions {
  readonly actionMenu: ContactActionMenuState | null;
  readonly callTarget: WebIMContact | null;
  readonly deleteTarget: WebIMContact | null;
  readonly actionPending: boolean;
  readonly actionError: string | null;
  readonly openContactActions: (contact: WebIMContact, point: ContactActionPoint) => void;
  readonly closeActionMenu: () => void;
  readonly handleContactAction: (action: ContactActionKey) => void;
  readonly closeCallTarget: () => void;
  readonly startContactCall: (mediaType: 'audio' | 'video') => Promise<void>;
  readonly closeDeleteTarget: () => void;
  readonly deleteContact: (scope: 'self' | 'both') => Promise<void>;
}

/** 集中持有通讯录长按菜单、通话和删除动作，页面只负责列表展示。 */
export function useContactsPageActions(
  options: UseContactsPageActionsOptions,
): ContactsPageActions {
  /** runtime 和回调解构后形成稳定、可审计的 Hook 依赖。 */
  const { runtime, onContactDeleted } = options;
  /** navigate 只处理会话等真实 SPA 页面切换。 */
  const navigate = useNavigate();
  /** shareModal 统一持有名片目标选择和发送。 */
  const shareModal = useChatShareModal();
  /** callOwner 是 Web 全局唯一通话生命周期 owner。 */
  const callOwner = useWebIMCall();
  /** toast 与 RN 统一承载通话启动等瞬时反馈。 */
  const { toast } = useAppToast();
  /** actionMenu 保存当前联系人和 RN 视口定位结果。 */
  const [actionMenu, setActionMenu] = useState<ContactActionMenuState | null>(null);
  /** callTarget 等待用户在语音和视频间二次选择。 */
  const [callTarget, setCallTarget] = useState<WebIMContact | null>(null);
  /** deleteTarget 等待用户确认删除范围。 */
  const [deleteTarget, setDeleteTarget] = useState<WebIMContact | null>(null);
  /** actionPending 阻止联系人写动作和通话重复提交。 */
  const [actionPending, setActionPending] = useState(false);
  /** actionError 呈现真实 facade 失败。 */
  const [actionError, setActionError] = useState<string | null>(null);

  /** openContactActions 按 RN 固定尺寸把长按点转换为菜单位置。 */
  const openContactActions = useCallback((
    contact: WebIMContact,
    point: ContactActionPoint,
  ): void => {
    setActionError(null);
    setActionMenu(getContactActionMenuState({
      contact,
      point,
      viewportWidth: globalThis.innerWidth,
      viewportHeight: globalThis.innerHeight,
    }));
  }, []);

  /** closeActionMenu 关闭当前联系人长按菜单。 */
  const closeActionMenu = useCallback((): void => {
    setActionMenu(null);
  }, []);

  /** openConversation 通过 shared peer facade 解析真实单聊后进入聊天页。 */
  const openConversation = useCallback(async (contact: WebIMContact): Promise<void> => {
    if (!runtime || actionPending) return;
    setActionPending(true);
    setActionError(null);
    try {
      /** conversation 是 Gateway 与 SQLite 收敛后的 canonical 单聊。 */
      const conversation = await runtime.getSync().peerProfile
        .openConversation(contact.userID);
      navigate(`/conversations/${encodeURIComponent(conversation.conversationID)}`);
    } catch (cause) {
      setActionError(readContactActionError(cause, '打开聊天失败'));
    } finally {
      setActionPending(false);
    }
  }, [actionPending, navigate, runtime]);

  /** startContactCall 在二次选择后解析单聊并交给全局通话 owner。 */
  const startContactCall = useCallback(async (
    mediaType: 'audio' | 'video',
  ): Promise<void> => {
    /** contact 固定用户确认时的目标，随后立即关闭选择层。 */
    const contact = callTarget;
    if (!runtime || !contact || actionPending) return;
    setCallTarget(null);
    setActionPending(true);
    setActionError(null);
    try {
      /** conversationID 必须来自 shared facade，禁止在页面拼接。 */
      const conversation = await runtime.getSync().peerProfile
        .openConversation(contact.userID);
      await callOwner.startOutgoing({
        conversationID: conversation.conversationID,
        peerName: contact.displayName || formatIMUserDisplayName(contact.userID),
        peerAvatarURL: contact.avatarURL,
        mediaType,
      });
    } catch (cause) {
      toast.error(readContactActionError(cause, '发起通话失败'));
    } finally {
      setActionPending(false);
    }
  }, [actionPending, callOwner, callTarget, runtime, toast]);

  /** deleteContact 在明确清理范围后调用 shared success-only 删除状态机。 */
  const deleteContact = useCallback(async (scope: 'self' | 'both'): Promise<void> => {
    /** contact 固定本次破坏性操作目标。 */
    const contact = deleteTarget;
    if (!runtime || !contact || actionPending) return;
    setActionPending(true);
    setActionError(null);
    try {
      await runtime.getSync().contacts.deleteFriend({
        friendUserID: contact.userID,
        clearScope: scope,
      });
      onContactDeleted(contact.userID);
      setDeleteTarget(null);
    } catch (cause) {
      setActionError(readContactActionError(cause, '删除好友失败'));
    } finally {
      setActionPending(false);
    }
  }, [actionPending, deleteTarget, onContactDeleted, runtime]);

  /** handleContactAction 仅打开下一层或调用已拥有的真实能力。 */
  const handleContactAction = useCallback((action: ContactActionKey): void => {
    /** contact 固定关闭菜单前的目标。 */
    const contact = actionMenu?.contact;
    setActionMenu(null);
    if (!contact) return;
    if (action === 'message') {
      void openConversation(contact);
      return;
    }
    if (action === 'call') {
      setCallTarget(contact);
      return;
    }
    if (action === 'share-card') {
      shareModal.openShare({
        kind: 'user-card',
        userID: contact.userID,
        displayName: contact.displayName,
        avatarURL: contact.avatarURL,
      });
      return;
    }
    setDeleteTarget(contact);
  }, [actionMenu, openConversation, shareModal]);

  /** closeCallTarget 取消通话类型二次选择。 */
  const closeCallTarget = useCallback((): void => {
    setCallTarget(null);
  }, []);

  /** closeDeleteTarget 取消联系人删除确认。 */
  const closeDeleteTarget = useCallback((): void => {
    setDeleteTarget(null);
  }, []);

  return {
    actionMenu,
    callTarget,
    deleteTarget,
    actionPending,
    actionError,
    openContactActions,
    closeActionMenu,
    handleContactAction,
    closeCallTarget,
    startContactCall,
    closeDeleteTarget,
    deleteContact,
  };
}

/** 将未知联系人动作异常转换为不泄露 transport 细节的可见文案。 */
function readContactActionError(cause: unknown, fallback: string): string {
  return cause instanceof Error && cause.message ? cause.message : fallback;
}
