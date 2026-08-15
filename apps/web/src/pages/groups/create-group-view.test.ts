import { describe, expect, it } from 'vitest';

import type { WebIMContact } from '@im28/im-sdk/web';
import {
  buildCreateGroupMemberUserIDs,
  buildCreateGroupCandidates,
  buildSelectedCreateGroupCandidates,
  canSubmitCreateGroup,
  isGroupCreationRemoteCompletedError,
  resolveSingleChatCreateGroupPeer,
  toggleCreateGroupMemberSelection,
  updateVisibleCreateGroupMemberSelection,
} from './create-group-view.js';

/** 创建确定性的好友候选。 */
function createContact(userID: string, displayName: string): WebIMContact {
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

describe('create group view', () => {
  it('filters shared contacts by display name and stable user ID', () => {
    /** contacts 保持 SDK 顺序，页面只执行本地筛选。 */
    const contacts = [createContact('u-1', 'donk二大爷'), createContact('u-2', 'Robin')];
    expect(buildCreateGroupCandidates(contacts, '二大爷').map(item => item.contact.userID))
      .toEqual(['u-1']);
    expect(buildCreateGroupCandidates(contacts, 'u-2').map(item => item.displayName))
      .toEqual(['Robin']);
  });

  it('uses the shared RN member-count rule for submit state', () => {
    expect(canSubmitCreateGroup(new Set(['u-1']))).toBe(false);
    expect(canSubmitCreateGroup(new Set(['u-1', 'u-2']))).toBe(true);
    expect(canSubmitCreateGroup(new Set(['u-2']), ['u-1'])).toBe(true);
    expect(buildCreateGroupMemberUserIDs(['u-2', 'u-1'], ['u-1']))
      .toEqual(['u-1', 'u-2']);
  });

  it('keeps selected friends in contact order and omits stale identities', () => {
    /** candidates 模拟当前账号刷新后的有效好友顺序。 */
    const candidates = buildCreateGroupCandidates([
      createContact('u-1', '一大爷'),
      createContact('u-2', '二大爷'),
      createContact('u-3', '三大爷'),
    ], '');
    expect(buildSelectedCreateGroupCandidates(
      candidates,
      new Set(['u-3', 'stale-user', 'u-1']),
    ).map(candidate => candidate.contact.userID)).toEqual(['u-1', 'u-3']);
  });

  it('preserves RN member toggle and visible-selection semantics', () => {
    /** selected 保存不可见成员，覆盖单聊筛选时保留和普通入口替换两种语义。 */
    const selected = new Set(['hidden', 'u-1']);
    expect([...toggleCreateGroupMemberSelection(selected, 'u-2', 0).selectedUserIDs])
      .toEqual(['hidden', 'u-1', 'u-2']);
    expect([...toggleCreateGroupMemberSelection(selected, 'u-1', 0).selectedUserIDs])
      .toEqual(['hidden']);
    expect([...updateVisibleCreateGroupMemberSelection(selected, ['u-1', 'u-2'], false, true)])
      .toEqual(['hidden', 'u-1', 'u-2']);
    expect([...updateVisibleCreateGroupMemberSelection(selected, ['u-1'], true, true)])
      .toEqual(['hidden']);
    expect([...updateVisibleCreateGroupMemberSelection(selected, ['u-2'], false, false)])
      .toEqual(['u-2']);
  });

  it('binds single-chat creation to the cached peer and excludes it from candidates', () => {
    /** conversations 覆盖合法单聊、群聊和本人错误目标。 */
    const conversations = [
      { conversationID: 'single-1', type: 'single' as const, targetID: 'u-1', unreadCount: 0, updatedAt: 1 },
      { conversationID: 'group-1', type: 'group' as const, targetID: 'g-1', unreadCount: 0, updatedAt: 1 },
      { conversationID: 'single-self', type: 'single' as const, targetID: 'self', unreadCount: 0, updatedAt: 1 },
    ];
    expect(resolveSingleChatCreateGroupPeer(conversations, 'single-1', 'self')).toBe('u-1');
    expect(resolveSingleChatCreateGroupPeer(conversations, 'group-1', 'self')).toBe('');
    expect(resolveSingleChatCreateGroupPeer(conversations, 'single-self', 'self')).toBe('');
    /** contacts 中的固定对端不会再次出现在可选网格。 */
    const contacts = [createContact('u-1', '固定对端'), createContact('u-2', '可选好友')];
    expect(buildCreateGroupCandidates(contacts, '', new Set(['u-1'])).map(item => item.contact.userID))
      .toEqual(['u-2']);
    expect(buildCreateGroupMemberUserIDs(['u-2'], ['u-1']))
      .toEqual(['u-1', 'u-2']);
  });

  it('locks replay after Gateway handled creation without complete identities', () => {
    expect(isGroupCreationRemoteCompletedError({
      code: 'GROUP_CREATE_REMOTE_IDENTITY_INCOMPLETE',
    })).toBe(true);
    expect(isGroupCreationRemoteCompletedError(new Error('network failed'))).toBe(false);
  });
});
