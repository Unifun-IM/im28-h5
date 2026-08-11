import type { CSSProperties } from 'react';

import { getRNAvatarGradient } from '../../components/rn-avatar-view.js';
import type { ChatMentionPickerItem } from './chat-mention-composer.js';
import './chat-mention.css';

/** RN 提及候选面板参数。 */
interface ChatMentionPickerPanelProps {
  readonly items: readonly ChatMentionPickerItem[];
  readonly onSelect: (item: ChatMentionPickerItem) => void;
}

/** 呈现所有人优先、成员紧随的 RN 候选列表。 */
export function ChatMentionPickerPanel({ items, onSelect }: ChatMentionPickerPanelProps) {
  if (!items.length) return null;
  return (
    <section className="rn-chat-mention-panel" aria-label="@成员选择面板">
      {items.map(item => {
        /** avatarStyle 为无头像成员提供稳定 RN 渐变。 */
        const avatarStyle = {
          '--chat-mention-avatar-gradient': getRNAvatarGradient(item.key),
        } as CSSProperties;
        return (
          <button key={item.key} type="button" onClick={() => onSelect(item)}>
            <span className={`rn-chat-mention-avatar${item.mention.type === 'all' ? ' is-all' : ''}`} style={avatarStyle}>
              {item.avatarURL ? <img src={item.avatarURL} alt="" /> : item.mention.type === 'all' ? '@' : item.label.slice(0, 1)}
            </span>
            <span className="rn-chat-mention-copy"><strong>{item.label}</strong><small>{item.description}</small></span>
          </button>
        );
      })}
    </section>
  );
}
