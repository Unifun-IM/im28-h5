import { describe, expect, it, vi } from 'vitest';

import {
  copyUserIDToClipboard,
  type UserIDClipboardPort,
} from './user-id-clipboard.js';

/** 用户 ID 复制必须由真实平台结果决定成功或失败。 */
describe('copyUserIDToClipboard', () => {
  /** 非空身份去除边缘空白后只写入一次。 */
  it('copies the normalized stable user ID', async () => {
    /** writeText 记录交给浏览器端口的稳定身份。 */
    const writeText = vi.fn(async () => undefined);
    await copyUserIDToClipboard(' 68078541335 ', { writeText });
    expect(writeText).toHaveBeenCalledOnce();
    expect(writeText).toHaveBeenCalledWith('68078541335');
  });

  /** 空身份在任何浏览器副作用前拒绝。 */
  it('rejects an empty identity before writing', async () => {
    /** clipboard 证明拒绝发生在 writeText 之前。 */
    const clipboard: UserIDClipboardPort = {
      writeText: vi.fn(async () => undefined),
    };
    await expect(copyUserIDToClipboard('  ', clipboard)).rejects.toThrow('暂无ID');
    expect(clipboard.writeText).not.toHaveBeenCalled();
  });

  /** 浏览器拒绝必须原样传播，页面不得制造成功反馈。 */
  it('propagates clipboard failures', async () => {
    /** failure 模拟安全上下文或权限拒绝。 */
    const failure = new Error('Clipboard permission denied');
    /** clipboard 显式抛出平台失败。 */
    const clipboard: UserIDClipboardPort = {
      writeText: vi.fn(async () => {
        throw failure;
      }),
    };
    await expect(copyUserIDToClipboard('68078541335', clipboard)).rejects.toBe(failure);
  });
});
