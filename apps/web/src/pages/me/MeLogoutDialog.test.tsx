import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { MeLogoutDialog } from './MeLogoutDialog.js';

describe('MeLogoutDialog', () => {
  it('projects the exact RN logout title, message and action order', () => {
    /** html 固定退出确认层的语义与文案顺序。 */
    const html = renderToStaticMarkup(
      <MeLogoutDialog
        open
        signingOut={false}
        onCancel={() => undefined}
        onConfirm={() => undefined}
      />,
    );

    expect(html).toContain('aria-label="退出登录"');
    expect(html).toContain('<h2>退出登录</h2>');
    expect(html).toContain('<p>确认退出当前账号？</p>');
    expect(html.indexOf('>取消</button>')).toBeLessThan(html.indexOf('>退出</button>'));
  });

  it('disables both actions while the runtime sign-out is pending', () => {
    /** html 固定退出提交期间不可取消或重复确认。 */
    const html = renderToStaticMarkup(
      <MeLogoutDialog
        open
        signingOut
        onCancel={() => undefined}
        onConfirm={() => undefined}
      />,
    );

    expect(html).toContain('退出中');
    expect(html.match(/disabled=""/g)).toHaveLength(2);
  });
});
