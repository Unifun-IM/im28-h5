import { describe, expect, it } from 'vitest';

import conversationPageSource from './ConversationsPage.tsx?raw';

/** 归档通栏背景必须由纯投影驱动，避免页面内复制置顶判断。 */
describe('conversation archive pinned background contract', () => {
  /** 页面消费统一规则并只追加展示 class。 */
  it('wires the archive projection to the pinned row style', () => {
    expect(conversationPageSource).toContain(
      'shouldUsePinnedArchiveBackground(items, archivedItems)',
    );
    expect(conversationPageSource).toContain(
      "archiveUsesPinnedBackground ? ' is-pinned' : ''",
    );
  });
});
