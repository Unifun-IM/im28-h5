/** 扫码页只允许返回真实入口页，不再返回已移除的二维码展示路由。 */
export type QRCodeBackHref = '/conversations' | '/contacts' | '/me' | '/me/profile' | `/conversations/${string}/settings/profile`;

/** 从未知 Router state 读取受控的扫码返回路由。 */
export function readQRCodeBackHref(state: unknown): QRCodeBackHref {
  if (!state || typeof state !== 'object') return '/conversations';
  /** backHref 只接受已迁移首页、个人资料与群资料页。 */
  const backHref = Reflect.get(state, 'backHref');
  if (backHref === '/contacts' || backHref === '/me' || backHref === '/me/profile') return backHref;
  if (typeof backHref === 'string' && /^\/conversations\/[^/]+\/settings\/profile$/.test(backHref)) {
    return backHref as `/conversations/${string}/settings/profile`;
  }
  return '/conversations';
}

/** 二维码分享页只接受其对应弹窗来源页作为返回目标。 */
export type QRCodeShareBackHref = '/me' | '/me/profile' | '/scan' | `/conversations/${string}/settings/profile`;

/** 从 Router state 恢复分享弹窗来源，并按二维码类型拒绝跨业务路径。 */
export function readQRCodeShareBackHref(state: unknown, kind: 'user' | 'group', conversationID: string): QRCodeShareBackHref {
  /** fallbackHref 始终落在真实入口页。 */
  const fallbackHref: QRCodeShareBackHref = kind === 'group'
    ? `/conversations/${encodeURIComponent(conversationID)}/settings/profile`
    : '/me';
  if (!state || typeof state !== 'object') return fallbackHref;
  /** backHref 只允许当前二维码类型登记过的入口页。 */
  const backHref = Reflect.get(state, 'backHref');
  if (kind === 'user') {
    return backHref === '/scan' || backHref === '/me/profile' || backHref === '/me' ? backHref : fallbackHref;
  }
  /** groupProfileHref 绑定当前会话，禁止借分享路由跳到其他群。 */
  const groupProfileHref = `/conversations/${encodeURIComponent(conversationID)}/settings/profile` as const;
  return backHref === groupProfileHref ? groupProfileHref : fallbackHref;
}
