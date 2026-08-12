import { useRef, type CSSProperties, type MouseEvent, type PointerEvent } from 'react';
import type { WebIMConversationListItem } from '@im28/im-sdk/web';
import { Link } from 'react-router-dom';

import bellOffIconURL from '../../assets/rn/assets/icons/imm28/bell-off.solid.svg';
import pinIconURL from '../../assets/rn/assets/icons/imm28/pin.solid.svg';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';
import { PresetEmojiTextContent } from '../chat/PresetEmojiTextContent.js';
import {
  getRNAvatarGradient,
  getRNAvatarInitial,
} from '../../components/rn-avatar-view.js';
import {
  formatConversationListTime,
  formatConversationUnread,
  getConversationDisplayPreview,
  getConversationTitle,
} from './conversation-list-view.js';
import type { ConversationActionAnchor } from './ConversationActionMenu.js';

/** RN 会话行只接收 Web SDK 已组合的稳定缓存项。 */
interface ConversationRowProps {
  readonly item: WebIMConversationListItem;
  readonly currentUserID: string;
  readonly onOpenActions: (
    item: WebIMConversationListItem,
    anchor: ConversationActionAnchor,
  ) => void;
}

/** 渲染 RN 72px 会话行及其头像、摘要、时间和未读状态。 */
export function ConversationRow({ item, currentUserID, onOpenActions }: ConversationRowProps) {
  /** longPressTimerRef 保存 300ms RN 长按阈值定时器。 */
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** pointerStartRef 用于移动阈值取消长按。 */
  const pointerStartRef = useRef<{ readonly x: number; readonly y: number } | null>(null);
  /** didLongPressRef 阻止长按松手后继续进入会话。 */
  const didLongPressRef = useRef(false);
  // conversation 缩短模板内领域字段访问路径。
  const { conversation, latestMessage } = item;
  // title 使用 RN name -> target ID 回退语义。
  const title = getConversationTitle(conversation);
  // preview 已在纯 helper 中处理草稿和静音前缀。
  const preview = getConversationDisplayPreview(item, currentUserID);
  // unread 保证 badge 不出现负值或小数。
  const unread = Math.max(0, Math.trunc(conversation.unreadCount));
  /** manualUnreadOnly 对齐 RN 手动未读但服务端未读数为零的红点。 */
  const manualUnreadOnly = conversation.manualUnread === true && unread === 0;
  // avatarStyle 复用 RN fallback 渐变算法。
  const avatarStyle = {
    '--conversation-avatar-gradient': getRNAvatarGradient(
      conversation.targetID || title,
    ),
  } as CSSProperties;

  /** clearLongPress 清理尚未触发的定时器。 */
  function clearLongPress(): void {
    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    longPressTimerRef.current = null;
    pointerStartRef.current = null;
  }

  /** openActions 从真实行 DOM 生成稳定视口锚点。 */
  function openActions(element: HTMLElement): void {
    /** rect 只用于 H5 气泡定位，不进入业务状态。 */
    const rect = element.getBoundingClientRect();
    onOpenActions(item, {
      top: rect.top,
      bottom: rect.bottom,
      left: rect.left,
      right: rect.right,
    });
  }

  /** handlePointerDown 启动与 RN 相同的 300ms 长按识别。 */
  function handlePointerDown(event: PointerEvent<HTMLAnchorElement>): void {
    if (event.button !== 0) return;
    clearLongPress();
    didLongPressRef.current = false;
    pointerStartRef.current = { x: event.clientX, y: event.clientY };
    /** element 在定时器触发时仍是当前会话行。 */
    const element = event.currentTarget;
    longPressTimerRef.current = setTimeout(() => {
      didLongPressRef.current = true;
      longPressTimerRef.current = null;
      openActions(element);
    }, 300);
  }

  /** handlePointerMove 超过八像素时视为滚动而非长按。 */
  function handlePointerMove(event: PointerEvent<HTMLAnchorElement>): void {
    /** start 缺失表示没有待识别长按。 */
    const start = pointerStartRef.current;
    if (!start) return;
    if (Math.hypot(event.clientX - start.x, event.clientY - start.y) > 8) clearLongPress();
  }

  /** handleClick 消费长按后的合成点击。 */
  function handleClick(event: MouseEvent<HTMLAnchorElement>): void {
    if (!didLongPressRef.current) return;
    event.preventDefault();
    didLongPressRef.current = false;
  }

  return (
    <Link
      className={`rn-conversation-row${conversation.isPinned ? ' is-pinned' : ''}`}
      to={`/conversations/${encodeURIComponent(conversation.conversationID)}`}
      aria-label={`打开与${title}的会话`}
      aria-haspopup="menu"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={clearLongPress}
      onPointerCancel={clearLongPress}
      onPointerLeave={clearLongPress}
      onClick={handleClick}
      onContextMenu={event => {
        event.preventDefault();
        clearLongPress();
        openActions(event.currentTarget);
      }}
      onDragStart={event => event.preventDefault()}
    >
      <span className="rn-conversation-avatar" style={avatarStyle}>
        <span className="rn-conversation-avatar-fallback">
          {getRNAvatarInitial(title)}
        </span>
        {conversation.faceURL ? (
          <img
            src={conversation.faceURL}
            alt=""
            loading="lazy"
            onError={event => {
              event.currentTarget.hidden = true;
            }}
          />
        ) : null}
      </span>

      <span className="rn-conversation-row-body">
        <span className="rn-conversation-row-top">
          <strong>{title}</strong>
          {conversation.isPinned ? (
            <RNAssetIcon
              assetURL={pinIconURL}
              className="rn-conversation-pin"
            />
          ) : null}
          <time>
            {formatConversationListTime(
              latestMessage?.sendTime ?? conversation.updatedAt,
            )}
          </time>
        </span>
        <span className="rn-conversation-row-bottom">
          <span className="rn-conversation-preview">
            {preview.isDraft ? (
              <span className="rn-conversation-draft">[草稿]</span>
            ) : null}
            <PresetEmojiTextContent
              text={preview.text}
              entities={preview.entities}
              singleLine
            />
          </span>
          {conversation.isMuted ? (
            <RNAssetIcon
              assetURL={bellOffIconURL}
              className="rn-conversation-muted"
            />
          ) : null}
          {unread > 0 || manualUnreadOnly ? (
            conversation.isMuted || manualUnreadOnly ? (
              <span
                className="rn-conversation-unread-dot"
                aria-label={manualUnreadOnly ? '已标记未读' : `${unread} 条未读`}
              />
            ) : (
              <span
                className="rn-conversation-unread-badge"
                aria-label={`${unread} 条未读`}
              >
                {formatConversationUnread(unread)}
              </span>
            )
          ) : null}
        </span>
      </span>
    </Link>
  );
}
