import { useCallback, useEffect, useState } from 'react';
import {
  IM_DIRECT_CHAT_RELATIONSHIP_RECOVERING_PRESENTATION,
  IM_DIRECT_CHAT_RELATIONSHIP_UNRESOLVED_PRESENTATION,
  isIMFriendRelationshipSendError,
  resolveIMDirectChatRelationshipPresentation,
  type Conversation,
  type IMDirectChatRelationshipPresentation,
  type WebIMSync,
} from '@im28/im-sdk/web';

/** 单聊关系 hook 对页面公开的稳定状态与发送错误入口。 */
interface ChatDirectRelationshipController {
  readonly presentation: IMDirectChatRelationshipPresentation;
  markStrangerFromSendError(cause: unknown): boolean;
}

/** 当前路由单聊关系的局部投影身份。 */
interface ChatDirectRelationshipState {
  readonly peerUserID: string;
  readonly presentation: IMDirectChatRelationshipPresentation;
}

/** 非单聊不施加关系限制或消息列表提示。 */
const EMPTY_CHAT_DIRECT_RELATIONSHIP_STATE: ChatDirectRelationshipState = {
  peerUserID: '',
  presentation: resolveIMDirectChatRelationshipPresentation({
    relationship: 'self',
    blockedByMe: false,
  }),
};

/** 从共享资料与黑名单 owner 恢复单聊关系，并收敛发送时的关系失效错误。 */
export function useChatDirectRelationship(
  conversation: Conversation | null,
  sync: WebIMSync | null,
  relationshipVersion: number,
  onError: (cause: unknown) => void,
): ChatDirectRelationshipController {
  /** state 只保存当前 route 的页面投影，不复制 Gateway 或数据库事实。 */
  const [state, setState] = useState<ChatDirectRelationshipState>(
    EMPTY_CHAT_DIRECT_RELATIONSHIP_STATE,
  );
  /** isSingle 标记当前真实会话是否需要单聊关系门禁。 */
  const isSingle = conversation?.type === 'single';
  /** peerUserID 只使用 canonical conversation target identity。 */
  const peerUserID = isSingle ? conversation.targetID.trim() : '';

  useEffect(() => {
    if (!sync || !peerUserID) {
      setState(EMPTY_CHAT_DIRECT_RELATIONSHIP_STATE);
      return;
    }
    /** active 阻止路由切换后的旧关系请求覆盖新会话。 */
    let active = true;
    setState(current => current.peerUserID === peerUserID
      ? current
      : {
          peerUserID,
          presentation: IM_DIRECT_CHAT_RELATIONSHIP_RECOVERING_PRESENTATION,
        });
    void sync.directChatRelationship.get(peerUserID)
      .then(presentation => {
        if (active) setState({ peerUserID, presentation });
      })
      .catch(cause => {
        if (!active) return;
        setState(current => current.peerUserID === peerUserID &&
          current.presentation.status !== 'recovering'
          ? current
          : {
              peerUserID,
              presentation: IM_DIRECT_CHAT_RELATIONSHIP_UNRESOLVED_PRESENTATION,
            });
        onError(cause);
      });
    return () => { active = false; };
  }, [onError, peerUserID, relationshipVersion, sync]);

  /** 将真实发送关系错误降级为 RN 同语义的陌生人提示。 */
  const markStrangerFromSendError = useCallback((cause: unknown): boolean => {
    if (!peerUserID || !isIMFriendRelationshipSendError(cause)) return false;
    setState({
      peerUserID,
      presentation: resolveIMDirectChatRelationshipPresentation({
        relationship: 'stranger',
        blockedByMe: false,
      }),
    });
    return true;
  }, [peerUserID]);

  if (!peerUserID) {
    return {
      presentation: EMPTY_CHAT_DIRECT_RELATIONSHIP_STATE.presentation,
      markStrangerFromSendError,
    };
  }
  if (state.peerUserID !== peerUserID) {
    return {
      presentation: IM_DIRECT_CHAT_RELATIONSHIP_RECOVERING_PRESENTATION,
      markStrangerFromSendError,
    };
  }
  return { presentation: state.presentation, markStrangerFromSendError };
}
