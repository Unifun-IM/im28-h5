import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { IncomingCallOverlay, type IncomingCallOverlayProps } from './IncomingCallOverlay.js';

/** 创建不执行外部动作的来电展示输入。 */
function createProps(overrides: Partial<IncomingCallOverlayProps> = {}): IncomingCallOverlayProps {
  return {
    visible: true,
    peerName: 'donk二大爷',
    peerAvatarURL: '',
    mediaType: 'video',
    displayMode: 'banner',
    accepting: false,
    rejecting: false,
    toneBlocked: false,
    error: null,
    onAccept: vi.fn(),
    onReject: vi.fn(),
    onIgnore: vi.fn(),
    onOpen: vi.fn(),
    onResumeTone: vi.fn(),
    ...overrides,
  };
}

describe('IncomingCallOverlay', () => {
  it('横幅展示来电人、媒体类型与三种动作', () => {
    /** markup 验证 RN 同语义横幅结构。 */
    const markup = renderToStaticMarkup(<IncomingCallOverlay {...createProps()} />);

    expect(markup).toContain('donk二大爷');
    expect(markup).toContain('邀请你视频通话...');
    expect(markup).toContain('忽略');
    expect(markup).toContain('aria-label="拒绝通话"');
    expect(markup).toContain('aria-label="接听通话"');
  });

  it('全屏来电在浏览器阻止自动播放时展示恢复铃声', () => {
    /** markup 验证用户手势恢复入口不隐藏接听和拒绝。 */
    const markup = renderToStaticMarkup(<IncomingCallOverlay {...createProps({ displayMode: 'fullscreen', toneBlocked: true })} />);

    expect(markup).toContain('role="dialog"');
    expect(markup).toContain('恢复铃声');
    expect(markup).toContain('aria-label="拒绝"');
    expect(markup).toContain('aria-label="接听"');
  });

  it('不可见状态不留下全局遮罩', () => {
    /** markup 必须为空，避免登录页或主页面被透明层阻断。 */
    const markup = renderToStaticMarkup(<IncomingCallOverlay {...createProps({ visible: false })} />);

    expect(markup).toBe('');
  });
});
