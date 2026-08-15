import { describe, expect, it } from 'vitest';

import composerSource from './ChatForwardComposer.tsx?raw';
import chatComposerSource from './ChatComposer.tsx?raw';
import submissionSource from './useChatComposerSubmission.ts?raw';
import inputRowSource from './ChatComposerInputRow.tsx?raw';
import footerSource from './ChatPageFooter.tsx?raw';
import modalSource from './ChatForwardPreviewModal.tsx?raw';
import pageSource from './ChatPage.tsx?raw';
import surfaceSource from './ChatPageSurface.tsx?raw';

/** H5 转发预览必须复用 RN 生产结构，同时保持“预览不发送”的交互边界。 */
describe('chat forward preview modal RN parity contract', () => {
  it('复用聊天消息正文和发送方气泡，不再渲染 senderID 文本列表', () => {
    expect(modalSource).toContain('<ChatMessageContent');
    expect(modalSource).toContain('<ChatForwardOrigin');
    expect(modalSource).toContain('resolveChatForwardPreviewOrigin(message, senderNamesByID)');
    expect(composerSource).toContain('senderNamesByID={pending.senderNamesByID}');
    expect(modalSource).toContain('rn-chat-message-row is-outgoing');
    expect(modalSource).toContain('formatChatMessageTimeText(message)');
    expect(modalSource).not.toContain('<strong>{message.senderID}</strong>');
  });

  it('锁定 RN 标题、副标题和四项预览菜单', () => {
    expect(modalSource).toContain('转发(${selectedCount})');
    expect(modalSource).toContain('${normalizedRecipientName} ${visibilityCopy}选中的消息已被转发');
    expect(modalSource).toContain("'隐藏发送者名称'");
    expect(modalSource).toContain('label="修改收件人"');
    expect(modalSource).toContain('label="应用更改"');
    expect(modalSource).toContain('label="取消转发"');
  });

  it('预览结构提供独立面板、消息选择器和操作菜单样式锚点', () => {
    expect(modalSource).toContain('className="rn-chat-forward-sheet"');
    expect(modalSource).toContain('className="rn-chat-forward-preview-selector"');
    expect(modalSource).toContain('className="rn-chat-forward-options"');
    expect(modalSource).toContain('className="rn-chat-forward-sheet-backdrop"');
  });

  it('预览只调整本地选择，真实发送复用唯一 ChatComposer', () => {
    expect(modalSource).not.toContain('onSubmit');
    expect(modalSource).not.toContain('sendForward');
    expect(composerSource).not.toContain('<form');
    expect(composerSource).not.toContain('<textarea');
    expect(composerSource).not.toContain('sendIconURL');
    expect(composerSource).toContain('onSelectionChange({ sourceClientMsgIDs: selectedIDs, hideSenderName })');
    expect(chatComposerSource).toContain('<ChatForwardComposer');
    expect(chatComposerSource).toContain('useChatComposerSubmission({');
    expect(chatComposerSource).not.toContain('createIMComposerSubmissionPlan');
    expect(submissionSource).toContain('const canSend = Boolean(options.composer.forwardDraft');
    expect(submissionSource).toContain('if (options.composer.forwardDraft) {');
    expect(submissionSource).toContain(
      'if (!options.composer.forwardDraft || !options.forwardSelection) return;',
    );
    expect(submissionSource).toContain('await options.composer.forwardDraft.onSubmit({');
    expect(chatComposerSource).toContain('forwarding={Boolean(forwardDraft)}');
    expect(inputRowSource).toContain("aria-label={forwarding ? '发送转发消息' : '发送消息'}");
    expect(footerSource).not.toContain('<ChatForwardComposer');
    expect(composerSource).toContain('function applyPreviewChanges(): void');
    expect(pageSource).toContain('<ChatPageSurface');
    expect(surfaceSource).toContain('<ChatMediaInteractionProvider');
    /** conversationBodySource 只检查实际 Provider 组合函数，避免跨函数源码顺序误判。 */
    const conversationBodySource = surfaceSource.slice(
      surfaceSource.indexOf('function ChatPageConversationBody'),
      surfaceSource.indexOf('function ChatPageMessageTimeline'),
    );
    expect(conversationBodySource).toContain('<ChatPageComposerArea');
    expect(conversationBodySource.indexOf('<ChatPageComposerArea'))
      .toBeLessThan(conversationBodySource.indexOf('</ChatMediaInteractionProvider>'));
  });
});
