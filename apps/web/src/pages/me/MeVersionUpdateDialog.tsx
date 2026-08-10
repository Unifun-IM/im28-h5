import type { WebIMClientVersionCheckResult } from '@im28/im-sdk/web';

/** 版本更新弹窗只接收 SDK 已验证的更新结果。 */
interface MeVersionUpdateDialogProps {
  readonly update: WebIMClientVersionCheckResult;
  readonly onDismiss: () => void;
}

/** 复刻 RN 更新提示，并保持 Web 强制更新能力边界可见。 */
export function MeVersionUpdateDialog({
  update,
  onDismiss,
}: MeVersionUpdateDialogProps) {
  // updateMessage 与 RN 版本提示文案保持一致。
  const updateMessage = `检测到有新版本${
    update.latestVersion ? `\nv${update.latestVersion}` : ''
  }`;
  /** 仅普通更新允许通过遮罩关闭。 */
  const dismissOptionalUpdate = (): void => {
    if (!update.forceUpdate) onDismiss();
  };

  return (
    <div
      className="rn-me-dialog-backdrop"
      role="presentation"
      onClick={dismissOptionalUpdate}
    >
      <section
        className="rn-me-dialog rn-me-version-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="version-update-title"
        aria-describedby="version-update-message"
        onClick={event => event.stopPropagation()}
      >
        <h2 id="version-update-title">更新提示</h2>
        <p id="version-update-message">{updateMessage}</p>
        <div className={update.forceUpdate ? 'is-single' : undefined}>
          {!update.forceUpdate ? (
            <button type="button" onClick={onDismiss}>去完善</button>
          ) : null}
          {update.updateURL ? (
            <a href={update.updateURL}>立即更新</a>
          ) : (
            <button type="button" disabled>暂无更新地址</button>
          )}
        </div>
      </section>
    </div>
  );
}
