import { describe, expect, it } from 'vitest';

import { readProfileQRCodeBackHref, readQRCodeBackHref } from './qr-route.js';

describe('QR code route state', () => {
  it('只接受已迁移首页返回路由', () => {
    expect(readQRCodeBackHref({ backHref: '/contacts' })).toBe('/contacts');
    expect(readQRCodeBackHref({ backHref: '/me/qrcode' })).toBe('/me/qrcode');
    expect(readQRCodeBackHref({ backHref: '/conversations/group-1/settings/qrcode' })).toBe('/conversations/group-1/settings/qrcode');
    expect(readQRCodeBackHref({ backHref: '/conversations/group-1/settings/qrcode/edit' })).toBe('/conversations');
    expect(readQRCodeBackHref({ backHref: '/outside' })).toBe('/conversations');
    expect(readQRCodeBackHref(null)).toBe('/conversations');
  });

  it('只接受已登记的个人二维码返回路由', () => {
    expect(readProfileQRCodeBackHref({ backHref: '/scan' })).toBe('/scan');
    expect(readProfileQRCodeBackHref({ backHref: '/me/profile' })).toBe('/me/profile');
    expect(readProfileQRCodeBackHref({ backHref: '/outside' })).toBe('/me');
    expect(readProfileQRCodeBackHref(null)).toBe('/me');
  });
});
