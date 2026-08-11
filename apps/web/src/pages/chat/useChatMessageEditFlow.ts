import { useState } from 'react';
import {
  canEditWebIMTextMessage,
  type Message,
  type PresetEmojiDocument,
  type WebIMSync,
} from '@im28/im-sdk/web';

/** 编辑 flow 只依赖 shared facade 和页面既有 operation owner。 */
interface UseChatMessageEditFlowOptions {
  readonly conversationID: string;
  readonly sync: WebIMSync | null;
  readonly runMessageOperation: (
    operation: (activeSync: WebIMSync) => Promise<void>,
  ) => Promise<void>;
  readonly onError: (message: string | null) => void;
}

/** 管理单条编辑态并只在真实 SDK mutation 完成后退出。 */
export function useChatMessageEditFlow({
  conversationID,
  sync,
  runMessageOperation,
  onError,
}: UseChatMessageEditFlowOptions) {
  // editingMessage 只保存当前页面缓存实体，不跨路由持久化。
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);

  /** 进入编辑态前再次执行 shared capability guard。 */
  function beginEdit(message: Message) {
    if (!canEditWebIMTextMessage(message)) {
      onError('当前消息暂不支持编辑');
      return;
    }
    setEditingMessage(message);
  }

  /** 取消编辑只清理瞬时 UI，不修改消息缓存。 */
  function cancelEdit() {
    setEditingMessage(null);
  }

  /** 提交最终文档，并用返回值决定 composer 是否清空。 */
  async function submitEdit(
    message: Message,
    document: PresetEmojiDocument,
  ): Promise<boolean> {
    if (!sync || message.clientMsgID !== editingMessage?.clientMsgID) return false;
    // completed 只能由真实 facade resolve 后置为 true。
    let completed = false;
    await runMessageOperation(async activeSync => {
      await activeSync.messages.editText({
        conversationID,
        clientMsgID: message.clientMsgID,
        text: document.text,
        entities: document.entities,
      });
      completed = true;
    });
    if (completed) setEditingMessage(null);
    return completed;
  }

  return { editingMessage, beginEdit, cancelEdit, submitEdit };
}
