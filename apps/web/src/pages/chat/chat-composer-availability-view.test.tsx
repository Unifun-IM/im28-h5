import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import footerSource from './ChatPageFooter.tsx?raw';
import pageSource from './ChatPage.tsx?raw';
import hookSource from './useChatMentionMembers.ts?raw';
import { ChatUnavailableComposerBar } from './ChatUnavailableComposerBar.js';

// 群聊输入区必须消费 shared 群快照，不得在页面复制权限业务规则。
describe('chat composer availability H5 contract', () => {
  it('从 cache-first 群 facade 投影 shared 不可用原因', () => {
    expect(hookSource).toContain('sync.groups.listCached()');
    expect(hookSource).toContain('sync.groups.sync()');
    expect(hookSource).toContain('group.composerUnavailableReason');
    expect(hookSource).toContain('refreshedGroup.composerUnavailableReason');
    expect(hookSource).toContain('IM_GROUP_COMPOSER_RECOVERING_REASON');
    expect(hookSource).toContain('IM_GROUP_COMPOSER_MISSING_REASON');
    expect(hookSource).toContain('IM_GROUP_COMPOSER_UNRESOLVED_REASON');
    expect(hookSource).not.toContain('member_muted');
    expect(hookSource).not.toContain('can_send_message');
  });

  it('多选优先于不可用提示，待转发复用普通 Composer', () => {
    /** multiIndex 固定底部状态门的 RN 顺序。 */
    const multiIndex = footerSource.indexOf('forwardFlow.multiSelecting');
    /** unavailableIndex 是共享规则投影入口。 */
    const unavailableIndex = footerSource.indexOf('if (unavailableText)');
    expect(multiIndex).toBeGreaterThan(-1);
    expect(unavailableIndex).toBeGreaterThan(multiIndex);
    expect(footerSource).not.toContain('if (forwardFlow.pending)');
    expect(pageSource).toContain('forwardDraft={forwardFlow.pending ? {');
    expect(pageSource).toContain('mentionMembers.composerUnavailableReason ||');
    expect(pageSource).toContain('directRelationship.presentation.composerUnavailableReason');
  });

  it('按 RN 文案渲染可访问的只读输入区状态栏', () => {
    /** html 验证状态栏不包含按钮或输入控件。 */
    const html = renderToStaticMarkup(
      <ChatUnavailableComposerBar text="群聊已解散，无法发消息" />,
    );
    expect(html).toContain('role="status"');
    expect(html).toContain('aria-label="群聊已解散，无法发消息"');
    expect(html).not.toContain('<button');
    expect(html).not.toContain('<textarea');
  });
});
