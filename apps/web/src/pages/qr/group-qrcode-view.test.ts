import { describe, expect, it } from 'vitest';

import appSource from '../../app/App.tsx?raw';
import chatRoutesSource from '../../app/AppChatRoutes.tsx?raw';
import profileSource from '../chat/GroupProfilePage.tsx?raw';
import providerSource from './QRCodeModalProvider.tsx?raw';

describe('group QR code global modal', () => {
  it('群资料入口直接打开根级底部弹窗，旧地址只做兼容跳转', () => {
    expect(appSource).toContain('<QRCodeModalProvider>');
    expect(chatRoutesSource).toContain('path="/conversations/:conversationID/settings/qrcode"');
    expect(chatRoutesSource).toContain('path="/conversations/:conversationID/settings/qrcode/share"');
    expect(chatRoutesSource).toContain('<GroupQRCodeCompatibilityRedirect />');
    expect(profileSource).toContain('openGroupQRCode(conversationID)');
    expect(profileSource).toContain('群二维码');
  });

  it('全局弹窗只消费 shared 群 payload 与群资料 source owner', () => {
    expect(providerSource).toContain('buildIM28GroupQRCodePayload(view.groupID)');
    expect(providerSource).toContain('loadGroupProfileSource');
    expect(providerSource).toContain('className="rn-qr-display-modal"');
    expect(providerSource).not.toContain('JSON.stringify');
    expect(providerSource).not.toContain('gatewayClient');
  });
});
