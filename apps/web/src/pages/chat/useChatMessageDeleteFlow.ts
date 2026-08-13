import { useEffect, useMemo, useState } from 'react';
import type {
  Conversation,
  Message,
  WebIMDeleteMessagesResult,
  WebIMJoinedGroup,
  WebIMMessageDeleteScope,
  WebIMSync,
} from '@im28/im-sdk/web';

import {
  canDeleteChatMessagesForAll,
  getChatDeleteForAllLabel,
  getChatDeleteResultNotice,
} from './chat-message-delete-view.js';

/** 删除 flow 只接收页面可见身份和既有 operation owner。 */
interface UseChatMessageDeleteFlowOptions {
  readonly conversation: Conversation | null;
  readonly messages: readonly Message[];
  readonly sync: WebIMSync | null;
  readonly runMessageOperation: (
    operation: (activeSync: WebIMSync) => Promise<void>,
  ) => Promise<void>;
  readonly onError: (message: string | null) => void;
  readonly onNotice: (message: string | null) => void;
  readonly onDeleteSucceeded: (deletedClientMsgIDs: readonly string[]) => void;
}

/** 管理 RN 删除确认层、群权限读取和 shared facade 提交。 */
export function useChatMessageDeleteFlow({
  conversation,
  messages,
  sync,
  runMessageOperation,
  onError,
  onNotice,
  onDeleteSucceeded,
}: UseChatMessageDeleteFlowOptions) {
  // pendingMessages 只保存当前页面真实缓存实体，不跨路由持久化。
  const [pendingMessages, setPendingMessages] = useState<readonly Message[]>([]);
  // afterDelete 保存多选完成后的退出动作。
  const [afterDelete, setAfterDelete] = useState<(() => void) | null>(null);
  // joinedGroup 只用于映射 RN owner/admin 清理权限。
  const [joinedGroup, setJoinedGroup] = useState<WebIMJoinedGroup | null>(null);
  // confirming 阻止确认层重复提交真实 mutation。
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (!sync || conversation?.type !== 'group') {
      setJoinedGroup(null);
      return;
    }
    // active 阻止切换会话后旧群缓存回写。
    let active = true;
    void sync.groups.listCached()
      .then(groups => {
        if (!active) return;
        // matched 同时兼容 group ID 和 Gateway conversation ID。
        const matched = groups.find(group =>
          group.groupID === conversation.targetID ||
          group.conversationID === conversation.conversationID,
        );
        setJoinedGroup(matched ?? null);
      })
      .catch(() => {
        if (active) setJoinedGroup(null);
      });
    return () => { active = false; };
  }, [conversation, sync]);

  /** 打开单条或多条确认层，并拒绝过期的可见身份。 */
  function requestDelete(clientMsgIDs: readonly string[], onDeleted?: () => void) {
    // requestedIDs 保持调用顺序并去掉空值和重复值。
    const requestedIDs = Array.from(
      new Set(clientMsgIDs.map(clientMsgID => clientMsgID.trim()).filter(Boolean)),
    );
    // messageByID 只来自当前页面缓存窗口。
    const messageByID = new Map(messages.map(message => [message.clientMsgID, message]));
    // selected 必须完整对应当前可见消息。
    const selected = requestedIDs
      .map(clientMsgID => messageByID.get(clientMsgID))
      .filter((message): message is Message => Boolean(message));
    if (!selected.length || selected.length !== requestedIDs.length) {
      onError('部分消息已不在当前聊天记录中');
      return;
    }
    setPendingMessages(selected);
    setAfterDelete(() => onDeleted ?? null);
  }

  /** 关闭未提交的删除确认层。 */
  function cancelDelete() {
    if (confirming) return;
    setPendingMessages([]);
    setAfterDelete(null);
  }

  /** 调用 shared delete，并依据真实逐项结果关闭确认层。 */
  async function confirmDelete(scope: WebIMMessageDeleteScope): Promise<void> {
    if (!sync || !conversation || !pendingMessages.length || confirming) return;
    if (scope === 'all' && !canDeleteForAll) {
      onError('当前消息不支持为所有人删除');
      return;
    }
    setConfirming(true);
    onError(null);
    // result 只有 facade 正常返回逐项结果后才成立。
    let result: WebIMDeleteMessagesResult | null = null;
    await runMessageOperation(async activeSync => {
      result = await activeSync.messages.delete({
        conversationID: conversation.conversationID,
        clientMsgIDs: pendingMessages.map(message => message.clientMsgID),
        scope,
      });
      if (result.deletedClientMsgIDs.length) {
        onDeleteSucceeded(result.deletedClientMsgIDs);
      }
    });
    setConfirming(false);
    if (!result) return;
    onNotice(getChatDeleteResultNotice(result));
    // completedAfterDelete 在清理 state 前冻结回调引用。
    const completedAfterDelete = afterDelete;
    setPendingMessages([]);
    setAfterDelete(null);
    completedAfterDelete?.();
  }

  // canDeleteForAll 与确认层当前消息集合同步计算。
  const canDeleteForAll = useMemo(
    () => canDeleteChatMessagesForAll(conversation, pendingMessages, joinedGroup),
    [conversation, joinedGroup, pendingMessages],
  );
  return {
    pendingMessages,
    confirming,
    canDeleteForAll,
    deleteForAllLabel: getChatDeleteForAllLabel(conversation),
    requestDelete,
    cancelDelete,
    confirmDelete,
  };
}
