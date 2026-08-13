import { describe, expect, it } from 'vitest';

import type { WebIMContact } from '@im28/im-sdk/web';
import {
  buildCreateGroupCandidates,
  canSubmitCreateGroup,
  isGroupCreationRemoteCompletedError,
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
  });

  it('locks replay after Gateway handled creation without complete identities', () => {
    expect(isGroupCreationRemoteCompletedError({
      code: 'GROUP_CREATE_REMOTE_IDENTITY_INCOMPLETE',
    })).toBe(true);
    expect(isGroupCreationRemoteCompletedError(new Error('network failed'))).toBe(false);
  });
});
