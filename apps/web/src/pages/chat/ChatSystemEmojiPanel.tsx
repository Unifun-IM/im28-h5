import { useMemo, useState } from 'react';
import type { CustomEmoji, PresetEmojiDescriptor } from '@im28/im-sdk/web';

import deleteKeyIconURL from '../../assets/rn/assets/icons/imm28/delete-key.svg';
import emojiIconURL from '../../assets/rn/assets/icons/imm28/emoji.regular.svg';
import heartIconURL from '../../assets/rn/assets/icons/imm28/heart.dynamic.svg';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';
import { ChatCustomEmojiPanelContent } from './ChatCustomEmojiPanelContent.js';
import {
  IllustratedEmojiSection,
  SystemEmojiSection,
} from './ChatEmojiSections.js';
import {
  loadRecentChatSystemEmojis,
  recordRecentChatSystemEmoji,
} from './chat-system-emoji-recent.js';
import {
  loadRecentChatIllustratedEmojiIDs,
  recordRecentChatIllustratedEmojiID,
} from './chat-illustrated-emoji-recent.js';
import {
  ILLUSTRATED_PRESET_EMOJI_ASSETS,
  type IllustratedPresetEmojiAsset,
} from './illustrated-preset-emoji-assets.js';
import { CHAT_SYSTEM_UNICODE_EMOJIS } from './chat-system-emojis.js';
import './chat-system-emoji-panel.css';

/** 系统表情面板只暴露草稿插入和退格操作。 */
interface ChatSystemEmojiPanelProps {
  readonly onInsert: (emoji: string) => void;
  readonly onInsertPresetEmoji: (emoji: PresetEmojiDescriptor) => void;
  readonly onDeleteBackward: () => void;
  readonly disabled: boolean;
  readonly loadCachedCustomEmojis: () => Promise<readonly CustomEmoji[]>;
  readonly syncCustomEmojis: () => Promise<readonly CustomEmoji[]>;
  readonly onSendCustomEmoji: (emoji: CustomEmoji) => Promise<boolean>;
  readonly onManageCustomEmojis: () => void;
  readonly onError: (message: string) => void;
}

/** 三个 RN 表情 tab 使用稳定身份隔离草稿插入和直接发送语义。 */
type ChatEmojiPanelTab = 'system' | 'illustrated' | 'custom';

/** 呈现 RN 第一套 Unicode 表情、最近使用和删除键。 */
export function ChatSystemEmojiPanel({
  onInsert,
  onInsertPresetEmoji,
  onDeleteBackward,
  disabled,
  loadCachedCustomEmojis,
  syncCustomEmojis,
  onSendCustomEmoji,
  onManageCustomEmojis,
  onError,
}: ChatSystemEmojiPanelProps) {
  /** activeTab 默认保留 RN 系统表情入口。 */
  const [activeTab, setActiveTab] = useState<ChatEmojiPanelTab>('system');
  // recentEmojis 在面板挂载时从非敏感浏览器 preference 恢复。
  const [recentEmojis, setRecentEmojis] = useState<readonly string[]>(() =>
    loadRecentChatSystemEmojis(),
  );
  /** recentIllustratedEmojiIDs 按稳定 presetID 恢复独立 MRU。 */
  const [recentIllustratedEmojiIDs, setRecentIllustratedEmojiIDs] = useState<
    readonly string[]
  >(() => loadRecentChatIllustratedEmojiIDs());
  /** recentIllustratedEmojis 忽略已从当前资源包移除的旧身份。 */
  const recentIllustratedEmojis = useMemo(() => {
    /** emojiByID 保持最近使用顺序同时避免反复扫描 135 项。 */
    const emojiByID = new Map(
      ILLUSTRATED_PRESET_EMOJI_ASSETS.map(item => [item.presetID, item]),
    );
    return recentIllustratedEmojiIDs
      .map(presetID => emojiByID.get(presetID))
      .filter((item): item is IllustratedPresetEmojiAsset => Boolean(item));
  }, [recentIllustratedEmojiIDs]);

  /** 插入当前表情并同步 MRU 顺序。 */
  function handleEmojiPress(emoji: string) {
    onInsert(emoji);
    setRecentEmojis(recordRecentChatSystemEmoji(emoji));
  }

  /** 插入身份化插画表情并同步独立 MRU 顺序。 */
  function handleIllustratedEmojiPress(emoji: IllustratedPresetEmojiAsset) {
    onInsertPresetEmoji(emoji);
    setRecentIllustratedEmojiIDs(
      recordRecentChatIllustratedEmojiID(emoji.presetID),
    );
  }

  return (
    <section className="rn-chat-emoji-panel" aria-label="表情面板">
      <div className="rn-chat-emoji-tab-bar" role="tablist" aria-label="表情分类">
        <button
          className={`rn-chat-emoji-tab${activeTab === 'system' ? ' is-active' : ''}`}
          type="button"
          role="tab"
          aria-label="系统表情"
          aria-selected={activeTab === 'system'}
          title="系统表情"
          onClick={() => setActiveTab('system')}
        >
          <RNAssetIcon assetURL={emojiIconURL} />
        </button>
        <button
          className={`rn-chat-emoji-tab${activeTab === 'illustrated' ? ' is-active' : ''}`}
          type="button"
          role="tab"
          aria-label="插画表情"
          aria-selected={activeTab === 'illustrated'}
          title="插画表情"
          onClick={() => setActiveTab('illustrated')}
        >
          {ILLUSTRATED_PRESET_EMOJI_ASSETS[0]?.assetURL ? (
            <img
              className="rn-chat-emoji-tab-image"
              src={ILLUSTRATED_PRESET_EMOJI_ASSETS[0].assetURL}
              alt=""
            />
          ) : (
            <span aria-hidden="true">😎</span>
          )}
        </button>
        <button
          className={`rn-chat-emoji-tab${activeTab === 'custom' ? ' is-active' : ''}`}
          type="button"
          role="tab"
          aria-label="自定义表情"
          aria-selected={activeTab === 'custom'}
          title="自定义表情"
          onClick={() => setActiveTab('custom')}
        >
          <RNAssetIcon assetURL={heartIconURL} />
        </button>
      </div>
      <div className="rn-chat-emoji-scroll">
        {activeTab === 'system' ? (
          <>
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
          </>
        ) : activeTab === 'illustrated' ? (
          <>
            <IllustratedEmojiSection
              title="最近使用"
              emojis={recentIllustratedEmojis}
              onPress={handleIllustratedEmojiPress}
            />
            <IllustratedEmojiSection
              title="所有表情"
              emojis={ILLUSTRATED_PRESET_EMOJI_ASSETS}
              onPress={handleIllustratedEmojiPress}
            />
          </>
        ) : (
          <ChatCustomEmojiPanelContent
            disabled={disabled}
            loadCached={loadCachedCustomEmojis}
            sync={syncCustomEmojis}
            onSend={onSendCustomEmoji}
            onManage={onManageCustomEmojis}
            onError={onError}
          />
        )}
      </div>
      {activeTab !== 'custom' ? (
        <button
          className="rn-chat-emoji-delete"
          type="button"
          aria-label="删除光标前内容"
          title="删除"
          onClick={onDeleteBackward}
        >
          <RNAssetIcon assetURL={deleteKeyIconURL} />
        </button>
      ) : null}
    </section>
  );
}
