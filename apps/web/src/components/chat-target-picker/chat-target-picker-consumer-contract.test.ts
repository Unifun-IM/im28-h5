import { describe, expect, it } from 'vitest';

import chatRoutesSource from '../../app/AppChatRoutes.tsx?raw';
import broadcastSource from '../../pages/broadcast/BroadcastTargetSelectPage.tsx?raw';
import chatSource from '../../pages/chat/ChatPage.tsx?raw';
import chatSurfaceSource from '../../pages/chat/ChatPageSurface.tsx?raw';
import contactCardSource from '../../pages/contacts/ContactCardSharePage.tsx?raw';
import groupCardSource from '../../pages/chat/GroupCardSharePage.tsx?raw';
import qrSource from '../../pages/qr/QRCodeSharePage.tsx?raw';

/** 结构回归阻止好友/群聊选择再次分裂为多个页面实现。 */
describe('chat target picker consumer contract', () => {
  it('uses the shared modal for every send or share target flow', () => {
    for (const source of [broadcastSource, chatSurfaceSource, contactCardSource, groupCardSource, qrSource]) {
      expect(source).toContain('<ChatTargetPickerModal');
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

  it('名片和二维码分享只允许单选好友目标', () => {
    for (const source of [contactCardSource, groupCardSource, qrSource]) {
      expect(source).toContain('selectionMode="single"');
      expect(source).toContain("allowedKinds={['friend']}");
      expect(source).not.toContain('IM_BROADCAST_MAX_TARGETS');
      expect(source).not.toContain('selectionMode="multiple"');
      expect(source).toContain("toast.success('");
    }
  });

  it('keeps the legacy path redirect-only without restoring a target page', () => {
    expect(chatRoutesSource).not.toContain('ChatForwardTargetPage');
    expect(chatRoutesSource).toContain('path="/conversations/:conversationID/forward"');
    expect(chatRoutesSource).toContain('element={<ChatForwardCompatibilityRedirect />}');
  });
});
