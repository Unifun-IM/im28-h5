import type { Conversation } from '@im28/im-sdk/web';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { ChatHeader } from './ChatHeader.js';

/** 渲染指定会话与待审核数量的聊天头部。 */
function renderHeader(conversation: Conversation, groupApplicationCount: number): string {
  return renderToStaticMarkup(
    <MemoryRouter>
      <ChatHeader
        conversation={conversation}
        presence={{ text: '', dot: 'none' }}
        groupApplicationCount={groupApplicationCount}
        onOpenProfile={() => undefined}
        onOpenGroupApplications={() => undefined}
      />
    </MemoryRouter>,
  );
}

// 群聊头部申请角标遵循 RN 的可见与上限规则。
describe('ChatHeader group applications', () => {
  it('群聊只在非零时展示申请入口并限制为 99+', () => {
    /** groupConversation 提供头部所需的最小群会话字段。 */
    const groupConversation = {
      conversationID: 'c1', type: 'group', targetID: 'g1', showName: '群聊', unreadCount: 0, updatedAt: 0,
    } as Conversation;
    expect(renderHeader(groupConversation, 0)).not.toContain('aria-label="入群申请"');
    expect(renderHeader(groupConversation, 100)).toContain('>99+<');
  });

  it('单聊即使收到异常计数也不展示群申请入口', () => {
    /** singleConversation 模拟防御性错误输入。 */
    const singleConversation = {
      conversationID: 'c2', type: 'single', targetID: 'u1', showName: '好友', unreadCount: 0, updatedAt: 0,
    } as Conversation;
    expect(renderHeader(singleConversation, 3)).not.toContain('aria-label="入群申请"');
  });
});

// 标题区资料动作保持 RN 的单聊和群聊无障碍语义。
describe('ChatHeader profile action', () => {
  it('群聊和单聊分别暴露资料入口', () => {
    /** groupConversation 提供群资料入口。 */
    const groupConversation = {
      conversationID: 'c1', type: 'group', targetID: 'g1', showName: '群聊', unreadCount: 0, updatedAt: 0,
    } as Conversation;
    /** singleConversation 提供对方资料入口。 */
    const singleConversation = {
      conversationID: 'c2', type: 'single', targetID: 'u1', showName: '好友', unreadCount: 0, updatedAt: 0,
    } as Conversation;
    expect(renderHeader(groupConversation, 0)).toContain('aria-label="群资料"');
    expect(renderHeader(singleConversation, 0)).toContain('aria-label="查看对方资料"');
  });
});
