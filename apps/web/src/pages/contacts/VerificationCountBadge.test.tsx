import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { VerificationCountBadge } from './VerificationCountBadge.js';

// 验证消息角标复刻 RN 可见规则。
describe('VerificationCountBadge', () => {
  it('零值隐藏，正常值与 99+ 上限稳定展示', () => {
    expect(renderToStaticMarkup(<VerificationCountBadge count={0} />)).toBe('');
    expect(renderToStaticMarkup(<VerificationCountBadge count={12} />)).toContain('>12<');
    expect(renderToStaticMarkup(<VerificationCountBadge count={150} />)).toContain('>99+<');
  });
});
