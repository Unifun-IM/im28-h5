import { describe, expect, it } from 'vitest';

import chatRoutesSource from '../../app/AppChatRoutes.tsx?raw';
import coreRoutesSource from '../../app/AppCoreRoutes.tsx?raw';
import displaySource from './QRCodeDisplay.tsx?raw';
import providerSource from './QRCodeModalProvider.tsx?raw';
import pageSource from './QRCodeSharePage.tsx?raw';
import pickerSource from '../../components/chat-target-picker/ChatTargetPickerModal.tsx?raw';
import shareProviderSource from '../share/ChatShareModalProvider.tsx?raw';

/** 应用内二维码分享回归禁止页面绕开共享目标和消息 owners。 */
describe('QR code in-app share route', () => {
  it('个人与群二维码都进入可刷新的 React Router 分享页', () => {
    expect(coreRoutesSource).toContain('path="/me/qrcode/share"');
    expect(chatRoutesSource).toContain('path="/conversations/:conversationID/settings/qrcode/share"');
    expect(displaySource).toContain('onClick={props.onShare}');
  });

  it('确认后复用根级目标弹窗和 SDK 媒体群发，不携带 Blob 路由状态', () => {
    expect(pageSource).not.toContain('<ChatTargetPickerModal');
    expect(pageSource).toContain('useChatShareModal');
    expect(shareProviderSource).toContain('<ChatTargetPickerModal');
    expect(pickerSource).toContain('loadChatForwardTargets');
    expect(shareProviderSource).toContain('messageBroadcast.sendImage');
    expect(shareProviderSource).toContain('width: 320');
    expect(pageSource).not.toContain('loadChatForwardTargets');
    expect(pageSource).not.toContain('resolveChatForwardTargetConversationID');
    expect(pageSource).toContain('readQRCodeShareBackHref(location.state');
    expect(pageSource).not.toContain('gatewayClient');
    expect(pageSource).not.toContain('sendImageMessage');
    expect(shareProviderSource).toContain('selectionMode="single"');
    expect(shareProviderSource).toContain("allowedKinds={['friend', 'group']}");
  });

  it('个人与群二维码共用全局模态展示 owner', () => {
    expect(providerSource).toContain('<QRCodeDisplay');
    expect(displaySource).toContain('<InteractionModal');
    expect(displaySource).toContain('className="rn-qr-display-modal"');
    expect(displaySource).not.toContain('className="rn-qr-display-page"');
  });

  it('下载与发送结果通过全局 Toast 呈现', () => {
    expect(displaySource).toContain("toast.success('二维码已下载')");
    expect(displaySource).toContain('toast.error(');
    expect(shareProviderSource).toContain("toast.success('二维码已发送')");
  });
});
