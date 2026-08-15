import { describe, expect, it } from 'vitest';

import profilePageSource from './ContactProfilePage.tsx?raw';
import profileActionsSource from './useContactProfileActions.ts?raw';
import profileSurfaceSource from './ContactProfileSurface.tsx?raw';

/** 联系人资料页必须保持薄展示层，所有外部动作统一委托 action Hook。 */
describe('contact profile action owner', () => {
  it('页面只消费唯一 action owner', () => {
    expect(profilePageSource).toContain('useContactProfileActions({');
    expect(profilePageSource).toContain('actions.openConversation()');
    expect(profilePageSource).toContain('actions.startCall(mediaType)');
    expect(profileSurfaceSource).toContain("onStartCall('audio')");
    expect(profilePageSource).toContain('actions.updateBlacklist()');
    expect(profilePageSource).toContain('actions.deleteFriend(scope)');
    expect(profilePageSource).not.toContain('.contacts.updateFriendStar(');
    expect(profilePageSource).not.toContain('.contacts.updateFriendRemark(');
    expect(profilePageSource).not.toContain('.contacts.setBlacklist(');
    expect(profilePageSource).not.toContain('.contacts.deleteFriend(');
    expect(profilePageSource).not.toContain('copyUserIDToClipboard(');
    expect(profilePageSource).not.toContain('callOwner.startOutgoing(');
  });

  it('动作 Hook 继续复用 shared facade 与全局平台 owner', () => {
    expect(profileActionsSource).toContain('.openConversation(options.profile.userID)');
    expect(profileActionsSource).toContain('.contacts.updateFriendStar(');
    expect(profileActionsSource).toContain('.contacts.updateFriendRemark(');
    expect(profileActionsSource).toContain('.contacts.setBlacklist(');
    expect(profileActionsSource).toContain('.contacts.deleteFriend({');
    expect(profileActionsSource).toContain('await copyUserIDToClipboard(');
    expect(profileActionsSource).toContain('await callOwner.startOutgoing({');
  });
});
