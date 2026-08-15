import type { CSSProperties } from 'react';

import {
  getRNAvatarGradient,
  getRNAvatarInitial,
} from '../../components/rn-avatar-view.js';
import type { ChatMessageView } from './chat-message-view.js';

/** 名片正文只接收已归一化的消息展示模型和页面动作。 */
interface ChatCardMessageContentProps {
  readonly view: ChatMessageView;
  readonly onOpen?: (view: ChatMessageView) => void;
}

/** 使用真实身份快照呈现用户或群名片。 */
export function ChatCardMessageContent({
  view,
  onOpen,
}: ChatCardMessageContentProps) {
  /** avatarStyle 以真实卡片身份生成无图片时的 RN fallback。 */
  const avatarStyle = {
    '--chat-card-avatar-gradient': getRNAvatarGradient(view.detail || view.text),
  } as CSSProperties;
  return (
    <button
      className="rn-chat-card-content"
      type="button"
      aria-label={view.cardKind === 'group'
        ? `查看${view.text}的群聊卡片`
        : `查看${view.text}的个人资料`}
      disabled={!view.cardTargetID || !onOpen}
      onClick={() => onOpen?.(view)}
    >
      <span className="rn-chat-card-avatar" style={avatarStyle}>
        {getRNAvatarInitial(view.text)}
        {view.mediaURL ? <img src={view.mediaURL} alt="" /> : null}
      </span>
      <span><strong>{view.text}</strong>{view.detail ? <small>{view.detail}</small> : null}</span>
    </button>
  );
}
