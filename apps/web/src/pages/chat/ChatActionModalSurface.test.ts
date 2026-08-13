import { describe, expect, it } from 'vitest';

import { captureChatActionAnchor } from './ChatActionModalSurface.js';

describe('chat action modal surface', () => {
  it('freezes the browser rectangle and outgoing direction', () => {
    /** element 模拟发出消息内的链接 DOM 锚点。 */
    const element = {
      getBoundingClientRect: () => ({ top: 18, left: 260, width: 96, height: 24 }),
      closest: (selector: string) => selector === '.rn-chat-message-row.is-outgoing'
        ? { className: 'rn-chat-message-row is-outgoing' }
        : null,
    } as unknown as HTMLElement;
    expect(captureChatActionAnchor(element)).toEqual({
      top: 18,
      left: 260,
      width: 96,
      height: 24,
      mine: true,
    });
  });

  it('keeps incoming anchors on the other side', () => {
    /** element 模拟收到消息内的普通气泡 DOM 锚点。 */
    const element = {
      getBoundingClientRect: () => ({ top: 64, left: 52, width: 180, height: 72 }),
      closest: () => null,
    } as unknown as HTMLElement;
    expect(captureChatActionAnchor(element).mine).toBe(false);
  });
});
