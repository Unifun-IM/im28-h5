import { describe, expect, it } from 'vitest';

import chatRoutesSource from '../../app/AppChatRoutes.tsx?raw';
import broadcastSource from '../../pages/broadcast/BroadcastTargetSelectPage.tsx?raw';
import chatSource from '../../pages/chat/ChatPage.tsx?raw';
import chatSurfaceSource from '../../pages/chat/ChatPageSurface.tsx?raw';
import contactCardSource from '../../pages/contacts/ContactCardSharePage.tsx?raw';
import groupCardSource from '../../pages/chat/GroupCardSharePage.tsx?raw';
import qrSource from '../../pages/qr/QRCodeSharePage.tsx?raw';
import shareProviderSource from '../../pages/share/ChatShareModalProvider.tsx?raw';

/** 结构回归阻止好友/群聊选择再次分裂为多个页面实现。 */
describe('chat target picker consumer contract', () => {
  it('uses the shared modal for every send or share target flow', () => {
    for (const source of [broadcastSource, chatSurfaceSource, shareProviderSource]) {
      expect(source).toContain('<ChatTargetPickerModal');
    }
    for (const compatibilityPage of [contactCardSource, groupCardSource, qrSource]) {
      expect(compatibilityPage).not.toContain('<ChatTargetPickerModal');
      expect(compatibilityPage).toContain('useChatShareModal');
    }
  });

  it('聊天转发和名片共用同一弹窗且都只选择一个目标', () => {
    expect(chatSource).toContain('<ChatPageSurface');
    expect(chatSurfaceSource.match(/<ChatTargetPickerModal/g)).toHaveLength(2);
    expect(chatSurfaceSource.match(/selectionMode="single"/g)).toHaveLength(2);
    expect(chatSurfaceSource).not.toContain('selectionMode="multiple"');
    expect(chatSurfaceSource).toContain('forwardFlow.continueForwardToTarget(targets)');
    expect(chatSurfaceSource).not.toContain('ChatCardPickerDialog');
  });

  it('名片和二维码由根级弹窗统一单选好友或群聊', () => {
    expect(shareProviderSource).toContain('selectionMode="single"');
    expect(shareProviderSource).toContain("allowedKinds={['friend', 'group']}");
    expect(shareProviderSource).toContain('messageBroadcast.sendCard');
    expect(shareProviderSource).toContain('messageBroadcast.sendImage');
    expect(shareProviderSource).not.toContain('selectionMode="multiple"');
  });

  it('keeps the legacy path redirect-only without restoring a target page', () => {
    expect(chatRoutesSource).not.toContain('ChatForwardTargetPage');
    expect(chatRoutesSource).toContain('path="/conversations/:conversationID/forward"');
    expect(chatRoutesSource).toContain('element={<ChatForwardCompatibilityRedirect />}');
  });
});
