import type { WebIMConversationListItem } from '@im28/im-sdk/web';
import { describe, expect, it } from 'vitest';

import {
  filterArchivedConversationItems,
  mergeArchivedConversationItems,
} from './conversation-archive-view.js';

/** 构造归档列表 helper 所需最小缓存项。 */
function createArchivedItem(
  conversationID: string,
  name: string,
  text = '',
): WebIMConversationListItem {
  return {
    conversation: {
      conversationID,
      type: 'single',
      targetID: conversationID,
      name,
      unreadCount: 0,
      isArchived: true,
      updatedAt: 1,
    },
    latestMessage: text ? {
      clientMsgID: `message-${conversationID}`,
      conversationID,
      senderID: conversationID,
      direction: 'incoming',
      contentType: 101,
      status: 'received',
      sendTime: 1,
      payload: { text: { text } },
    } : null,
    unreadMention: null,
  };
}

/** 归档页纯投影不拥有同步或 mutation。 */
describe('conversation archive view', () => {
  /** 分页合并保持旧顺序、更新重复行并追加新会话。 */
  it('merges pages by stable conversation ID', () => {
    /** first 是当前页面已加载行。 */
    const first = [createArchivedItem('one', '旧名称'), createArchivedItem('two', '第二个')];
    /** next 同时包含 one 的新快照和第三行。 */
    const next = [createArchivedItem('one', '新名称'), createArchivedItem('three', '第三个')];
    expect(mergeArchivedConversationItems(first, next).map(item => item.conversation.name))
      .toEqual(['新名称', '第二个', '第三个']);
  });

  /** 搜索同时匹配会话标题与既有摘要投影。 */
  it('filters loaded cache by title or preview', () => {
    /** items 覆盖标题命中和摘要命中。 */
    const items = [
      createArchivedItem('one', '研发群', '今天开会'),
      createArchivedItem('two', '产品群', '需求评审'),
    ];
    expect(filterArchivedConversationItems(items, '研发')).toHaveLength(1);
    expect(filterArchivedConversationItems(items, '评审')).toMatchObject([
      { conversation: { conversationID: 'two' } },
    ]);
  });
});
