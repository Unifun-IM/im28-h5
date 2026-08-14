import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { ChatMultiSelectBar } from './ChatMultiSelectBar.js';

/** RN 多选底栏契约只允许转发和删除两个操作。 */
describe('ChatMultiSelectBar', () => {
  it('renders only forward and delete actions', () => {
    /** markup 是无业务副作用的底栏静态投影。 */
    const markup = renderToStaticMarkup(
      <ChatMultiSelectBar
        selectedCount={1}
        onForward={() => undefined}
        onDelete={() => undefined}
      />,
    );
    expect(markup).toContain('aria-label="转发已选消息"');
    expect(markup).toContain('aria-label="删除已选消息"');
    expect(markup).not.toContain('取消多选');
    expect(markup).not.toContain('已选择1条');
  });

  it('disables both actions when no message is selected', () => {
    /** markup 是空选择状态的底栏静态投影。 */
    const markup = renderToStaticMarkup(
      <ChatMultiSelectBar
        selectedCount={0}
        onForward={() => undefined}
        onDelete={() => undefined}
      />,
    );
    expect(markup.match(/disabled=""/g)).toHaveLength(2);
  });
});
