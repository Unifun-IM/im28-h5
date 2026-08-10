import { useState } from 'react';

import clearIconURL from '../../assets/rn/assets/icons/imm28/xmark-circle.solid.svg';
import eyeClosedIconURL from '../../assets/rn/screens/auth/assets/eye-closed-icon.svg';
import eyeIconURL from '../../assets/rn/screens/auth/assets/eye-icon.svg';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';

/** 账号安全输入组件参数。 */
interface MeSecurityFieldProps {
  readonly id: string;
  readonly value: string;
  readonly placeholder: string;
  readonly secure?: boolean;
  readonly disabled?: boolean;
  readonly error?: string;
  readonly onChange: (value: string) => void;
  readonly onBlur?: () => void;
}

/** 复刻 RN SecurityTextField 的清空、密文切换和错误布局。 */
export function MeSecurityField({
  id,
  value,
  placeholder,
  secure = false,
  disabled = false,
  error,
  onChange,
  onBlur,
}: MeSecurityFieldProps) {
  // visible 只控制当前密码字段，不与其他输入共享。
  const [visible, setVisible] = useState(false);
  return (
    <div className="rn-me-security-field">
      <div className="rn-me-security-input">
        <label className="sr-only" htmlFor={id}>{placeholder}</label>
        <input id={id} autoCapitalize="none" autoCorrect="off" autoComplete={secure ? 'new-password' : 'username'} type={secure && !visible ? 'password' : 'text'} value={value} placeholder={placeholder} disabled={disabled} onBlur={onBlur} onChange={event => onChange(event.target.value)} />
        {value ? <button type="button" aria-label={`清空${placeholder}`} disabled={disabled} onClick={() => onChange('')}><RNAssetIcon assetURL={clearIconURL} /></button> : null}
        {secure ? <button type="button" aria-label={visible ? '隐藏密码' : '显示密码'} disabled={disabled} onClick={() => setVisible(current => !current)}><RNAssetIcon assetURL={visible ? eyeIconURL : eyeClosedIconURL} /></button> : null}
      </div>
      {error ? <p role="alert">{error}</p> : null}
    </div>
  );
}
