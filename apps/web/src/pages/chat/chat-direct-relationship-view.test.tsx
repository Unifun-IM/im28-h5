import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import hookSource from './useChatDirectRelationship.ts?raw';
import pageSource from './ChatPage.tsx?raw';
import { ChatRelationshipNotice } from './ChatRelationshipNotice.js';

// 单聊关系页面必须消费 shared 投影，不得复制协议或伪造反向黑名单。
describe('chat direct relationship H5 contract', () => {
  it('只调用 SDK 聚合关系和共享发送错误分类', () => {
    expect(hookSource).toContain('sync.directChatRelationship.get(peerUserID)');
    expect(hookSource).toContain('relationshipVersion');
    expect(hookSource).toContain('isIMFriendRelationshipSendError(cause)');
    expect(hookSource).not.toContain('listBlacklist');
    expect(hookSource).not.toContain('is_friend');
    expect(hookSource).not.toContain('blockedByPeer');
  });

  it('组合群与单聊输入区限制，并跳转真实好友申请页', () => {
    expect(pageSource).toContain('mentionMembers.composerUnavailableReason ||');
    expect(pageSource).toContain('directRelationship.presentation.composerUnavailableReason');
    expect(pageSource).toContain("? '正在恢复会话'");
    expect(pageSource).toContain("'会话暂不可用，无法发消息'");
    expect(pageSource).toContain('directRelationship.markStrangerFromSendError(cause)');
    expect(pageSource).toContain('snapshot.relationshipVersion');
    expect(pageSource).toContain('/contacts/users/${encodeURIComponent(conversation.targetID)}/add');
  });

  it('按 RN 文案渲染可访问的消息列表底部动作', () => {
    /** onAction 验证组件保留真实 SPA action callback。 */
    const onAction = vi.fn();
    /** html 验证关系提示不是输入区或伪按钮文本。 */
    const html = renderToStaticMarkup(
      <ChatRelationshipNotice
        text="你还不是对方好友，请先发送朋友验证请求，对方验证通过后，才能聊天。"
        actionLabel="申请添加朋友"
        onAction={onAction}
      />,
    );
    expect(html).toContain('role="status"');
    expect(html).toContain('aria-label="申请添加朋友"');
    expect(html).toContain('<button');
    expect(html).not.toContain('<input');
  });
});
