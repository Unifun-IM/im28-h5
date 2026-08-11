import { describe, expect, it } from 'vitest';

import {
  getIllustratedPresetEmojiAsset,
  ILLUSTRATED_PRESET_EMOJI_ASSETS,
} from './illustrated-preset-emoji-assets.js';

// 浏览器资源 contract 锁定 RN 镜像数量和双重身份解析。
describe('illustrated preset emoji assets', () => {
  /** 验证 135 个共享描述均存在可构建的本地 PNG。 */
  it('binds every shared descriptor to a browser asset', () => {
    expect(ILLUSTRATED_PRESET_EMOJI_ASSETS).toHaveLength(135);
    expect(
      ILLUSTRATED_PRESET_EMOJI_ASSETS.every(item => Boolean(item.assetURL)),
    ).toBe(true);
  });

  /** 验证重复 Unicode 仍按 presetID 得到不同资源。 */
  it('keeps duplicate unicode identities distinct', () => {
    /** framedPicture 是第一张画框身份。 */
    const framedPicture = getIllustratedPresetEmojiAsset(
      'im28-preset-v1',
      'framed-picture',
    );
    /** wallPainting 是相同 Unicode 的另一张资源身份。 */
    const wallPainting = getIllustratedPresetEmojiAsset(
      'im28-preset-v1',
      'painting-on-the-wall',
    );
    expect(framedPicture?.unicode).toBe('🖼️');
    expect(wallPainting?.unicode).toBe('🖼️');
    expect(framedPicture?.assetURL).not.toBe(wallPainting?.assetURL);
    expect(getIllustratedPresetEmojiAsset('unknown-pack', 'framed-picture')).toBeUndefined();
  });
});
