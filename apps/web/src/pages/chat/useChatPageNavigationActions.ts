import { useCallback } from 'react';
import type { Conversation, Message, WebIMSync } from '@im28/im-sdk/web';
import { useNavigate } from 'react-router-dom';
import { createGroupApplicationChatRouteState } from '../contacts/group-application-route.js';
import { createGroupCardApplyRouteState } from '../groups/group-search-route.js';
import { buildChatMessageFocusURL } from './chat-message-focus.js';
import type { ChatMessageView } from './chat-message-view.js';
import { readChatPageError } from './chat-page-helpers.js';
import { createChatGroupProfileRouteState } from './group-profile-route-state.js';

/** 聊天页导航动作只消费稳定会话身份和 shared facade。 */
interface UseChatPageNavigationActionsOptions {
  /** 当前 React Router 会话身份。 */
  readonly conversationID: string;
  /** 当前 SQLite 会话快照。 */
  readonly conversation: Conversation | null;
  /** 当前账号聚合 SDK facade。 */
  readonly sync: WebIMSync | null;
  /** 将受控导航错误交回页面统一反馈。 */
  readonly onError: (message: string) => void;
}

/** 聊天页全部 SPA 导航入口，避免页面 JSX 重复拼接路由。 */
interface ChatPageNavigationActions {
  /** 打开当前单聊用户资料或群资料。 */
  readonly openProfile: () => void;
  /** 打开当前群的待审核申请列表。 */
  readonly openGroupApplications: () => void;
  /** 标记群公告已读后打开公告详情。 */
  readonly openGroupAnnouncement: (markRead: () => void) => void;
  /** 按 RN 规则打开用户或群名片。 */
  readonly openCard: (view: ChatMessageView) => Promise<void>;
  /** 定位当前会话内的引用消息。 */
  readonly openQuotedMessage: (message: Pick<Message, 'clientMsgID'>) => void;
  /** 打开当前单聊对端的好友申请页。 */
  readonly openDirectContactApplication: () => void;
  /** 打开当前会话的自定义表情管理页。 */
  readonly openCustomEmojiManager: () => void;
}

/** 集中持有聊天页 React Router 动作，不承载消息或资料业务状态。 */
export function useChatPageNavigationActions({
  conversationID,
  conversation,
  sync,
  onError,
}: UseChatPageNavigationActionsOptions): ChatPageNavigationActions {
  // navigate 是当前浏览器历史栈的唯一写入口。
  const navigate = useNavigate();
  // conversationHref 仅由当前受控 path param 构造。
  const conversationHref = `/conversations/${encodeURIComponent(conversationID)}`;

  /** 打开资料时按会话类型选择既有详情 route。 */
  const openProfile = useCallback(() => {
    if (!conversation) return;
    // activeConversationHref 避免异步切换会话时沿用旧 path param。
    const activeConversationHref = `/conversations/${encodeURIComponent(conversation.conversationID)}`;
    if (conversation.type === 'group') {
      navigate(`${activeConversationHref}/settings/profile`, {
        state: createChatGroupProfileRouteState(conversation.conversationID),
      });
      return;
    }
    navigate(`/contacts/users/${encodeURIComponent(conversation.targetID)}`, {
      state: { backHref: activeConversationHref },
    });
  }, [conversation, navigate]);

  /** 当前群聊头部只进入匹配群身份的申请列表。 */
  const openGroupApplications = useCallback(() => {
    if (conversation?.type !== 'group' || !conversation.targetID) return;
    navigate(`/contacts/group-applications/${encodeURIComponent(conversation.targetID)}`, {
      state: createGroupApplicationChatRouteState(conversationID),
    });
  }, [conversation, conversationID, navigate]);

  /** 公告点击先提交既有本地已读动作，再进入只读详情。 */
  const openGroupAnnouncement = useCallback((markRead: () => void) => {
    markRead();
    navigate(`${conversationHref}/settings/announcement?mode=view`);
  }, [conversationHref, navigate]);

  /** 名片点击复刻 RN：用户进入资料，群聊按真实已加入状态分流。 */
  const openCard = useCallback(async (view: ChatMessageView): Promise<void> => {
    // targetID 只接受消息协议保存的稳定身份。
    const targetID = view.cardTargetID?.trim() ?? '';
    if (!targetID) {
      onError('名片身份不可用');
      return;
    }
    if (view.cardKind !== 'group') {
      navigate(`/contacts/users/${encodeURIComponent(targetID)}`, {
        state: { backHref: conversationHref },
      });
      return;
    }
    if (!sync) {
      onError('群聊服务尚未就绪');
      return;
    }
    try {
      // groups 对齐 RN，每次点击都强制刷新当前账号已加入群列表。
      const groups = await sync.groups.sync({ pageSize: 100 });
      // joinedGroup 必须精确匹配名片 groupID。
      const joinedGroup = groups.find(group => group.groupID === targetID);
      if (joinedGroup) {
        // openedConversation 复用 shared owner 校验群身份并收敛会话缓存。
        const openedConversation = await sync.conversations.openGroup({
          groupID: targetID,
          conversationID: joinedGroup.conversationID,
        });
        navigate(`/conversations/${encodeURIComponent(openedConversation.conversationID)}`);
        return;
      }
      navigate(`/groups/${encodeURIComponent(targetID)}/apply`, {
        state: createGroupCardApplyRouteState(conversationID),
      });
    } catch (cause) {
      try {
        // RN 刷新失败时仍由 openGroup 进行一次权威可进入性校验。
        const openedConversation = await sync.conversations.openGroup({ groupID: targetID });
        navigate(`/conversations/${encodeURIComponent(openedConversation.conversationID)}`);
      } catch {
        onError(readChatPageError(cause));
      }
    }
  }, [conversationHref, conversationID, navigate, onError, sync]);

  /** 引用点击只使用 canonical client identity 构造定位 URL。 */
  const openQuotedMessage = useCallback((message: Pick<Message, 'clientMsgID'>) => {
    // targetURL 对空消息身份保持 fail-closed。
    const targetURL = buildChatMessageFocusURL(conversationID, message.clientMsgID);
    if (targetURL) navigate(targetURL);
  }, [conversationID, navigate]);

  /** 单聊关系提示只进入当前对端的真实好友申请页。 */
  const openDirectContactApplication = useCallback(() => {
    if (conversation?.type !== 'single' || !conversation.targetID) return;
    navigate(`/contacts/users/${encodeURIComponent(conversation.targetID)}/add`);
  }, [conversation, navigate]);

  /** 自定义表情管理继续使用当前会话的既有子 route。 */
  const openCustomEmojiManager = useCallback(() => {
    navigate(`${conversationHref}/emojis`);
  }, [conversationHref, navigate]);

  return {
    openProfile,
    openGroupApplications,
    openGroupAnnouncement,
    openCard,
    openQuotedMessage,
    openDirectContactApplication,
    openCustomEmojiManager,
  };
}
