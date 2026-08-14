import { describe, expect, it } from 'vitest';

import appSource from '../../app/App.tsx?raw';
import displaySource from './QRCodeDisplay.tsx?raw';
import pageSource from './QRCodeSharePage.tsx?raw';
import pickerSource from '../../components/chat-target-picker/ChatTargetPickerModal.tsx?raw';

/** 应用内二维码分享回归禁止页面绕开共享目标和消息 owners。 */
describe('QR code in-app share route', () => {
  it('个人与群二维码都进入可刷新的 React Router 分享页', () => {
    expect(appSource).toContain('path="/me/qrcode/share"');
    expect(appSource).toContain('path="/conversations/:conversationID/settings/qrcode/share"');
    expect(displaySource).toContain('onClick={props.onShare}');
  });

  it('确认后复用统一目标弹窗和 SDK 媒体群发，不携带 Blob 路由状态', () => {
    expect(pageSource).toContain('<ChatTargetPickerModal');
    expect(pickerSource).toContain('loadChatForwardTargets');
    expect(pageSource).toContain('messageBroadcast.sendImage');
    expect(pageSource).toContain('width: 320');
    expect(pageSource).not.toContain('loadChatForwardTargets');
    expect(pageSource).not.toContain('resolveChatForwardTargetConversationID');
    expect(pageSource).not.toContain('location.state');
    expect(pageSource).not.toContain('gatewayClient');
    expect(pageSource).not.toContain('sendImageMessage');
    expect(pageSource).toContain('selectionMode="single"');
    expect(pageSource).toContain("allowedKinds={['friend']}");
  });

  it('个人与群二维码共用全局模态展示 owner', () => {
    expect(displaySource).toContain('<InteractionModal');
    expect(displaySource).toContain('className="rn-qr-display-modal"');
    expect(displaySource).not.toContain('className="rn-qr-display-page"');
  });
});
