import { describe, expect, it } from 'vitest';

import mePageSource from './MePage.tsx?raw';
import meProfilePageSource from './MeProfilePage.tsx?raw';

/** 个人中心主菜单结构合同锁定 RN 分组和入口顺序。 */
describe('me home menu contract', () => {
  /** 个人资料与通用设置同卡，账号安全必须位于独立的第二张卡。 */
  it('keeps the RN menu grouping and order', () => {
    expect(mePageSource.match(/className="rn-me-menu-card"/g)).toHaveLength(2);
    expect(mePageSource.indexOf('>个人资料<')).toBeLessThan(
      mePageSource.indexOf('>通用设置<'),
    );
    expect(mePageSource.indexOf('>通用设置<')).toBeLessThan(
      mePageSource.indexOf('>账号安全<'),
    );
    expect(mePageSource.indexOf('to="/me/security"')).toBeGreaterThan(
      mePageSource.indexOf('</div>\n          <div className="rn-me-menu-card">'),
    );
  });

  /** 头像和昵称必须复用个人资料页已有编辑 owner。 */
  it('routes profile shortcuts to the existing avatar and nickname owners', () => {
    expect(mePageSource).toContain('aria-label="修改头像"');
    expect(mePageSource).toContain('state={{ openAvatarSource: true }}');
    expect(mePageSource).toContain('aria-label="编辑昵称"');
    expect(mePageSource).toContain('to="/me/profile/nickname"');
    expect(meProfilePageSource).toContain("navigate(location.pathname, { replace: true, state: null })");
  });

  /** 资料页 ID 行必须保持 RN 可点击复制语义且不显示导航箭头。 */
  it('keeps the profile ID row as a clipboard action', () => {
    expect(meProfilePageSource).toContain('aria-label="复制ID"');
    expect(meProfilePageSource).toContain('onClick={() => void copyUserID()}');
    expect(meProfilePageSource).toContain('<strong>{userID}</strong>');
  });
});
