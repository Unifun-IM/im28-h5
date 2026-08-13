import { describe, expect, it } from 'vitest';

import { AVATAR_ALBUM_INPUT, AVATAR_CAMERA_INPUT, buildAvatarUpload } from './avatar-upload.js';

describe('avatar upload view contract', () => {
  it('keeps separate album and environment-camera input contracts', () => {
    expect(AVATAR_ALBUM_INPUT).toEqual({ accept: 'image/jpeg,image/png,image/webp' });
    expect(AVATAR_CAMERA_INPUT).toEqual({ accept: 'image/*', capture: 'environment' });
  });

  it('builds only cropped JPEG upload metadata for the current account', () => {
    // blob 模拟共享裁剪组件确认后的 512x512 JPEG。
    const blob = new Blob(['avatar'], { type: 'image/jpeg' });
    expect(buildAvatarUpload(' user-1 ', blob)).toEqual({
      source: blob,
      name: 'user-user-1.jpg',
      mimeType: 'image/jpeg',
      size: blob.size,
      extension: 'jpg',
    });
    expect(() => buildAvatarUpload(' ', blob)).toThrow('头像上传缺少当前账号');
  });
});
