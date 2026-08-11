import {
  ILLUSTRATED_PRESET_EMOJIS,
  ILLUSTRATED_PRESET_EMOJI_PACK_ID,
  type PresetEmojiDescriptor,
} from '@im28/im-sdk/web';

/** 浏览器插画表情项绑定共享身份和 Vite 资源 URL。 */
export interface IllustratedPresetEmojiAsset extends PresetEmojiDescriptor {
  readonly assetURL: string | undefined;
}

/** Vite 在构建期收集 RN 同源的 135 个 PNG，不在运行时拼接 URL。 */
const ILLUSTRATED_PRESET_EMOJI_ASSET_MODULES = import.meta.glob<string>(
  '../../assets/rn/assets/emoji/figma-pack-2/*.png',
  { eager: true, import: 'default', query: '?url' },
);

/** 按三位资源序号建立 URL 索引，序号与共享描述列表顺序一一对应。 */
const ILLUSTRATED_PRESET_EMOJI_URL_BY_INDEX = new Map<number, string>(
  Object.entries(ILLUSTRATED_PRESET_EMOJI_ASSET_MODULES).flatMap(
    ([path, assetURL]) => {
      /** filename 是 glob 路径中的最终资源名。 */
      const filename = path.split('/').at(-1) ?? '';
      /** match 只接受 RN 资源约定的三位稳定序号。 */
      const match = /^(\d{3})-/.exec(filename);
      return match ? [[Number(match[1]), assetURL] as const] : [];
    },
  ),
);

/** H5 插画表情清单保留 SDK 顺序，并通过序号绑定镜像 PNG。 */
export const ILLUSTRATED_PRESET_EMOJI_ASSETS: readonly IllustratedPresetEmojiAsset[] =
  ILLUSTRATED_PRESET_EMOJIS.map((descriptor, index) => ({
    ...descriptor,
    assetURL: ILLUSTRATED_PRESET_EMOJI_URL_BY_INDEX.get(index + 1),
  }));

/** 双重身份索引禁止从可能重复的 Unicode 反推资源。 */
const ILLUSTRATED_PRESET_EMOJI_ASSET_BY_ID = new Map(
  ILLUSTRATED_PRESET_EMOJI_ASSETS.map(item => [item.presetID, item]),
);

/** 按 packID 与 presetID 解析浏览器资源，未知包直接降级。 */
export function getIllustratedPresetEmojiAsset(
  packID: string,
  presetID: string,
): IllustratedPresetEmojiAsset | undefined {
  if (packID !== ILLUSTRATED_PRESET_EMOJI_PACK_ID) return undefined;
  return ILLUSTRATED_PRESET_EMOJI_ASSET_BY_ID.get(presetID);
}
