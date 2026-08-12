import { describe, expect, it } from 'vitest';

import { buildGroupCardShareRoute } from './group-card-share-route.js';

// 群名片 route 回归确保设置入口只携带可刷新的稳定会话身份。
describe('group card share route', () => {
  it('trims and encodes the conversation identity', () => {
    expect(buildGroupCardShareRoute(' group/conversation ')).toBe(
      '/conversations/group%2Fconversation/settings/share-group-card',
    );
  });

  it('rejects an empty conversation identity', () => {
    expect(() => buildGroupCardShareRoute(' ')).toThrow('群名片分享需要会话 ID');
  });
});
