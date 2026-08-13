import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { AvatarSourceActionSheet } from './AvatarSourceActionSheet.js';

/** 共享头像来源层必须保持 RN 三动作并且不携带远端业务。 */
describe('AvatarSourceActionSheet', () => {
  it('renders album, camera and cancel actions', () => {
    // markup 只验证平台选择层的稳定可访问语义。
    const markup = renderToStaticMarkup(
      <AvatarSourceActionSheet
        visible
        onAlbum={vi.fn()}
        onCamera={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    expect(markup).toContain('aria-label="选择头像来源"');
    expect(markup).toContain('从相册选一张');
    expect(markup).toContain('拍一张照片');
    expect(markup).toContain('取消');
    expect(markup).not.toContain('runtime');
  });
});
