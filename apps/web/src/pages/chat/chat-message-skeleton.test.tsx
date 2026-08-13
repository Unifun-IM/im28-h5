import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import skeletonSource from './ChatMessageSkeleton.tsx?raw';
import { ChatMessageSkeleton } from './ChatMessageSkeleton.js';

/** 聊天首屏骨架必须保持 RN 固定几何和群头像差异。 */
describe('chat message skeleton', () => {
  it('renders twelve incoming rows and group avatars', () => {
    /** groupMarkup 验证群聊每行都有 24px 头像占位。 */
    const groupMarkup = renderToStaticMarkup(<ChatMessageSkeleton showAvatar />);
    expect(groupMarkup.match(/rn-chat-message-skeleton-row/g)).toHaveLength(12);
    expect(groupMarkup.match(/rn-chat-message-skeleton-avatar/g)).toHaveLength(12);
    expect(groupMarkup.match(/rn-chat-message-skeleton-tail/g)).toHaveLength(12);
    expect(skeletonSource).toContain('bubbletail-left-skeleton.svg');
  });

  it('keeps single chat avatar-free and uses the RN four-size cycle', () => {
    /** singleMarkup 验证单聊不制造群成员头像。 */
    const singleMarkup = renderToStaticMarkup(<ChatMessageSkeleton showAvatar={false} />);
    expect(singleMarkup).not.toContain('rn-chat-message-skeleton-avatar');
    expect(skeletonSource).toContain('{ width: 188, height: 58 }');
    expect(skeletonSource).toContain('{ width: 236, height: 76 }');
    expect(skeletonSource).toContain('{ width: 142, height: 44 }');
    expect(skeletonSource).toContain('{ width: 210, height: 58 }');
  });

});
