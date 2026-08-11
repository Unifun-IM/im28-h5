import { useRef, type PointerEvent as ReactPointerEvent } from 'react';
import type { CustomEmoji } from '@im28/im-sdk/web';

/** 移动托盘复用 RN 选中组叠放与拖动释放语义。 */
interface CustomEmojiReorderTrayProps {
  readonly emojis: readonly CustomEmoji[];
  readonly onMove: (clientX: number, clientY: number) => void;
  readonly onDrop: () => void;
  readonly onCancel: () => void;
}

/** 用标准 Pointer Events 同时支持触摸屏和鼠标拖动。 */
export function CustomEmojiReorderTray({
  emojis,
  onMove,
  onDrop,
  onCancel,
}: CustomEmojiReorderTrayProps) {
  // draggingRef 阻止非本次指针的 move/drop。
  const draggingRef = useRef(false);
  // startPointRef 区分点击与真实拖动，避免轻触即改序。
  const startPointRef = useRef({ x: 0, y: 0 });
  // previewEmojis 最多显示两层，数量角标表达完整选中组。
  const previewEmojis = emojis.slice(0, 2);

  /** 捕获当前指针并开始跨网格拖动。 */
  function handlePointerDown(event: ReactPointerEvent<HTMLButtonElement>) {
    draggingRef.current = true;
    startPointRef.current = { x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
    onMove(event.clientX, event.clientY);
  }

  /** 持续把屏幕坐标交给管理页网格 owner。 */
  function handlePointerMove(event: ReactPointerEvent<HTMLButtonElement>) {
    if (!draggingRef.current) return;
    onMove(event.clientX, event.clientY);
  }

  /** 释放后只提交本地 stable-ID 顺序。 */
  function handlePointerUp(event: ReactPointerEvent<HTMLButtonElement>) {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    // moved 只有越过 4px 手势门槛才允许提交。
    const moved = Math.hypot(
      event.clientX - startPointRef.current.x,
      event.clientY - startPointRef.current.y,
    ) > 4;
    onMove(event.clientX, event.clientY);
    event.currentTarget.releasePointerCapture(event.pointerId);
    if (moved) onDrop();
  }

  return (
    <footer className="rn-custom-emoji-reorder-tray">
      <button className="rn-custom-emoji-reorder-cancel" type="button" onClick={onCancel}>取消</button>
      <button
        className="rn-custom-emoji-reorder-stack"
        type="button"
        aria-label={`拖动选中的${emojis.length}个表情`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => { draggingRef.current = false; }}
      >
        {previewEmojis.map((emoji, index) => (
          <img key={emoji.emojiID} className={index === 0 && previewEmojis.length > 1 ? 'is-back' : ''} src={emoji.url} alt="" draggable="false" />
        ))}
        <span>{emojis.length}</span>
      </button>
      <p>拖动至表情之间，松手即完成移动</p>
    </footer>
  );
}
