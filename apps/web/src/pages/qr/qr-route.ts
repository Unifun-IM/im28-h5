/** 扫码页允许的首页或个人二维码返回路由。 */
export type QRCodeBackHref = '/conversations' | '/contacts' | '/me/qrcode' | `/conversations/${string}/settings/qrcode`;

/** 从未知 Router state 读取受控的扫码返回路由。 */
export function readQRCodeBackHref(state: unknown): QRCodeBackHref {
  if (!state || typeof state !== 'object') return '/conversations';
  /** backHref 只接受已迁移首页 tab 与个人二维码页。 */
  const backHref = Reflect.get(state, 'backHref');
  if (backHref === '/contacts' || backHref === '/me/qrcode') return backHref;
  if (typeof backHref === 'string' && /^\/conversations\/[^/]+\/settings\/qrcode$/.test(backHref)) {
    return backHref as `/conversations/${string}/settings/qrcode`;
  }
  return '/conversations';
}

/** 个人二维码页只接受三个真实入口作为返回目标。 */
export type ProfileQRCodeBackHref = '/me' | '/me/profile' | '/scan';

/** 从 Router state 恢复个人二维码页返回目标并拒绝任意路径。 */
export function readProfileQRCodeBackHref(state: unknown): ProfileQRCodeBackHref {
  if (!state || typeof state !== 'object') return '/me';
  /** backHref 只允许扫码页和个人资料页覆盖默认个人中心。 */
  const backHref = Reflect.get(state, 'backHref');
  return backHref === '/scan' || backHref === '/me/profile' ? backHref : '/me';
}
