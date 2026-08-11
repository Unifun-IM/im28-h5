import type { PresetEmojiDescriptor } from './preset-emoji-types.js';
/** IM28 内置插画表情包的跨端稳定身份。 */
export declare const ILLUSTRATED_PRESET_EMOJI_PACK_ID = "im28-preset-v1";
/** 135 个插画表情的稳定身份与 Unicode 降级正文，顺序与产品资源一致。 */
export declare const ILLUSTRATED_PRESET_EMOJIS: readonly PresetEmojiDescriptor[];
/** 按双重身份解析共享描述，禁止从可能重复的 Unicode 反推资源身份。 */
export declare function getIllustratedPresetEmoji(packID: string, presetID: string): PresetEmojiDescriptor | undefined;
//# sourceMappingURL=illustrated-preset-emojis.d.ts.map