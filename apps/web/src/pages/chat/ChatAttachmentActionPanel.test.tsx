import { createRef } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { ChatAttachmentActionPanel } from './ChatAttachmentActionPanel.js';

/** 创建附件面板的无副作用测试输入。 */
function renderPanel(showCallAction: boolean): string {
  return renderToStaticMarkup(
    <ChatAttachmentActionPanel
      albumInputRef={createRef<HTMLInputElement>()}
      cameraInputRef={createRef<HTMLInputElement>()}
      fileInputRef={createRef<HTMLInputElement>()}
      showCallAction={showCallAction}
      onOpenCallPicker={vi.fn()}
      onOpenCardPicker={vi.fn()}
    />,
  );
}

/** 聊天附件动作必须保持 RN 顺序和单聊 RTC 可见性。 */
describe('ChatAttachmentActionPanel', () => {
  it('renders the complete direct-chat action order', () => {
    /** markup 承载浏览器端完整单聊附件面板。 */
    const markup = renderPanel(true);
    /** labels 按 DOM 顺序提取可访问名称。 */
    const labels = [...markup.matchAll(/aria-label="([^"]+)"/g)].map(match => match[1]);

    expect(labels).toEqual([
      '聊天功能面板',
      '相册',
      '拍照',
      '音视频通话',
      '文件',
      '名片',
    ]);
  });

  it('hides single-chat RTC while retaining group-safe actions', () => {
    /** markup 模拟 RN 群聊附件面板。 */
    const markup = renderPanel(false);

    expect(markup).not.toContain('音视频通话');
    expect(markup).toContain('aria-label="拍照"');
    expect(markup).toContain('aria-label="名片"');
  });
});
