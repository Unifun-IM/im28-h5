import { pinyin } from 'pinyin-pro';

/** 仅允许联系人索引落入 RN 右侧字母栏。 */
const ALPHABET_INDEX_PATTERN = /^[A-Z]$/;

/** 按 RN 同一拼音参数把显示名称映射为字母索引，其他字符统一归入井号。 */
export function getContactIndexKey(displayName: string): string {
  /** normalizedName 去除不参与索引判断的首尾空白。 */
  const normalizedName = displayName.trim();
  if (!normalizedName) return '#';

  /** firstCharacter 让拉丁名称无需进入拼音转换。 */
  const firstCharacter = normalizedName.charAt(0).toUpperCase();
  if (ALPHABET_INDEX_PATTERN.test(firstCharacter)) return firstCharacter;

  /** firstPinyinLetter 复刻 RN 的姓氏优先和非中文连续处理语义。 */
  const firstPinyinLetter = pinyin(normalizedName, {
    pattern: 'first',
    toneType: 'none',
    separator: '',
    mode: 'surname',
    surname: 'head',
    nonZh: 'consecutive',
  })
    .trim()
    .charAt(0)
    .toUpperCase();

  return ALPHABET_INDEX_PATTERN.test(firstPinyinLetter) ? firstPinyinLetter : '#';
}

/** 按 RN 同一拼音参数生成成员或联系人排序键。 */
export function getContactSortKey(displayName: string): string {
  /** normalizedName 避免空白参与排序并保持稳定空值。 */
  const normalizedName = displayName.trim();
  if (!normalizedName) return '';
  return pinyin(normalizedName, {
    toneType: 'none',
    separator: '',
    mode: 'surname',
    surname: 'head',
    nonZh: 'consecutive',
  }).toLocaleLowerCase();
}

/** 复刻 RN 联系人与群成员列表的拼音优先排序。 */
export function compareContactIndexedNames(left: string, right: string): number {
  /** sortResult 优先比较规范化拼音，再用中文原文稳定消歧。 */
  const sortResult = getContactSortKey(left).localeCompare(getContactSortKey(right));
  return sortResult || left.localeCompare(right, 'zh-Hans-CN');
}
