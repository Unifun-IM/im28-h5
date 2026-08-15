import { useCallback, useState } from 'react';
import type { Message, WebIMSync } from '@im28/im-sdk/web';

import { readChatPageError } from './chat-page-helpers.js';

/** 聊天页消息 operation 接收 shared facade 与页面 cache 回写边界。 */
interface UseChatPageMessageOperationsOptions {
  readonly conversationID: string;
  readonly messageCount: number;
  readonly sync: WebIMSync | null;
  readonly onMessagesReloaded: (messages: readonly Message[]) => void;
  readonly onSendError: (cause: unknown) => void;
  readonly onError: (message: string | null) => void;
}

/** 消息 operation 保持现有 shared facade 回调契约。 */
export type ChatPageMessageOperation = (activeSync: WebIMSync) => Promise<void>;

/** 统一拥有聊天页消息 mutation 的 busy、错误归一化与 SQLite 回读。 */
export function useChatPageMessageOperations({
  conversationID,
  messageCount,
  sync,
  onMessagesReloaded,
  onSendError,
  onError,
}: UseChatPageMessageOperationsOptions) {
  // sending 阻止 Composer 和附件动作重复提交同一 operation。
  const [sending, setSending] = useState(false);

  /** 执行 shared message operation，并在成功或失败后恢复 SQLite 权威窗口。 */
  const runMessageOperation = useCallback(async (
    operation: ChatPageMessageOperation,
  ): Promise<void> => {
    if (!sync || sending) return;
    setSending(true);
    onError(null);
    try {
      await operation(sync);
    } catch (cause) {
      onSendError(cause);
      onError(readChatPageError(cause));
    } finally {
      try {
        // cached 包含 facade 持久化的 sent 或 failed 消息状态。
        const cached = await sync.messages.getCachedHistory({
          conversationID,
          limit: Math.max(50, messageCount),
        });
        onMessagesReloaded(cached);
      } catch (cause) {
        onError(readChatPageError(cause));
      } finally {
        setSending(false);
      }
    }
  }, [conversationID, messageCount, onError, onMessagesReloaded, onSendError, sending, sync]);

  /** 为 Composer 提供明确成功结果，不扩大其他消息 hooks 的旧返回契约。 */
  const runComposerMessageOperation = useCallback(async (
    operation: ChatPageMessageOperation,
  ): Promise<boolean> => {
    // completed 只在 shared operation 没有抛错时置为真。
    let completed = false;
    await runMessageOperation(async activeSync => {
      await operation(activeSync);
      completed = true;
    });
    return completed;
  }, [runMessageOperation]);

  return { sending, runMessageOperation, runComposerMessageOperation };
}
