import { describe, expect, it } from 'vitest';

import {
  buildContactFriendApplicationRoute,
  buildContactProfileRoute,
  formatContactProfileAddedAt,
  getContactProfileGenderLabel,
  getContactProfileGroupPresentation,
  getContactProfileNavbarState,
  getContactProfilePrimaryAction,
  resolveContactProfileBackHref,
  readContactProfileGroupConversationID,
} from './contact-profile-view.js';
import type { WebIMPeerProfile } from '@im28/im-sdk/web';

// 联系人资料 view helper 锁定关系 action、显示字段和 SPA 路由语义。
describe('contact profile view', () => {
  it('消费 SDK 已归一化的好友来源字段而不在页面复制协议映射', () => {
    /** profile 模拟 shared peer facade 输出的群聊来源。 */
    const profile: WebIMPeerProfile = {
      userID: 'u-1', displayName: '用户一', nickname: '用户一', remark: '',
      avatarURL: '', gender: 0, bio: '', relationship: 'friend', isStarred: false,
      sourceType: 'group', sourceLabel: '通过群聊添加', addedAt: '',
    };
    expect(profile.sourceLabel).toBe('通过群聊添加');
  });

  it('按好友、陌生人和本人关系选择唯一主操作', () => {
    expect(getContactProfilePrimaryAction('friend')).toBe('message');
    expect(getContactProfilePrimaryAction('stranger')).toBe('add-friend');
    expect(getContactProfilePrimaryAction('self')).toBeNull();
  });

  it('导航栏按黑名单、好友在线状态和空态优先投影', () => {
    expect(getContactProfileNavbarState('friend', true, true))
      .toEqual({ kind: 'blacklist' });
    expect(getContactProfileNavbarState('friend', false, true))
      .toEqual({ kind: 'presence', online: true });
    expect(getContactProfileNavbarState('friend', false, false))
      .toEqual({ kind: 'presence', online: false });
    expect(getContactProfileNavbarState('stranger', false, true))
      .toEqual({ kind: 'none' });
    expect(getContactProfileNavbarState('friend', false, null))
      .toEqual({ kind: 'none' });
  });

  it('只为明确性别值显示标签', () => {
    expect(getContactProfileGenderLabel(1)).toBe('男');
    expect(getContactProfileGenderLabel(2)).toBe('女');
    expect(getContactProfileGenderLabel(0)).toBe('');
  });

  it('格式化可解析时间并保留异常原文', () => {
    expect(formatContactProfileAddedAt('2026-08-01T00:00:00Z')).toMatch(/^2026-08-0[1-2]$/);
    expect(formatContactProfileAddedAt('未知时间')).toBe('未知时间');
    expect(formatContactProfileAddedAt(' ')).toBe('');
  });

  it('编码联系人 ID 并生成资料和申请子路由', () => {
    expect(buildContactProfileRoute(' user/a ')).toBe('/contacts/users/user%2Fa');
    expect(buildContactFriendApplicationRoute('user/a'))
      .toBe('/contacts/users/user%2Fa/add');
  });

  it('只接受群成员和联系人域内的资料返回路由', () => {
    expect(resolveContactProfileBackHref({
      backHref: '/conversations/group%2F1/settings/members',
    })).toBe('/conversations/group%2F1/settings/members');
    expect(resolveContactProfileBackHref({
      backHref: '/conversations/group%2F1/settings',
    })).toBe('/conversations/group%2F1/settings');
    expect(resolveContactProfileBackHref({
      backHref: '/conversations/group%2F1',
    })).toBe('/conversations/group%2F1');
    expect(resolveContactProfileBackHref({ backHref: '/contacts/search' }))
      .toBe('/contacts/search');
    expect(resolveContactProfileBackHref({ backHref: '/scan' })).toBe('/scan');
    expect(resolveContactProfileBackHref({ backHref: 'https://example.test' }))
      .toBe('/contacts');
    expect(resolveContactProfileBackHref(null)).toBe('/contacts');
  });

  it('只把群会话 ID 作为后续 shared facade 校验候选', () => {
    expect(readContactProfileGroupConversationID({ groupConversationID: ' group-1 ' }))
      .toBe('group-1');
    expect(readContactProfileGroupConversationID({ groupConversationID: 1 })).toBe('');
    expect(readContactProfileGroupConversationID(null)).toBe('');
  });

  it('群上下文校验期间和失败时 fail-closed，只有明确关闭互加才限制已校验成员', () => {
    expect(getContactProfileGroupPresentation('friend', {
      status: 'loading', displayName: '',
    })).toEqual({ restricted: true, notice: '' });
    expect(getContactProfileGroupPresentation('stranger', {
      status: 'error', displayName: '',
    })).toEqual({ restricted: true, notice: '群成员资料暂不可用' });
    expect(getContactProfileGroupPresentation('friend', {
      status: 'ready', displayName: '群昵称', allowMemberAddFriend: false,
    })).toEqual({ restricted: true, notice: '已是群成员' });
    expect(getContactProfileGroupPresentation('friend', {
      status: 'ready', displayName: '群昵称', allowMemberAddFriend: true,
    })).toEqual({ restricted: false, notice: '' });
    expect(getContactProfileGroupPresentation('self', {
      status: 'error', displayName: '',
    })).toEqual({ restricted: false, notice: '' });
  });
});
