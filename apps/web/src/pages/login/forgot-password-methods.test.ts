import { describe, expect, it } from 'vitest';

import pageSource from './LoginPage.tsx?raw';
import dialogSource from './ForgotPasswordMethodsDialog.tsx?raw';

/** 忘记密码回归确保 H5 对齐 RN 替代登录而非调用已下线接口。 */
describe('forgot password methods dialog', () => {
  it('账号登录页打开手机号、邮箱和客服找回方式', () => {
    expect(pageSource).toContain('setForgotPasswordVisible(true)');
    expect(dialogSource).toContain('手机号登录');
    expect(dialogSource).toContain('邮箱登录');
    expect(dialogSource).toContain('联系客服找回');
    expect(pageSource).toContain('setForgotPasswordVisible(false); navigate(\'/auth/phone\')');
    expect(pageSource).toContain('setForgotPasswordVisible(false); navigate(\'/auth/email\')');
  });

  it('不调用或伪造 Gateway 忘记密码请求', () => {
    expect(pageSource).not.toContain('runtime.forgotPassword');
    expect(dialogSource).not.toContain('forgotPassword(');
    expect(dialogSource).not.toContain('gatewayClient');
    expect(dialogSource).toContain('请联系 IMM-28 客服协助找回账号密码。');
  });
});
