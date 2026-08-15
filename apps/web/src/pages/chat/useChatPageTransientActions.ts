import { useCallback, useEffect, useState } from 'react';
import type { Conversation, Message, WebIMSync } from '@im28/im-sdk/web';

import type { ChatTargetPickerItem } from '../../components/chat-target-picker/index.js';
import type { WebIMStartOutgoingCallOptions } from '../../runtime/index.js';
import { getConversationTitle } from '../conversations/conversation-list-view.js';
import { toIMMessageCard } from './chat-card-picker.js';
import { readChatPageError } from './chat-page-helpers.js';
import type { ChatPageMessageOperation } from './useChatPageMessageOperations.js';

/** 通话选择状态只消费当前会话和全局通话 owner。 */
interface UseChatPageCallActionsOptions {
  readonly conversationID: string;
  readonly conversation: Conversation | null;
  readonly startOutgoingCall: (options: WebIMStartOutgoingCallOptions) => Promise<void>;
  readonly onError: (message: string | null) => void;
}

/** 名片选择状态只消费 shared 消息 operation。 */
interface UseChatPageCardActionsOptions {
  readonly conversationID: string;
  readonly sending: boolean;
  readonly runMessageOperation: (operation: ChatPageMessageOperation) => Promise<void>;
  readonly onSendingMessage: (message: Message) => void;
  readonly onError: (message: string | null) => void;
}

/** 聊天页通话与名片弹层只消费页面已确认的会话和 shared operation。 */
interface UseChatPageTransientActionsOptions extends
  UseChatPageCallActionsOptions,
  UseChatPageCardActionsOptions {}

/** 统一拥有单聊通话类型选择和正式呼出状态。 */
function useChatPageCallActions({
  conversationID,
  conversation,
  startOutgoingCall,
  onError,
}: UseChatPageCallActionsOptions) {
  // visible 只控制单聊语音或视频二次选择层。
  const [visible, setVisible] = useState(false);
  // starting 防止二次点击重复创建通话生命周期。
  const [starting, setStarting] = useState(false);
  useEffect(() => setVisible(false), [conversationID]);
  /** 打开通话类型选择前清除上一项页面错误。 */
  const open = useCallback(() => { onError(null); setVisible(true); }, [onError]);
  /** 关闭当前通话类型选择层。 */
  const close = useCallback(() => setVisible(false), []);
  /** 复用 canonical conversation 身份启动全局通话 owner。 */
  const start = useCallback(async (mediaType: 'audio' | 'video'): Promise<void> => {
    if (!conversation || conversation.type !== 'single' || starting) return;
    setVisible(false);
    setStarting(true);
    onError(null);
    try {
      await startOutgoingCall({
        conversationID: conversation.conversationID,
        peerName: getConversationTitle(conversation),
        peerAvatarURL: conversation.faceURL?.trim() || '',
        mediaType,
      });
    } catch (cause) {
      onError(readChatPageError(cause));
    } finally {
      setStarting(false);
    }
  }, [conversation, onError, startOutgoingCall, starting]);
  return { visible, starting, open, close, start };
}

/** 统一拥有 type108 名片单选和发送成功关闭语义。 */
function useChatPageCardActions({
  conversationID,
  sending,
  runMessageOperation,
  onSendingMessage,
  onError,
}: UseChatPageCardActionsOptions) {
  // visible 控制当前聊天唯一名片选择弹层。
  const [visible, setVisible] = useState(false);
  useEffect(() => setVisible(false), [conversationID]);
  /** 打开名片选择前清除上一项页面错误。 */
  const open = useCallback(() => { onError(null); setVisible(true); }, [onError]);
  /** 关闭当前名片选择层。 */
  const close = useCallback(() => setVisible(false), []);
  /** 单选目标只在 type108 经 Gateway 与 SQLite 完整成功后关闭。 */
  const send = useCallback(async (targets: readonly ChatTargetPickerItem[]): Promise<void> => {
    // target 只接受单选模式交付的第一个真实好友或群目标。
    const target = targets[0];
    if (!target || sending) return;
    // completed 防止失败 operation 提前关闭选择弹层。
    let completed = false;
    await runMessageOperation(async (activeSync: WebIMSync) => {
      await activeSync.messages.sendCard({
        conversationID,
        card: toIMMessageCard(target),
        onSending: onSendingMessage,
      });
      completed = true;
    });
    if (completed) setVisible(false);
  }, [conversationID, onSendingMessage, runMessageOperation, sending]);
  return { visible, open, close, send };
}

/** 组合聊天页通话选择与名片分享的独立瞬时 owner。 */
export function useChatPageTransientActions(options: UseChatPageTransientActionsOptions) {
  // callActions 只拥有通话选择与启动状态。
  const callActions = useChatPageCallActions(options);
  // cardActions 只拥有名片选择与发送状态。
  const cardActions = useChatPageCardActions(options);
  return {
    cardPickerVisible: cardActions.visible,
    callPickerVisible: callActions.visible,
    callStarting: callActions.starting,
    openCallPicker: callActions.open,
    closeCallPicker: callActions.close,
    openCardPicker: cardActions.open,
    closeCardPicker: cardActions.close,
    startCall: callActions.start,
    sendSelectedCard: cardActions.send,
  };
}
