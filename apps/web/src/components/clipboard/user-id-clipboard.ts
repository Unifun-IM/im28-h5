/** 用户 ID 复制通过端口隔离浏览器剪贴板 I/O。 */
export interface UserIDClipboardPort {
  readonly writeText: (text: string) => Promise<void>;
}

/** 浏览器剪贴板是用户 ID 复制的唯一平台副作用 owner。 */
const browserUserIDClipboard: UserIDClipboardPort = {
  /** 将已校验的用户 ID 写入系统剪贴板。 */
  async writeText(text) {
    /** clipboard 在非安全上下文或不支持的浏览器中可能不存在。 */
    const clipboard = navigator.clipboard;
    if (!clipboard) throw new Error('当前浏览器不支持复制');
    await clipboard.writeText(text);
  },
};

/** 只复制非空稳定用户 ID，并原样传播浏览器拒绝。 */
export async function copyUserIDToClipboard(
  userID: string,
  clipboard: UserIDClipboardPort = browserUserIDClipboard,
): Promise<void> {
  /** normalizedUserID 防止空身份被反馈为复制成功。 */
  const normalizedUserID = userID.trim();
  if (!normalizedUserID) throw new Error('暂无ID');
  await clipboard.writeText(normalizedUserID);
}
