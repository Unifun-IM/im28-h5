import { describe, expect, it } from 'vitest';

import appSource from '../../app/App.tsx?raw';
import broadcastSource from '../../pages/broadcast/BroadcastTargetSelectPage.tsx?raw';
import chatSource from '../../pages/chat/ChatPage.tsx?raw';
import contactCardSource from '../../pages/contacts/ContactCardSharePage.tsx?raw';
import groupCardSource from '../../pages/chat/GroupCardSharePage.tsx?raw';
import qrSource from '../../pages/qr/QRCodeSharePage.tsx?raw';

/** 结构回归阻止好友/群聊选择再次分裂为多个页面实现。 */
describe('chat target picker consumer contract', () => {
  it('uses the shared modal for every send or share target flow', () => {
    for (const source of [broadcastSource, chatSource, contactCardSource, groupCardSource, qrSource]) {
      expect(source).toContain('<ChatTargetPickerModal');
    }
  });

  it('聊天转发和名片共用同一弹窗的多选与单选模式', () => {
    expect(chatSource.match(/<ChatTargetPickerModal/g)).toHaveLength(2);
    expect(chatSource).toContain('selectionMode="multiple"');
    expect(chatSource).toContain('selectionMode="single"');
    expect(chatSource).not.toContain('ChatCardPickerDialog');
  });

  it('名片和二维码分享只允许单选好友目标', () => {
    for (const source of [contactCardSource, groupCardSource, qrSource]) {
      expect(source).toContain('selectionMode="single"');
      expect(source).toContain("allowedKinds={['friend']}");
      expect(source).not.toContain('IM_BROADCAST_MAX_TARGETS');
      expect(source).not.toContain('selectionMode="multiple"');
    }
  });

  it('keeps the legacy path redirect-only without restoring a target page', () => {
    expect(appSource).not.toContain('ChatForwardTargetPage');
    expect(appSource).toContain('path="/conversations/:conversationID/forward"');
    expect(appSource).toContain('element={<ChatForwardCompatibilityRedirect />}');
  });
});
