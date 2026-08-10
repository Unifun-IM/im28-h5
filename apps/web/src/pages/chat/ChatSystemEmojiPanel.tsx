import { useState } from 'react';

import deleteKeyIconURL from '../../assets/rn/assets/icons/imm28/delete-key.svg';
import emojiIconURL from '../../assets/rn/assets/icons/imm28/emoji.regular.svg';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';
import {
  loadRecentChatSystemEmojis,
  recordRecentChatSystemEmoji,
} from './chat-system-emoji-recent.js';
import { CHAT_SYSTEM_UNICODE_EMOJIS } from './chat-system-emojis.js';
import './chat-system-emoji-panel.css';

/** 系统表情面板只暴露草稿插入和退格操作。 */
interface ChatSystemEmojiPanelProps {
  readonly onInsert: (emoji: string) => void;
  readonly onDeleteBackward: () => void;
}

/** 呈现 RN 第一套 Unicode 表情、最近使用和删除键。 */
export function ChatSystemEmojiPanel({
  onInsert,
  onDeleteBackward,
}: ChatSystemEmojiPanelProps) {
  // recentEmojis 在面板挂载时从非敏感浏览器 preference 恢复。
  const [recentEmojis, setRecentEmojis] = useState<readonly string[]>(() =>
    loadRecentChatSystemEmojis(),
  );

  /** 插入当前表情并同步 MRU 顺序。 */
  function handleEmojiPress(emoji: string) {
    onInsert(emoji);
    setRecentEmojis(recordRecentChatSystemEmoji(emoji));
  }

  return (
    <section className="rn-chat-emoji-panel" aria-label="表情面板">
      <div className="rn-chat-emoji-tab-bar" role="tablist" aria-label="表情分类">
        <button
          className="rn-chat-emoji-tab is-active"
          type="button"
          role="tab"
          aria-label="系统表情"
          aria-selected="true"
          title="系统表情"
        >
          <RNAssetIcon assetURL={emojiIconURL} />
        </button>
      </div>
      <div className="rn-chat-emoji-scroll">
        <SystemEmojiSection
          title="最近使用"
          emojis={recentEmojis}
          onPress={handleEmojiPress}
        />
        <SystemEmojiSection
          title="全部表情"
          emojis={CHAT_SYSTEM_UNICODE_EMOJIS}
          onPress={handleEmojiPress}
        />
      </div>
      <button
        className="rn-chat-emoji-delete"
        type="button"
        aria-label="删除光标前内容"
        title="删除"
        onClick={onDeleteBackward}
      >
        <RNAssetIcon assetURL={deleteKeyIconURL} />
      </button>
    </section>
  );
}

/** 呈现一个带标题的 RN 七列表情区域。 */
function SystemEmojiSection({
  title,
  emojis,
  onPress,
}: {
  readonly title: string;
  readonly emojis: readonly string[];
  readonly onPress: (emoji: string) => void;
}) {
  if (!emojis.length) return null;
  return (
    <section className="rn-chat-emoji-section">
      <h2>{title}</h2>
      <div className="rn-chat-emoji-grid">
        {emojis.map((emoji, index) => (
          <button
            key={`${emoji}-${index}`}
            type="button"
            aria-label={`插入表情${emoji}`}
            onClick={() => onPress(emoji)}
          >
            {emoji}
          </button>
        ))}
      </div>
    </section>
  );
}
