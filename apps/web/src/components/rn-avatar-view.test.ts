import { describe, expect, it } from 'vitest';

import {
  getRNAvatarAccentColor,
  getRNAvatarGradient,
} from './rn-avatar-view.js';

describe('RN avatar view', () => {
  it('按 RN FNV-1a 色板为头像与消息身份生成同一强调色', () => {
    expect(getRNAvatarAccentColor('user-1')).toBe('#FF9850');
    expect(getRNAvatarAccentColor('user-2')).toBe('#F46575');
    expect(getRNAvatarGradient('user-2')).toBe(
      'linear-gradient(135deg, #FF9A91 7%, #F46575 96%)',
    );
  });

  it('空身份稳定回退 RN 色板首项', () => {
    expect(getRNAvatarAccentColor(' ')).toBe('#C94EE4');
    expect(getRNAvatarGradient('')).toBe(
      'linear-gradient(135deg, #D98AF2 7%, #C94EE4 96%)',
    );
  });
});
