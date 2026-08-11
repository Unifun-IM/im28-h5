import { useCallback, useState } from 'react';
import type { CustomEmoji, WebIMSync } from '@im28/im-sdk/web';

/** 自定义表情页面 action 复用聊天页唯一消息操作状态机。 */
interface UseChatCustomEmojiActionsOptions {
  readonly conversationID: string;
  readonly sync: WebIMSync | null;
  readonly runMessageOperation: (
    operation: (activeSync: WebIMSync) => Promise<void>,
  ) => Promise<void>;
  readonly onError: (message: string | null) => void;
  readonly onNotice: (message: string | null) => void;
}

/** 提供稳定 cache/sync callback 和 type 115 发送编排。 */
export function useChatCustomEmojiActions({
  conversationID,
  sync,
  runMessageOperation,
  onError,
  onNotice,
}: UseChatCustomEmojiActionsOptions) {
  // mutating 锁定消息收藏 mutation 的重复提交。
  const [mutating, setMutating] = useState(false);
  /** 从当前认证账号 SQLite 读取自定义表情快照。 */
  const loadCached = useCallback(
    () => sync?.customEmojis.listCached() ?? Promise.resolve([]),
    [sync],
  );
  /** 使用共享 Gateway/Repository 刷新完整表情快照。 */
  const refresh = useCallback(
    () => sync?.customEmojis.sync() ?? Promise.resolve([]),
    [sync],
  );
  /** 发送 type 115，并向常用区返回真实成功结果。 */
  const send = useCallback(
    async (emoji: CustomEmoji): Promise<boolean> => {
      // sent 只在 SDK sendCustomEmoji 正常完成后置为 true。
      let sent = false;
      await runMessageOperation(async activeSync => {
        await activeSync.messages.sendCustomEmoji({
          conversationID,
          emojiID: emoji.emojiID,
          url: emoji.url,
        });
        sent = true;
      });
      return sent;
    },
    [conversationID, runMessageOperation],
  );
  /** 只在 shared add mutation 成功后展示收藏反馈。 */
  const add = useCallback(
    async (emojiID: string): Promise<boolean> => {
      if (!sync || mutating) return false;
      setMutating(true);
      onError(null);
      onNotice(null);
      try {
        await sync.customEmojis.add(emojiID);
        onNotice('已添加到表情');
        return true;
      } catch (cause) {
        // message 不暴露请求体或本地路径。
        const message = cause instanceof Error && cause.message
          ? cause.message
          : '添加表情失败';
        onError(message);
        return false;
      } finally {
        setMutating(false);
      }
    },
    [mutating, onError, onNotice, sync],
  );
  return { loadCached, refresh, send, add, mutating };
}
