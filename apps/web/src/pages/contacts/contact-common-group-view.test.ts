import { describe, expect, it } from 'vitest';

import { findCommonGroupConversationID } from './contact-common-group-view.js';

// 共同群聊路由回归锁定只能进入当前账号真实存在的 conversation 主键。
describe('contact common group view', () => {
  /** SDK 返回的 conversation ID 存在于缓存时应优先使用。 */
  it('uses the projected conversation ID only when it exists in the account list', () => {
    /** conversations 模拟当前账号真实会话集合。 */
    const conversations = [{
      conversationID: 'conversation-1',
      type: 'group' as const,
      targetID: 'group-1',
      unreadCount: 0,
      updatedAt: 1,
    }];
    expect(findCommonGroupConversationID({
      groupID: 'group-1',
      conversationID: 'conversation-1',
    }, conversations)).toBe('conversation-1');
  });

  /** 投影主键过期时应按群 targetID 查找真实会话。 */
  it('falls back to a group target match when the projected ID is stale', () => {
    /** conversations 只包含新的 canonical 主键。 */
    const conversations = [{
      conversationID: 'conversation-new',
      type: 'group' as const,
      targetID: 'group-1',
      unreadCount: 0,
      updatedAt: 1,
    }];
    expect(findCommonGroupConversationID({
      groupID: 'group-1',
      conversationID: 'conversation-old',
    }, conversations)).toBe('conversation-new');
  });

  /** 没有真实会话时不得把 group ID 猜成 conversation ID。 */
  it('returns empty when no canonical conversation exists', () => {
    expect(findCommonGroupConversationID({
      groupID: 'group-1',
      conversationID: '',
    }, [])).toBe('');
  });
});
