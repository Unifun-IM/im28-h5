import { describe, expect, it } from 'vitest';

import composerSource from './ChatComposer.tsx?raw';
import submissionSource from './useChatComposerSubmission.ts?raw';

/** Composer 提交合同必须只有一个 H5 编排 owner。 */
describe('chat composer submission owner', () => {
  it('Composer 只组合提交 hook，不再内联消息类型分支', () => {
    expect(composerSource).toContain('useChatComposerSubmission({');
    expect(composerSource).toContain('onSubmit={submission.submit}');
    expect(composerSource).not.toContain('createIMComposerSubmissionPlan');
    expect(composerSource).not.toContain('onSendSubmission(');
    expect(composerSource).not.toContain('onSendQuote(');
    expect(composerSource).not.toContain('onSendMention(');
    expect(composerSource).not.toContain('onSendText(');
  });

  it('提交 owner 保持 RN 对齐的六类显式分支和成功后清理语义', () => {
    expect(submissionSource).toContain('createIMComposerSubmissionPlan({');
    expect(submissionSource).toContain('options.composer.forwardDraft.onSubmit({');
    expect(submissionSource).toContain('options.composer.onEditText(selectedEdit, document)');
    expect(submissionSource).toContain('options.composer.onSendSubmission(');
    expect(submissionSource).toContain('options.composer.onSendQuote(');
    expect(submissionSource).toContain('options.composer.onSendMention(');
    expect(submissionSource).toContain('options.composer.onSendText(document)');
    expect(submissionSource).toContain("options.updateDraftDocument({ text: '', entities: [] })");
  });
});
