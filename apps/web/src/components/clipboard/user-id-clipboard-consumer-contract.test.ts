import { describe, expect, it } from 'vitest';

import contactProfileSource from '../../pages/contacts/ContactProfilePage.tsx?raw';
import mePageSource from '../../pages/me/MePage.tsx?raw';
import meProfileSource from '../../pages/me/MeProfilePage.tsx?raw';

/** 用户 ID 复制消费者合同防止资料页重新建立浏览器剪贴板双轨。 */
describe('user ID clipboard consumer contract', () => {
  /** 三个资料消费者必须共同委托全局平台端口。 */
  it('routes every profile ID copy through one platform adapter', () => {
    /** sources 只覆盖当前三个生产资料入口。 */
    const sources = [mePageSource, meProfileSource, contactProfileSource];
    for (const source of sources) {
      expect(source).toContain("from '../../components/clipboard/user-id-clipboard.js'");
      expect(source).not.toContain('navigator.clipboard');
    }
  });

  /** 对端资料只在平台写入成功后显示 RN 同语义反馈。 */
  it('keeps contact profile feedback success-only', () => {
    expect(contactProfileSource).toContain('await copyUserIDToClipboard(profile.userID)');
    expect(contactProfileSource).toContain('复制ID成功');
    expect(contactProfileSource.indexOf('await copyUserIDToClipboard(profile.userID)'))
      .toBeLessThan(contactProfileSource.indexOf("setCopiedUserID('复制ID成功')"));
  });
});
