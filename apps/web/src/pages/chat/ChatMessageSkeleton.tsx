import type { CSSProperties } from 'react';

import skeletonTailURL from '../../assets/rn/assets/icons/chat/bubbletail-left-skeleton.svg';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';
import './chat-message-skeleton.css';

/** 首屏骨架只需要知道群聊是否展示发送者头像。 */
interface ChatMessageSkeletonProps {
  readonly showAvatar: boolean;
}

/** 四档气泡尺寸严格复用 RN 冷首屏骨架节奏。 */
const CHAT_MESSAGE_SKELETON_ROWS = [
  { width: 188, height: 58 },
  { width: 236, height: 76 },
  { width: 142, height: 44 },
  { width: 210, height: 58 },
] as const;

/** 一屏固定十二行，由底部对齐容器裁切顶部多余内容。 */
const CHAT_MESSAGE_SKELETON_ROW_COUNT = 12;

/** 按 RN incoming 消息几何呈现首屏加载骨架。 */
export function ChatMessageSkeleton({ showAvatar }: ChatMessageSkeletonProps) {
  /** rows 循环四档尺寸，不在渲染期生成随机布局。 */
  const rows = Array.from(
    { length: CHAT_MESSAGE_SKELETON_ROW_COUNT },
    (_, index) => CHAT_MESSAGE_SKELETON_ROWS[index % CHAT_MESSAGE_SKELETON_ROWS.length]!,
  );
  return (
    <div className="rn-chat-message-skeleton" aria-label="正在加载消息" role="status">
      {rows.map((row, index) => {
        /** bubbleStyle 将固定 RN 尺寸传给响应式 CSS 裁剪。 */
        const bubbleStyle = {
          '--chat-skeleton-width': `${row.width}px`,
          '--chat-skeleton-height': `${row.height}px`,
        } as CSSProperties;
        return (
          <span className="rn-chat-message-skeleton-row" key={`${row.width}-${index}`}>
            {showAvatar ? <i className="rn-chat-message-skeleton-avatar" aria-hidden="true" /> : null}
            <span className="rn-chat-message-skeleton-bubble-wrap">
              <span className="rn-chat-message-skeleton-bubble" style={bubbleStyle}>
                <i className="rn-chat-message-skeleton-shimmer" aria-hidden="true" />
              </span>
              <RNAssetIcon assetURL={skeletonTailURL} className="rn-chat-message-skeleton-tail" />
            </span>
          </span>
        );
      })}
    </div>
  );
}
