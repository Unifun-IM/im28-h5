import { useRef, type CSSProperties, type MouseEvent, type PointerEvent } from 'react';
import type { WebIMJoinedGroup } from '@im28/im-sdk/web';

import {
  getRNAvatarGradient,
  getRNAvatarInitial,
} from '../../components/rn-avatar-view.js';
import {
  getJoinedGroupBadgeLabel,
  getJoinedGroupBadges,
  getJoinedGroupDescription,
} from './joined-group-view.js';
import type { JoinedGroupActionPoint } from './joined-group-actions-view.js';
import './joined-group-badges.css';

/** 我的群聊列表行参数。 */
interface JoinedGroupRowProps {
  readonly group: WebIMJoinedGroup;
  readonly opening: boolean;
  readonly onOpen: () => void;
  readonly onOpenActions: (group: WebIMJoinedGroup, point: JoinedGroupActionPoint) => void;
}

/** 渲染 RN 72px 群行、40px 头像、描述和身份标签。 */
export function JoinedGroupRow({
  group,
  opening,
  onOpen,
  onOpenActions,
}: JoinedGroupRowProps) {
  /** longPressTimerRef 保存与 RN 一致的 300ms 长按阈值。 */
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** pointerStartRef 用于列表滚动时取消长按。 */
  const pointerStartRef = useRef<JoinedGroupActionPoint | null>(null);
  /** didLongPressRef 阻止长按松手后继续打开群聊。 */
  const didLongPressRef = useRef(false);
  // avatarStyle 复用 RN 稳定头像渐变算法。
  const avatarStyle = {
    '--joined-group-avatar-gradient': getRNAvatarGradient(group.groupID),
  } as CSSProperties;
  // badges 复用 RN 创建者和群角色规则。
  const badges = getJoinedGroupBadges(group);
  // description 组合状态、人数和群 ID。
  const description = getJoinedGroupDescription(group);

  /** 清理未触发的长按定时器和按下点位。 */
  function clearLongPress(): void {
    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    longPressTimerRef.current = null;
    pointerStartRef.current = null;
  }

  /** 启动群行长按识别并冻结指针坐标。 */
  function handlePointerDown(event: PointerEvent<HTMLButtonElement>): void {
    if (event.button !== 0 || opening) return;
    clearLongPress();
    didLongPressRef.current = false;
    /** point 避免延迟回调读取已释放的 React 事件。 */
    const point = { x: event.clientX, y: event.clientY };
    pointerStartRef.current = point;
    longPressTimerRef.current = setTimeout(() => {
      didLongPressRef.current = true;
      longPressTimerRef.current = null;
      onOpenActions(group, point);
    }, 300);
  }

  /** 移动超过八像素时将手势交还列表滚动。 */
  function handlePointerMove(event: PointerEvent<HTMLButtonElement>): void {
    /** start 缺失表示当前没有待识别长按。 */
    const start = pointerStartRef.current;
    if (!start) return;
    if (Math.hypot(event.clientX - start.x, event.clientY - start.y) > 8) clearLongPress();
  }

  /** 消费长按结束后的浏览器合成点击。 */
  function handleClick(event: MouseEvent<HTMLButtonElement>): void {
    if (didLongPressRef.current) {
      event.preventDefault();
      didLongPressRef.current = false;
      return;
    }
    onOpen();
  }

  return (
    <button
      type="button"
      className="rn-joined-group-row"
      disabled={opening}
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
        onOpenActions(group, { x: event.clientX, y: event.clientY });
      }}
      aria-label={`打开群聊${group.name}`}
    >
      <span className="rn-joined-group-avatar" style={avatarStyle}>
        <span>{getRNAvatarInitial(group.name, '群')}</span>
        {group.avatarURL ? (
          <img
            src={group.avatarURL}
            alt=""
            loading="lazy"
            onError={event => { event.currentTarget.hidden = true; }}
          />
        ) : null}
      </span>
      <span className="rn-joined-group-row-body">
        <span className="rn-joined-group-texts">
          <strong>{group.name}</strong>
          <small>{description}</small>
          {group.introduction ? <small>{group.introduction}</small> : null}
        </span>
        {badges.length ? (
          <span className="rn-joined-group-badges">
            {badges.map(badge => (
              <em className={`is-${badge}`} key={badge}>
                {getJoinedGroupBadgeLabel(badge)}
              </em>
            ))}
          </span>
        ) : null}
        {opening ? <span className="rn-joined-group-row-spinner" /> : null}
      </span>
    </button>
  );
}
