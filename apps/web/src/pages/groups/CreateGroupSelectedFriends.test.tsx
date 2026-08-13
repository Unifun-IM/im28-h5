import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import type { WebIMContact } from '@im28/im-sdk/web';
import { CreateGroupSelectedFriends } from './CreateGroupSelectedFriends.js';

/** 创建可稳定断言头像与名称的已选好友。 */
function createSelectedContact(userID: string, displayName: string): WebIMContact {
  return {
    userID,
    displayName,
    nickname: displayName,
    remark: '',
    account: '',
    phone: '',
    email: '',
    avatarURL: '',
    isStarred: false,
    addedAt: '',
  };
}

describe('CreateGroupSelectedFriends', () => {
  it('renders RN search, preview, clear and per-friend review actions', () => {
    /** candidates 覆盖两位已选好友和底部复核计数。 */
    const candidates = [
      { contact: createSelectedContact('u-1', 'donk二大爷'), displayName: 'donk二大爷' },
      { contact: createSelectedContact('u-2', 'donk三大爷'), displayName: 'donk三大爷' },
    ];
    /** markup 只验证展示与可访问动作，不触发任何建群 mutation。 */
    const markup = renderToStaticMarkup(
      <CreateGroupSelectedFriends
        candidates={candidates}
        disabled={false}
        open
        onOpenSearch={vi.fn()}
        onOpenReview={vi.fn()}
        onClear={vi.fn()}
        onCloseReview={vi.fn()}
        onToggle={vi.fn()}
      />,
    );
    expect(markup).toContain('aria-label="查找群聊"');
    expect(markup).toContain('aria-label="查看已选好友详情"');
    expect(markup).toContain('aria-label="清空已选好友，共 2 人"');
    expect(markup).toContain('已选好友（2）');
    expect(markup).toContain('aria-label="取消选择好友donk二大爷"');
    expect(markup).toContain('aria-label="取消选择好友donk三大爷"');
  });
});
