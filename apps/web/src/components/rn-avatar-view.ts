/** RN 头像 fallback 使用的稳定渐变色表。 */
const RN_AVATAR_COLOR_PAIRS = [
  ['#D98AF2', '#C94EE4'],
  ['#65CCF4', '#2698ED'],
  ['#4BDFD1', '#20BEB6'],
  ['#9BDF78', '#35C565'],
  ['#FFC968', '#FF9850'],
  ['#FF9A91', '#F46575'],
  ['#8EA1FF', '#596EEB'],
  ['#F7A0D4', '#E561B1'],
] as const;

/** 提取头像首个中文、字母或数字字符。 */
export function getRNAvatarInitial(label: string, fallback = '?'): string {
  for (const character of Array.from(label)) {
    if (/^[\u3400-\u9FFF]$/.test(character)) {
      return character;
    }
    if (/^[A-Za-z]$/.test(character)) {
      return character.toUpperCase();
    }
    if (/^[0-9]$/.test(character)) {
      return character;
    }
  }
  return fallback;
}

/** 按 RN FNV-1a 规则为稳定身份生成头像渐变。 */
export function getRNAvatarGradient(identity: string): string {
  // key 确保空身份仍能稳定映射到首个颜色对。
  const key = identity.trim();
  // hash 与 RN avatar helper 使用相同初始值和乘数。
  let hash = 2166136261;
  for (let index = 0; index < key.length; index += 1) {
    hash ^= key.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  // pair 从同一八色表按无符号 hash 选择。
  const pair =
    RN_AVATAR_COLOR_PAIRS[(hash >>> 0) % RN_AVATAR_COLOR_PAIRS.length] ??
    RN_AVATAR_COLOR_PAIRS[0];
  return `linear-gradient(135deg, ${pair[0]} 7%, ${pair[1]} 96%)`;
}
