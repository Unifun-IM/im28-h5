import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { CallTypeActionSheet } from './CallTypeActionSheet.js';

/** 通话选择层必须保持 RN 两种方式和明确取消语义。 */
describe('CallTypeActionSheet', () => {
  it('renders audio and video choices for the selected peer', () => {
    /** markup 验证共享弹层不携带任何通话业务或凭据。 */
    const markup = renderToStaticMarkup(
      <CallTypeActionSheet
        open
        peerName="donk二大爷"
        pending={false}
        onClose={vi.fn()}
        onSelect={vi.fn()}
      />,
    );

    expect(markup).toContain('aria-label="与donk二大爷音视频通话"');
    expect(markup).toContain('语音通话');
    expect(markup).toContain('视频通话');
    expect(markup).toContain('取消音视频通话');
  });

  it('disables every action while call startup is pending', () => {
    /** markup 验证 pending 期间不会重复启动或关闭。 */
    const markup = renderToStaticMarkup(
      <CallTypeActionSheet
        open
        peerName="donk二大爷"
        pending
        onClose={vi.fn()}
        onSelect={vi.fn()}
      />,
    );

    expect(markup.match(/disabled=""/g)).toHaveLength(3);
  });
});
