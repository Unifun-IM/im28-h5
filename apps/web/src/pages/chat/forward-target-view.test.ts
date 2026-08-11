import type { Conversation, WebIMContact, WebIMJoinedGroup } from '@im28/im-sdk/web';
import { describe, expect, it } from 'vitest';

import {
  contactToChatForwardTarget,
  conversationToChatForwardTarget,
  filterChatForwardTargets,
  findForwardGroupConversationID,
  groupToChatForwardTarget,
} from './forward-target-view.js';

/** 构造测试所需的最小真实会话投影。 */
function createConversation(
  input: Pick<Conversation, 'conversationID' | 'targetID' | 'type' | 'name' | 'faceURL'>,
): Conversation {
  return input as Conversation;
}

// 目标选择回归确保三个数据源只生成稳定身份，不猜测会话主键。
describe('forward target view', () => {
  it('projects conversation, friend and group facade records', () => {
    // conversation 保留 facade 提供的真实会话 ID。
    const conversation = createConversation({
      conversationID: 'conversation-group-1',
      targetID: 'group-1',
      type: 'group',
      name: '项目群',
      faceURL: 'https://example.test/group.png',
    });
    // contact 验证单聊目标在选择后才由 facade 打开会话。
    const contact = {
      userID: 'user-1',
      displayName: 'Alice',
      avatarURL: 'https://example.test/user.png',
    } as WebIMContact;
    // group 验证群 facade 返回的可选真实 conversation ID。
    const group = {
      groupID: 'group-1',
      conversationID: 'conversation-group-1',
      name: '项目群',
      avatarURL: '',
      memberCount: 8,
    } as WebIMJoinedGroup;

    expect(conversationToChatForwardTarget(conversation)).toMatchObject({
      key: 'conversation:conversation-group-1',
      id: 'group-1',
      conversationID: 'conversation-group-1',
      description: '群聊 · group-1',
    });
    expect(contactToChatForwardTarget(contact)).toMatchObject({
      key: 'friend:user-1',
      id: 'user-1',
      conversationID: '',
    });
    expect(groupToChatForwardTarget(group)).toMatchObject({
      key: 'group:group-1',
      conversationID: 'conversation-group-1',
      description: '群聊 · 8人',
    });
  });

  it('filters locally without reordering and resolves only cached group conversations', () => {
    // conversations 同时覆盖 exact 与按 target 回退匹配。
    const conversations = [
      createConversation({
        conversationID: 'group-conversation',
        targetID: 'group-1',
        type: 'group',
        name: '项目群',
        faceURL: '',
      }),
      createConversation({
        conversationID: 'single-conversation',
        targetID: 'group-1',
        type: 'single',
        name: '同名用户',
        faceURL: '',
      }),
    ];
    // targets 保持 facade 原始排序用于搜索断言。
    const targets = conversations.map(conversationToChatForwardTarget);

    expect(filterChatForwardTargets(targets, '  项目 ')).toEqual([targets[0]]);
    expect(findForwardGroupConversationID(
      { id: 'group-1', conversationID: 'missing-conversation' },
      conversations,
    )).toBe('group-conversation');
    expect(findForwardGroupConversationID(
      { id: 'missing-group', conversationID: 'single-conversation' },
      conversations,
    )).toBe('');
  });
});
