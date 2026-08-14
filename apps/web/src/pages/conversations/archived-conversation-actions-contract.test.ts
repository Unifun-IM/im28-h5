import { describe, expect, it } from 'vitest';

import archivedPageSource from './ArchivedConversationsPage.tsx?raw';

/** 归档页必须复用首页全局操作菜单，禁止复制扫码、建群、加好友和群发路由。 */
describe('archived conversation action menu contract', () => {
  /** Navbar 右侧消费唯一 HomeActionMenu owner，并移除无交互占位。 */
  it('reuses the shared home action menu in the archived navbar', () => {
    expect(archivedPageSource).toContain(
      "import { HomeActionMenu } from '../../components/home-actions/HomeActionMenu.js';",
    );
    expect(archivedPageSource).toContain(
      '<div className="rn-conversation-header-side"><HomeActionMenu /></div>',
    );
    expect(archivedPageSource).not.toContain(
      '<span className="rn-conversation-header-side" aria-hidden="true" />',
    );
  });
});
