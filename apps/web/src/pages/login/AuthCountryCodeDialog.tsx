import { useEffect, useRef } from 'react';

import type { AuthCountryCode } from './auth-login-config.js';
import { AUTH_COUNTRY_CODES } from './auth-login-config.js';

/** RN 国家码底部选择器参数。 */
interface AuthCountryCodeDialogProps {
  readonly visible: boolean;
  readonly value: AuthCountryCode;
  readonly onClose: () => void;
  readonly onSelect: (value: AuthCountryCode) => void;
}

/** 使用浏览器原生 dialog 复刻 RN 国家码底部选择器。 */
export function AuthCountryCodeDialog({
  visible,
  value,
  onClose,
  onSelect,
}: AuthCountryCodeDialogProps) {
  // dialogRef 将 Router page state 同步到 modal surface。
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    // dialog 只由 visible 驱动，避免浏览器自行残留 open 状态。
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (visible && !dialog.open) dialog.showModal();
    if (!visible && dialog.open) dialog.close();
  }, [visible]);

  return (
    <dialog
      ref={dialogRef}
      className="auth-country-dialog"
      aria-labelledby="country-dialog-title"
      onCancel={event => {
        event.preventDefault();
        onClose();
      }}
      onClick={event => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section className="auth-country-sheet">
        <h2 id="country-dialog-title">选择国家码</h2>
        {AUTH_COUNTRY_CODES.map(country => (
          <button
            className={country.dialCode === value.dialCode ? 'is-selected' : ''}
            key={country.dialCode}
            type="button"
            onClick={() => {
              onSelect(country);
              onClose();
            }}
          >
            <span>{country.name}</span>
            <span>{country.dialCode}</span>
          </button>
        ))}
      </section>
    </dialog>
  );
}
