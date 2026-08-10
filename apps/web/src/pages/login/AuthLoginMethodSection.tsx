import { Link } from 'react-router-dom';

import accountIconURL from '../../assets/rn/assets/icons/imm28/icon28.svg';
import mailIconURL from '../../assets/rn/assets/icons/imm28/mail.regular.svg';
import phoneIconURL from '../../assets/rn/assets/icons/imm28/smartphone-device.regular.svg';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';
import type { AuthLoginMode } from './auth-login-config.js';

/** 登录方式切换区参数。 */
interface AuthLoginMethodSectionProps {
  readonly currentMode: AuthLoginMode;
}

/** 登录方式路由与 RN 原资产的稳定映射。 */
const LOGIN_METHODS: readonly {
  readonly mode: AuthLoginMode;
  readonly label: string;
  readonly path: string;
  readonly iconURL: string;
}[] = [
  { mode: 'phone', label: '手机号登录', path: '/auth/phone', iconURL: phoneIconURL },
  { mode: 'email', label: '邮箱登录', path: '/auth/email', iconURL: mailIconURL },
  { mode: 'account', label: '账号密码登录', path: '/auth/account', iconURL: accountIconURL },
];

/** 复刻 RN “或”分割线与登录方式按钮，切换只走 React Router。 */
export function AuthLoginMethodSection({ currentMode }: AuthLoginMethodSectionProps) {
  // availableMethods 不展示当前已激活的登录方式。
  const availableMethods = LOGIN_METHODS.filter(method => method.mode !== currentMode);
  return (
    <section className="auth-method-section" aria-label="切换登录方式">
      <div className="auth-method-divider" aria-hidden="true">
        <span />
        <b>或</b>
        <span />
      </div>
      <div className="auth-method-list">
        {availableMethods.map(method => (
          <Link key={method.mode} to={method.path}>
            <RNAssetIcon assetURL={method.iconURL} />
            <span>{method.label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
