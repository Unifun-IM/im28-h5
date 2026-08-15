import { describe, expect, it } from 'vitest';

import contactsPageSource from './ContactsPage.tsx?raw';
import contactsActionsSource from './useContactsPageActions.ts?raw';

/** 通讯录页必须保持列表 owner，外部动作统一委托 action Hook。 */
describe('contacts page action owner', () => {
  it('页面只消费唯一 action owner', () => {
    expect(contactsPageSource).toContain('useContactsPageActions({');
    expect(contactsPageSource).toContain('actions.openContactActions');
    expect(contactsPageSource).toContain('actions.startContactCall(mediaType)');
    expect(contactsPageSource).toContain('actions.deleteContact(scope)');
    expect(contactsPageSource).not.toContain('.peerProfile.openConversation(');
    expect(contactsPageSource).not.toContain('.contacts.deleteFriend(');
    expect(contactsPageSource).not.toContain('callOwner.startOutgoing(');
  });

  it('动作 Hook 继续复用 shared facade 与全局通话 owner', () => {
    expect(contactsActionsSource).toContain('.openConversation(contact.userID)');
    expect(contactsActionsSource).toContain('.contacts.deleteFriend({');
    expect(contactsActionsSource).toContain('await callOwner.startOutgoing({');
    expect(contactsActionsSource).toContain('shareModal.openShare({');
    expect(contactsActionsSource).toContain("kind: 'user-card'");
  });
});
