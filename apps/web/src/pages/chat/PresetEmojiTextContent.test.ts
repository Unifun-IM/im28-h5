import { describe, expect, it } from 'vitest';
import type { PresetEmojiEntity } from '@im28/im-sdk/web';

import {
  buildPresetEmojiTextSegments,
  isSinglePresetEmojiText,
} from './PresetEmojiTextContent.js';

/** 构造一个指向内置 sunglasses 资源的合法实体。 */
function createSunglassesEntity(offset: number): PresetEmojiEntity {
  return {
    type: 'preset_emoji',
    offset,
    length: '😎'.length,
    packID: 'im28-preset-v1',
    presetID: 'smiling-face-with-sunglasses',
  };
}

// Web 文本投影 contract 锁定合法替换和所有失败场景的 Unicode 降级。
describe('preset emoji text projection', () => {
  /** 验证普通文本与一个合法 PNG 按 UTF-16 顺序混排。 */
  it('splits mixed text around a valid preset entity', () => {
    /** segments 是“前 + 😎 + 后”的三段投影。 */
    const segments = buildPresetEmojiTextSegments(
      '前😎后',
      [createSunglassesEntity(1)],
    );
    expect(segments.map(segment => segment.kind)).toEqual([
      'text',
      'preset_emoji',
      'text',
    ]);
    expect(segments[1]).toMatchObject({
      kind: 'preset_emoji',
      fallback: '😎',
    });
  });

  /** 验证身份未知或 fallback 错配时原样保留 Unicode。 */
  it('falls back to unicode for unknown or mismatched identities', () => {
    /** unknownEntity 使用未注册 pack。 */
    const unknownEntity = {
      ...createSunglassesEntity(0),
      packID: 'unknown-pack',
    };
    /** mismatchedEntity 身份与正文 Unicode 不一致。 */
    const mismatchedEntity = createSunglassesEntity(0);
    expect(buildPresetEmojiTextSegments('😎', [unknownEntity])).toEqual([
      { kind: 'text', key: 'text-0', text: '😎' },
    ]);
    expect(buildPresetEmojiTextSegments('😊', [mismatchedEntity])).toEqual([
      { kind: 'text', key: 'text-0', text: '😊' },
    ]);
  });

  /** 验证只有完整覆盖正文的合法实体才启用 60px 模式。 */
  it('detects only a fully covered renderable entity as large emoji', () => {
    expect(isSinglePresetEmojiText('😎', [createSunglassesEntity(0)])).toBe(true);
    expect(isSinglePresetEmojiText(`A😎`, [createSunglassesEntity(1)])).toBe(false);
  });
});
