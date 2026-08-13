import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import {
  ChatComposerPendingFile,
  formatChatPendingFileSize,
} from './ChatComposerPendingFile.js';

describe('ChatComposerPendingFile', () => {
  it('renders RN pending file facts and removal affordance', () => {
    // file 模拟浏览器普通文件选择结果，不执行读取或上传。
    const file = new File(['a'.repeat(2048)], 'report.pdf', {
      type: 'application/pdf',
    });
    // markup 只验证无副作用的可访问 DOM 契约。
    const markup = renderToStaticMarkup(
      <ChatComposerPendingFile file={file} onRemove={vi.fn()} />,
    );
    expect(markup).toContain('aria-label="已选文件"');
    expect(markup).toContain('report.pdf');
    expect(markup).toContain('文件 · 2.0 KB');
    expect(markup).toContain('aria-label="移除已选文件"');
  });

  it('formats bytes without hiding exact small values', () => {
    expect(formatChatPendingFileSize(512)).toBe('512 B');
    expect(formatChatPendingFileSize(1024 * 1024)).toBe('1.0 MB');
  });
});
