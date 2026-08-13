import { describe, expect, it } from 'vitest';

import {
  CHAT_MESSAGE_ACTION_ITEM_HEIGHT,
  CHAT_MESSAGE_ACTION_MENU_WIDTH,
  getChatMessageActionStackLayout,
} from './chat-message-action-layout.js';

describe('chat message action layout', () => {
  it('收到消息靠左，保留 RN 200px 菜单宽度和原气泡预览宽度', () => {
    /** layout 模拟 412px 手机视口内的短消息。 */
    const layout = getChatMessageActionStackLayout(
      { top: 180, left: 52, width: 96, height: 58, mine: false },
      5,
      412,
      844,
    );
    expect(layout).toMatchObject({
      top: 180,
      left: 16,
      width: CHAT_MESSAGE_ACTION_MENU_WIDTH,
      previewWidth: CHAT_MESSAGE_ACTION_MENU_WIDTH,
      previewMaxHeight: 58,
    });
  });

  it('发出消息靠右并按动作数量把底部菜单夹紧到视口内', () => {
    /** layout 模拟底部七动作消息。 */
    const layout = getChatMessageActionStackLayout(
      { top: 760, left: 300, width: 90, height: 50, mine: true },
      7,
      412,
      844,
    );
    expect(layout.left).toBe(196);
    expect(layout.top).toBe(
      844 - 16 - 50 - 8 - 7 * CHAT_MESSAGE_ACTION_ITEM_HEIGHT,
    );
  });

  it('极窄视口收窄菜单并限制超高消息预览', () => {
    /** layout 模拟嵌入式窄屏和超高媒体消息。 */
    const layout = getChatMessageActionStackLayout(
      { top: -20, left: 0, width: 500, height: 600, mine: false },
      5,
      180,
      320,
    );
    expect(layout).toEqual({
      top: 16,
      left: 16,
      width: 148,
      previewWidth: 148,
      previewMaxHeight: 80,
    });
  });

  it('链接两项动作复用同一定位并保留底部安全距离', () => {
    /** layout 模拟靠近底部的发出链接。 */
    const layout = getChatMessageActionStackLayout(
      { top: 790, left: 260, width: 120, height: 32, mine: true },
      2,
      412,
      844,
    );
    expect(layout).toMatchObject({
      top: 708,
      left: 196,
      width: CHAT_MESSAGE_ACTION_MENU_WIDTH,
      previewMaxHeight: 32,
    });
  });
});
