import { describe, expect, it } from 'vitest';

import listViewSource from './conversation-list-view.ts?raw';
import previewViewSource from './conversation-preview-view.ts?raw';

/** 会话摘要 owner 合同阻止 preview 与列表元数据再次合并成超限双职责文件。 */
describe('conversation preview owner', () => {
  /** 摘要模块唯一持有草稿、消息类型、mention 与群发送者投影。 */
  it('keeps preview projection in one bounded production owner', () => {
    expect(previewViewSource).toContain('export function getConversationDisplayPreview');
    expect(previewViewSource).toContain('readIMConversationDraftDocument');
    expect(previewViewSource).toContain('projectMentionPreview');
    expect(previewViewSource).toContain('projectGroupSenderPreview');
    expect(listViewSource).not.toMatch(/getConversationDisplayPreview|contentType|readIMConversationDraftDocument/);
  });

  /** 列表元数据模块继续独占标题、未读导航、badge 与时间格式化。 */
  it('keeps list metadata outside the preview projection owner', () => {
    expect(listViewSource).toContain('export function getConversationTitle');
    expect(listViewSource).toContain('export function getNextUnreadConversationID');
    expect(previewViewSource).not.toMatch(/getConversationTitle|getNextUnreadConversationID|formatConversationListTime/);
    expect(listViewSource.split('\n').length).toBeLessThanOrEqual(301);
    expect(previewViewSource.split('\n').length).toBeLessThanOrEqual(301);
  });
});
