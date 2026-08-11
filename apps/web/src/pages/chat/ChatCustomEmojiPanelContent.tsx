import { useEffect, useMemo, useState } from 'react';
import type { CustomEmoji } from '@im28/im-sdk/web';

import plusIconURL from '../../assets/rn/assets/icons/imm28/plus.regular.svg';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';
import {
  loadRecentChatCustomEmojiIDs,
  recordRecentChatCustomEmojiID,
} from './chat-custom-emoji-recent.js';
import { applyChatCustomEmojiOrder } from './chat-custom-emoji-order.js';

/** 自定义表情 tab 通过页面 facade 读取和发送共享 SDK 实体。 */
interface ChatCustomEmojiPanelContentProps {
  readonly disabled: boolean;
  readonly loadCached: () => Promise<readonly CustomEmoji[]>;
  readonly sync: () => Promise<readonly CustomEmoji[]>;
  readonly onSend: (emoji: CustomEmoji) => Promise<boolean>;
  readonly onManage: () => void;
  readonly onError: (message: string) => void;
}

/** 呈现 RN 五列常用与所有自定义表情，并执行 cache-first 刷新。 */
export function ChatCustomEmojiPanelContent({
  disabled,
  loadCached,
  sync,
  onSend,
  onManage,
  onError,
}: ChatCustomEmojiPanelContentProps) {
  // emojis 始终来自共享 SDK 当前账号 SQLite 或远端同步结果。
  const [emojis, setEmojis] = useState<readonly CustomEmoji[]>([]);
  // recentEmojiIDs 只保存非敏感稳定 ID 的浏览器偏好。
  const [recentEmojiIDs, setRecentEmojiIDs] = useState<readonly string[]>(() =>
    loadRecentChatCustomEmojiIDs(),
  );
  // syncing 控制加载状态和重复点击。
  const [syncing, setSyncing] = useState(true);
  // recentEmojis 按 MRU 顺序关联当前远端事实列表。
  const recentEmojis = useMemo(() => {
    // emojiByID 避免常用区对完整列表反复扫描。
    const emojiByID = new Map(emojis.map(emoji => [emoji.emojiID, emoji]));
    return recentEmojiIDs
      .map(emojiID => emojiByID.get(emojiID))
      .filter((emoji): emoji is CustomEmoji => Boolean(emoji));
  }, [emojis, recentEmojiIDs]);

  useEffect(() => {
    // active 阻止切换 tab 后旧异步结果回写。
    let active = true;
    setSyncing(true);
    void (async () => {
      try {
        // cached 先呈现当前账号 SQLite 快照。
        const cached = applyChatCustomEmojiOrder(await loadCached());
        if (active) setEmojis(cached);
        // remote 成功后由 SDK 原子替换并返回新快照。
        const remote = applyChatCustomEmojiOrder(await sync());
        if (active) setEmojis(remote);
      } catch (cause) {
        if (active) onError(readCustomEmojiError(cause));
      } finally {
        if (active) setSyncing(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [loadCached, onError, sync]);

  /** 仅在 SDK 确认发送成功后更新常用顺序。 */
  async function handleSend(emoji: CustomEmoji) {
    if (disabled || syncing) return;
    // sent 区分真实发送成功与页面已处理的失败结果。
    const sent = await onSend(emoji);
    if (sent) {
      setRecentEmojiIDs(recordRecentChatCustomEmojiID(emoji.emojiID));
    }
  }

  return (
    <div className="rn-chat-custom-emoji-content">
      <CustomEmojiSection
        title="常用表情"
        emojis={recentEmojis}
        showWhenEmpty
        showAddButton
        disabled={disabled || syncing}
        onPress={handleSend}
        onManage={onManage}
      />
      <CustomEmojiSection
        title="所有表情"
        emojis={emojis}
        disabled={disabled || syncing}
        onPress={handleSend}
      />
      {syncing ? (
        <span className="rn-chat-custom-emoji-loading" role="status">
          正在同步
        </span>
      ) : !emojis.length ? (
        <p className="rn-chat-custom-emoji-empty">暂无自定义表情</p>
      ) : null}
    </div>
  );
}

/** 呈现一个 RN 五列正方形自定义表情区域。 */
function CustomEmojiSection({
  title,
  emojis,
  disabled,
  onPress,
  showWhenEmpty = false,
  showAddButton = false,
  onManage,
}: {
  readonly title: string;
  readonly emojis: readonly CustomEmoji[];
  readonly disabled: boolean;
  readonly onPress: (emoji: CustomEmoji) => void;
  readonly showWhenEmpty?: boolean;
  readonly showAddButton?: boolean;
  readonly onManage?: () => void;
}) {
  if (!emojis.length && !showWhenEmpty) return null;
  return (
    <section className="rn-chat-emoji-section">
      <h2>{title}</h2>
      <div className="rn-chat-custom-emoji-grid">
        {showAddButton && onManage ? (
          <button
            className="rn-chat-custom-emoji-add"
            type="button"
            aria-label="添加自定义表情"
            disabled={disabled}
            onClick={onManage}
          >
            <RNAssetIcon assetURL={plusIconURL} />
          </button>
        ) : null}
        {emojis.map(emoji => (
          <button
            key={emoji.emojiID}
            type="button"
            aria-label="发送自定义表情"
            disabled={disabled}
            onClick={() => onPress(emoji)}
          >
            <img src={emoji.url} alt="" draggable="false" />
          </button>
        ))}
      </div>
    </section>
  );
}

/** 将自定义表情加载异常转换为不泄露内部结构的页面文案。 */
function readCustomEmojiError(cause: unknown): string {
  return cause instanceof Error && cause.message
    ? cause.message
    : '自定义表情同步失败';
}
