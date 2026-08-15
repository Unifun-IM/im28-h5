import { describe, expect, it } from 'vitest';

import chatRoutesSource from '../../app/AppChatRoutes.tsx?raw';
import profileSource from '../chat/GroupProfilePage.tsx?raw';
import pageSource from './GroupQRCodePage.tsx?raw';

describe('group QR code production route', () => {
  it('群资料入口进入可刷新的 React Router 子路由', () => {
    expect(chatRoutesSource).toContain('path="/conversations/:conversationID/settings/qrcode"');
    expect(chatRoutesSource).toContain('path="/conversations/:conversationID/settings/qrcode/share"');
    expect(profileSource).toContain('to={qrCodeURL}');
    expect(profileSource).toContain('群二维码');
  });

  it('页面只消费 shared 群 payload 与群资料 source owner', () => {
    expect(pageSource).toContain('buildIM28GroupQRCodePayload(view.groupID)');
    expect(pageSource).toContain('loadGroupProfileSource');
    expect(pageSource).not.toContain('JSON.stringify');
    expect(pageSource).not.toContain('gatewayClient');
    expect(pageSource).toContain('onShare={() => navigate(`${qrCodeURL}/share`)}');
  });
});
