/** 格式化语音或视频秒数。 */
export function formatDuration(value: number): string {
  if (value <= 0) return '';
  // seconds 仅保留非负整数。
  const seconds = Math.max(0, Math.round(value));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

/** 格式化文件字节大小。 */
export function formatFileSize(value: unknown): string {
  // size 同时兼容 uint64 string 和 number。
  const size = readNumber(value);
  if (size <= 0) return '';
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

/** 使用 RN 的短时钟格式呈现消息时间。 */
export function formatChatMessageTime(timestamp: number): string {
  if (!timestamp) return '';
  // date 同时兼容 Gateway 秒时间戳和本地毫秒时间戳。
  const date = new Date(toMilliseconds(timestamp));
  return `${String(date.getHours()).padStart(2, '0')}:${String(
    date.getMinutes(),
  ).padStart(2, '0')}`;
}

/** 将未知值安全收窄为普通对象。 */
export function asRecord(value: unknown): Readonly<Record<string, unknown>> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as Readonly<Record<string, unknown>>)
    : {};
}

/** 从未知数组读取首个对象。 */
export function readFirstRecord(value: unknown): Readonly<Record<string, unknown>> {
  return Array.isArray(value) ? asRecord(value[0]) : {};
}

/** 从两层消息体路径读取非空字符串。 */
export function readNestedString(
  source: Readonly<Record<string, unknown>>,
  ownerKey: string,
  valueKey: string,
): string {
  // owner 是指定 body 分支的安全对象。
  const owner = asRecord(source[ownerKey]);
  return readString(owner[valueKey]);
}

/** 从消息正文路径读取非空原文，避免破坏实体 UTF-16 偏移。 */
export function readNestedText(
  source: Readonly<Record<string, unknown>>,
  ownerKey: string,
  valueKey: string,
): string {
  // owner 是指定正文分支的安全对象。
  const owner = asRecord(source[ownerKey]);
  // value 仅用空白判断有效性，返回时保留协议原文。
  const value = owner[valueKey];
  return typeof value === 'string' && value.trim() ? value : '';
}

/** 将未知值收窄为去空白字符串。 */
export function readString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

/** 将未知数值转换为有限 number。 */
export function readNumber(value: unknown): number {
  // numberValue 统一处理 number 与 uint64 string。
  const numberValue = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
}

/** 将未知媒体尺寸收窄为有限正数。 */
export function readPositiveNumber(value: unknown): number | undefined {
  // numberValue 复用消息数值兼容转换。
  const numberValue = readNumber(value);
  return numberValue > 0 ? numberValue : undefined;
}

/** 秒或毫秒时间戳统一转换为毫秒。 */
function toMilliseconds(timestamp: number): number {
  return timestamp > 1_000_000_000_000 ? timestamp : timestamp * 1000;
}
