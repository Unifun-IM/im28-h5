import { describe, expect, it } from 'vitest';

import conversationRowSource from './ConversationRow.tsx?raw';

/** 会话行必须消费纯展示规则，避免组件内形成第二套静音提醒判断。 */
describe('conversation row unread badge contract', () => {
  /** 静音提醒的角标类型由 conversation-list-view 唯一决定。 */
  it('delegates badge priority and keeps manual unread as a dot', () => {
    expect(conversationRowSource).toContain('shouldShowConversationUnreadBadge(conversation, preview.text)');
    expect(conversationRowSource).toContain('!showUnreadBadge || manualUnreadOnly');
  });

  /** 在线绿点必须由页面传入 shared presence 投影，且群聊由纯 helper 拒绝。 */
  it('renders the shared presence result only for a resolved direct peer', () => {
    expect(conversationRowSource).toContain('readonly online: boolean');
    expect(conversationRowSource).toContain('online && getConversationPresenceUserID(conversation)');
    expect(conversationRowSource).toContain('rn-conversation-online-dot-border');
  });
});
