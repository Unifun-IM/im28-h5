import type { Conversation, WebIMConversationListItem } from '@im28/im-sdk/web';
import { describe, expect, it } from 'vitest';

import {
  getConversationPresenceUserID,
  getConversationPresenceUserIDs,
  mergeConversationPresence,
  projectConversationPresence,
} from './conversation-presence-view.js';

/** 构造会话 presence 测试所需的最小缓存项。 */
function createItem(conversation: Conversation): WebIMConversationListItem {
  return { conversation, latestMessage: null, unreadMention: null };
}

/** 构造会话 presence 测试所需的最小会话。 */
function createConversation(
  input: Partial<Conversation> & Pick<Conversation, 'conversationID' | 'type' | 'targetID'>,
): Conversation {
  return { unreadCount: 0, updatedAt: 1, ...input };
}

/** 会话 presence 规则锁定 RN 的单聊范围与历史 ID 回退。 */
describe('conversation presence view', () => {
  /** 单聊优先使用 targetID，并兼容 RN 已有的 conversationID 前缀。 */
  it('resolves only direct peer identities', () => {
    expect(getConversationPresenceUserID(createConversation({
      conversationID: 'single-1', type: 'single', targetID: ' peer-1 ',
    }))).toBe('peer-1');
    expect(getConversationPresenceUserID(createConversation({
      conversationID: 'si_peer-2', type: 'single', targetID: '',
    }))).toBe('peer-2');
    expect(getConversationPresenceUserID(createConversation({
      conversationID: 'group-1', type: 'group', targetID: 'group-1',
    }))).toBe('');
  });

  /** 目标集合稳定去重排序，群聊不会扩大 presence 请求。 */
  it('builds a stable direct-only target list', () => {
    expect(getConversationPresenceUserIDs([
      createItem(createConversation({ conversationID: 'b', type: 'single', targetID: 'peer-b' })),
      createItem(createConversation({ conversationID: 'group', type: 'group', targetID: 'group-1' })),
      createItem(createConversation({ conversationID: 'a', type: 'single', targetID: 'peer-a' })),
      createItem(createConversation({ conversationID: 'a-2', type: 'single', targetID: 'peer-a' })),
    ])).toEqual(['peer-a', 'peer-b']);
  });

  /** 完整查询替换旧投影，realtime frame 只增量覆盖命中的用户。 */
  it('projects HTTP snapshots and merges realtime updates', () => {
    /** initial 是 Gateway 明确返回的完整已知状态。 */
    const initial = projectConversationPresence([
      { userID: 'peer-a', online: true, lastSeenAt: '' },
    ]);
    expect(initial).toEqual({ 'peer-a': true });
    expect(mergeConversationPresence(initial, [
      { userID: 'peer-b', online: false, lastSeenAt: '' },
    ])).toEqual({ 'peer-a': true, 'peer-b': false });
  });
});
