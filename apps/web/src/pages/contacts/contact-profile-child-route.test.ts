import { describe, expect, it } from 'vitest';

import applicationPageSource from './ContactFriendApplicationPage.tsx?raw';
import profilePageSource from './ContactProfilePage.tsx?raw';
import profileSharedSource from './ContactProfileShared.tsx?raw';
import {
  createContactProfileChildRouteState,
  getContactProfileHeaderBackState,
  readContactProfileApplicationSourceType,
} from './contact-profile-route-state.js';

/** 资料子路由必须只延续恢复来源需要的白名单 state。 */
describe('contact profile child route state', () => {
  it('搜索来源跨申请子路由保留有界关键词与页签', () => {
    expect(createContactProfileChildRouteState({
      backHref: '/contacts/search',
      searchKeyword: ` ${'a'.repeat(101)} `,
      serverTab: 'groups',
      token: 'discarded',
    })).toEqual({
      backHref: '/contacts/search',
      searchKeyword: 'a'.repeat(100),
      serverTab: 'groups',
      searchBackHref: '/contacts',
    });
    expect(getContactProfileHeaderBackState('/contacts/users/u-1', {
      backHref: '/contacts/search',
      searchKeyword: ' 用户 ',
      serverTab: 'friends',
    })).toEqual({
      backHref: '/contacts/search',
      searchKeyword: '用户',
      serverTab: 'friends',
      searchBackHref: '/contacts',
    });
  });

  it('扫码来源与群成员候选只保留合法字段', () => {
    expect(createContactProfileChildRouteState({
      backHref: '/scan',
      sourceType: 'qrcode',
      groupConversationID: 'discarded',
    })).toEqual({ backHref: '/scan', sourceType: 'qrcode' });
    expect(readContactProfileApplicationSourceType({
      backHref: '/scan',
      sourceType: 'qrcode',
    })).toBe('qrcode');
    expect(createContactProfileChildRouteState({
      backHref: '/conversations/group%2F1/settings/members',
      groupConversationID: ' group-1 ',
      sourceType: 'outside',
    })).toEqual({
      backHref: '/conversations/group%2F1/settings/members',
      groupConversationID: 'group-1',
    });
  });

  it('拒绝外部地址、未知来源和非资料目标的 header state', () => {
    expect(createContactProfileChildRouteState({
      backHref: 'https://example.test',
      sourceType: 'qrcode',
    })).toBeUndefined();
    expect(createContactProfileChildRouteState({
      backHref: '/contacts/outside',
      sourceType: 'qrcode',
    })).toBeUndefined();
    expect(readContactProfileApplicationSourceType({
      backHref: '/contacts/search',
      sourceType: 'group',
    })).toBeNull();
    expect(getContactProfileHeaderBackState('/contacts/search', {
      backHref: '/contacts/search',
      searchKeyword: '用户',
      serverTab: 'groups',
    })).toEqual({
      searchKeyword: '用户',
      serverTab: 'groups',
      searchBackHref: '/contacts',
    });
    expect(getContactProfileHeaderBackState('/outside', {
      backHref: '/contacts/search',
      searchKeyword: '用户',
    })).toBeUndefined();
  });

  it('资料、申请和公共 Header 只消费唯一 route-state owner', () => {
    expect(profilePageSource).toContain('createContactProfileChildRouteState(location.state)');
    expect(profilePageSource).toMatch(
      /navigate\(`\/contacts\/users\/\$\{encodeURIComponent\(profile\.userID\)\}\/groups`,\s*\{\s*state: profileRouteState,?\s*\}\)/,
    );
    expect(applicationPageSource).toContain('readContactProfileApplicationSourceType(location.state)');
    expect(applicationPageSource).toContain('state={profileRouteState}');
    expect(profileSharedSource).toContain('getContactProfileHeaderBackState(backHref, location.state)');
    expect(profilePageSource).not.toContain('function readContactProfileSourceType');
    expect(applicationPageSource).not.toContain('function readFriendApplicationSourceType');
  });
});
