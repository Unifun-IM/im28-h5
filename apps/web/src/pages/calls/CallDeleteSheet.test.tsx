import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { CallDeleteSheet } from './CallDeleteSheet.js';

describe('CallDeleteSheet', () => {
  it('projects the selected count and RN delete actions into the shared modal', () => {
    /** html 固定确认层的语义、数量和动作文案。 */
    const html = renderToStaticMarkup(
      <CallDeleteSheet
        count={3}
        deleting={false}
        open
        onCancel={() => undefined}
        onDelete={() => undefined}
      />,
    );

    expect(html).toContain('aria-label="删除通话记录"');
    expect(html).toContain('确定要删除这3条通话记录吗？');
    expect(html).toContain('>删除</button>');
    expect(html).toContain('>取消</button>');
  });

  it('disables both exits while the shared deletion is pending', () => {
    /** html 固定提交期间不允许关闭或重复确认。 */
    const html = renderToStaticMarkup(
      <CallDeleteSheet
        count={1}
        deleting
        open
        onCancel={() => undefined}
        onDelete={() => undefined}
      />,
    );

    expect(html).toContain('删除中...');
    expect(html.match(/disabled=""/g)).toHaveLength(2);
  });
});
