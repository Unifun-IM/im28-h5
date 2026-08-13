import type { CSSProperties } from 'react';
import type { WebIMGroupMember } from '@im28/im-sdk/web';

import {
  getRNAvatarGradient,
  getRNAvatarInitial,
} from '../../components/rn-avatar-view.js';
import { ChatSenderAvatarAction } from './ChatSenderAvatarAction.js';
import {
  buildChatGroupMemberProfileLocation,
  type ChatGroupSenderView,
} from './chat-group-message-view.js';

/** 群消息发送人头像只接收已解析的成员视图和稳定聊天身份。 */
interface ChatGroupSenderAvatarProps {
  readonly conversationID: string;
  readonly senderView: ChatGroupSenderView;
  readonly senderMember?: WebIMGroupMember;
  readonly onMention: (member: WebIMGroupMember) => void;
}

/** 统一呈现群发送人头像、资料入口和可用成员的长按提及。 */
export function ChatGroupSenderAvatar({
  conversationID,
  senderView,
  senderMember,
  onMention,
}: ChatGroupSenderAvatarProps) {
  // avatarStyle 为稳定 sender ID 生成 RN fallback 颜色。
  const avatarStyle = {
    '--chat-sender-avatar-gradient': getRNAvatarGradient(senderView.userID),
  } as CSSProperties;
  // location 只携带资料页重新校验群上下文所需的稳定身份。
  const location = buildChatGroupMemberProfileLocation(
    conversationID,
    senderView.userID,
  );
  // initial 在图片缺失或加载失败时保持 RN 首字投影。
  const initial = getRNAvatarInitial(senderView.displayName);
  if (!location) {
    return (
      <span className="rn-chat-sender-avatar" style={avatarStyle}>
        {initial}
      </span>
    );
  }
  return (
    <ChatSenderAvatarAction
      location={location}
      displayName={senderView.displayName}
      style={avatarStyle}
      {...(senderMember ? { onMention: () => onMention(senderMember) } : {})}
    >
      {initial}
      {senderView.avatarURL ? (
        <img
          src={senderView.avatarURL}
          alt=""
          onError={event => { event.currentTarget.hidden = true; }}
        />
      ) : null}
    </ChatSenderAvatarAction>
  );
}
