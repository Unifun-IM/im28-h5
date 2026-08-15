import { describe, expect, it } from 'vitest';

import { readQRCodeBackHref, readQRCodeShareBackHref } from './qr-route.js';

describe('QR code route state', () => {
  it('只接受已迁移首页返回路由', () => {
    expect(readQRCodeBackHref({ backHref: '/contacts' })).toBe('/contacts');
    expect(readQRCodeBackHref({ backHref: '/me/profile' })).toBe('/me/profile');
    expect(readQRCodeBackHref({ backHref: '/conversations/group-1/settings/profile' })).toBe('/conversations/group-1/settings/profile');
    expect(readQRCodeBackHref({ backHref: '/conversations/group-1/settings/qrcode' })).toBe('/conversations');
    expect(readQRCodeBackHref({ backHref: '/outside' })).toBe('/conversations');
    expect(readQRCodeBackHref(null)).toBe('/conversations');
  });

  it('分享页只接受当前二维码类型登记的真实来源页', () => {
    expect(readQRCodeShareBackHref({ backHref: '/scan' }, 'user', '')).toBe('/scan');
    expect(readQRCodeShareBackHref({ backHref: '/me/profile' }, 'user', '')).toBe('/me/profile');
    expect(readQRCodeShareBackHref({ backHref: '/outside' }, 'user', '')).toBe('/me');
    expect(readQRCodeShareBackHref({ backHref: '/conversations/group-1/settings/profile' }, 'group', 'group-1')).toBe('/conversations/group-1/settings/profile');
    expect(readQRCodeShareBackHref({ backHref: '/conversations/group-2/settings/profile' }, 'group', 'group-1')).toBe('/conversations/group-1/settings/profile');
  });
});
