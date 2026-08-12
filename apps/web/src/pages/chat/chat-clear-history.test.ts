import type { Conversation, WebIMConversationSync } from '@im28/im-sdk/web';
import { describe, expect, it, vi } from 'vitest';

import {
  buildChatClearHistorySheetView,
  clearChatHistory,
} from './chat-clear-history.js';

/** 构造清空确认测试使用的共享会话快照。 */
function createConversation(overrides: Partial<Conversation> = {}): Conversation {
  return {
    conversationID: 'si_user-2',
    type: 'single',
    targetID: 'user-2',
    name: '小明',
    unreadCount: 0,
    updatedAt: 1,
    ...overrides,
  };
}

describe('chat clear history', () => {
  it('keeps RN scope labels and hides all-members action for normal members', () => {
    expect(buildChatClearHistorySheetView(createConversation(), false)).toEqual({
      hint: '你确定要删除与 小明 的聊天记录 ?',
      selfLabel: '仅在我的设备中删除',
      allLabel: '为我和 小明 删除',
      showAll: true,
      allScope: 'both',
    });
    expect(buildChatClearHistorySheetView(createConversation({
      conversationID: 'sg_group-1',
      type: 'group',
      targetID: 'group-1',
      name: '产品群',
    }), false)).toMatchObject({
      showAll: false,
      allScope: 'all_members',
    });
  });

  it('delegates the confirmed target and scope to the shared facade', async () => {
    /** result 模拟 shared success-only transaction 返回的 canonical 快照。 */
    const result = createConversation({ listHidden: true });
    /** clear 记录页面唯一允许调用的 destructive owner。 */
    const clear = vi.fn(async () => result);
    await expect(clearChatHistory(
      { clear } as Pick<WebIMConversationSync, 'clear'>,
      'si_user-2',
      'both',
    )).resolves.toBe(result);
    expect(clear).toHaveBeenCalledWith({
      conversationID: 'si_user-2',
      scope: 'both',
    });
  });
});
