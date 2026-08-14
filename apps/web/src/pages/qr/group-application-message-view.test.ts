import { describe, expect, it } from 'vitest';

import { resolveApplicationMessageUpdate } from '../contacts/application-message-view.js';
import { createGroupApplyReturnState, readGroupApplyRouteState } from '../groups/group-search-route.js';
import groupApplyPageSource from './GroupQRCodeApplyPage.tsx?raw';

/** 群申请页对齐 RN 的缺省文案、草稿保护和成功返回契约。 */
describe('group application message view', () => {
  it('异步昵称只替换用户尚未编辑的缺省文案', () => {
    expect(resolveApplicationMessageUpdate({
      currentMessage: '申请加入群聊',
      previousDefaultMessage: '申请加入群聊',
      nextDefaultMessage: '我是donk，申请加入群聊',
    }).message).toBe('我是donk，申请加入群聊');
    expect(resolveApplicationMessageUpdate({
      currentMessage: '请群主通过',
      previousDefaultMessage: '申请加入群聊',
      nextDefaultMessage: '我是donk，申请加入群聊',
    }).message).toBe('请群主通过');
  });

  it('搜索来源成功后恢复原搜索上下文，扫码来源不携带状态', () => {
    /** contactSearchState 模拟从联系人群聊页签进入申请页。 */
    const contactSearchState = readGroupApplyRouteState({
      sourceType: 'search',
      backHref: '/contacts/search',
      searchKeyword: ' 群聊 ',
    });
    expect(createGroupApplyReturnState(contactSearchState)).toEqual({
      selectedUserIDs: [],
      backHref: '/conversations',
      searchKeyword: '群聊',
      serverTab: 'groups',
      searchBackHref: '/contacts',
    });
    expect(createGroupApplyReturnState(readGroupApplyRouteState(null))).toBeUndefined();
  });

  it('页面消费 shared 昵称规则并仅在真实提交成功后 replace 返回', () => {
    expect(groupApplyPageSource).toContain('buildIMSelfGroupApplicationMessage');
    expect(groupApplyPageSource).toContain('runtime.getSync().profile.getCurrent()');
    expect(groupApplyPageSource).toContain('resolveApplicationMessageUpdate');
    expect(groupApplyPageSource).toContain('navigate(routeState.backHref, {');
    expect(groupApplyPageSource).toContain('replace: true');
    expect(groupApplyPageSource).not.toContain('setSubmitted(true)');
  });
});
