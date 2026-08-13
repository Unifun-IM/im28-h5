import { describe, expect, it } from 'vitest';

import {
  readGroupApplyRouteState,
  readGroupSearchCreateState,
  readGroupSearchKeyword,
} from './group-search-route.js';

/** 群搜索 SPA state 必须拒绝任意路由和非稳定身份。 */
describe('group search route state', () => {
  it('恢复去重选择、合法入口和搜索词', () => {
    /** state 模拟从联系人页进入建群后继续查找群聊。 */
    const state = { selectedUserIDs: [' u1 ', 'u1', '', 3, 'u2'], backHref: '/contacts', searchKeyword: ' 群聊 ' };
    expect(readGroupSearchCreateState(state)).toEqual({ selectedUserIDs: ['u1', 'u2'], backHref: '/contacts' });
    expect(readGroupSearchKeyword(state)).toBe('群聊');
  });

  it('只接受 search 申请来源并固定返回查群页', () => {
    /** result 不能透传外部 backHref。 */
    const result = readGroupApplyRouteState({
      sourceType: 'search', backHref: 'https://example.com', searchKeyword: 'g1',
      createState: { selectedUserIDs: ['u1'], backHref: '/contacts' },
    });
    expect(result).toEqual({
      sourceType: 'search', backHref: '/groups/search', searchKeyword: 'g1',
      createState: { selectedUserIDs: ['u1'], backHref: '/contacts' },
    });
    expect(readGroupApplyRouteState({ sourceType: 'other' }).sourceType).toBe('qrcode');
  });
});
