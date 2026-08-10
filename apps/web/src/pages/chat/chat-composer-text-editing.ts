/** 浏览器 textarea 使用的 UTF-16 选区。 */
export interface ChatDraftSelection {
  readonly start: number;
  readonly end: number;
}

/** 一次草稿编辑同时返回文本和下一光标位置。 */
export interface ChatDraftEditResult {
  readonly text: string;
  readonly selection: ChatDraftSelection;
}

/** 标准 grapheme 分段结果只需要起始索引。 */
interface ChatGraphemeSegment {
  readonly index: number;
}

/** 标准分段器的最小可选运行时 contract。 */
interface ChatGraphemeSegmenter {
  segment(input: string): Iterable<ChatGraphemeSegment>;
}

/** 标准分段器构造器在旧浏览器中可能不存在。 */
type ChatGraphemeSegmenterConstructor = new (
  locale?: string,
  options?: { readonly granularity: 'grapheme' },
) => ChatGraphemeSegmenter;

/** Unicode Mark 覆盖组合音标和多数附加符号。 */
const CHAT_COMBINING_MARK_PATTERN = /^\p{Mark}$/u;
/** ZWJ 把相邻 emoji 连接成一个可见输入格。 */
const CHAT_ZERO_WIDTH_JOINER = '\u200D';

/** 将越界或反向选区收敛到当前文本范围。 */
export function normalizeChatDraftSelection(
  text: string,
  selection: ChatDraftSelection,
): ChatDraftSelection {
  // textLength 是 textarea selection 的 UTF-16 上界。
  const textLength = text.length;
  // start 和 end 分别收敛后再规范顺序。
  const start = clampChatSelectionIndex(selection.start, textLength);
  // end 保留原生允许反向 selection 的兼容输入。
  const end = clampChatSelectionIndex(selection.end, textLength);
  return start <= end ? { start, end } : { start: end, end: start };
}

/** 在当前选区插入文本，非折叠选区会被替换。 */
export function insertChatDraftAtSelection(
  text: string,
  selection: ChatDraftSelection,
  insertedText: string,
): ChatDraftEditResult {
  // normalizedSelection 避免异步 DOM selection 越过最新草稿。
  const normalizedSelection = normalizeChatDraftSelection(text, selection);
  // nextText 由选区前、插入内容和选区后三段组成。
  const nextText = `${text.slice(0, normalizedSelection.start)}${insertedText}${text.slice(normalizedSelection.end)}`;
  // nextCursor 折叠在新插入内容末尾。
  const nextCursor = normalizedSelection.start + insertedText.length;
  return {
    text: nextText,
    selection: { start: nextCursor, end: nextCursor },
  };
}

/** 删除选区或光标前一个完整可见 grapheme。 */
export function deleteChatDraftBeforeSelection(
  text: string,
  selection: ChatDraftSelection,
): ChatDraftEditResult {
  // normalizedSelection 保证字符串切片合法。
  const normalizedSelection = normalizeChatDraftSelection(text, selection);
  if (normalizedSelection.start !== normalizedSelection.end) {
    // nextText 删除完整选区。
    const nextText = `${text.slice(0, normalizedSelection.start)}${text.slice(normalizedSelection.end)}`;
    return {
      text: nextText,
      selection: {
        start: normalizedSelection.start,
        end: normalizedSelection.start,
      },
    };
  }
  if (normalizedSelection.start === 0) {
    return { text, selection: normalizedSelection };
  }
  // previousBoundary 是光标前完整 grapheme 的左边界。
  const previousBoundary = findPreviousChatGraphemeBoundary(
    text,
    normalizedSelection.start,
  );
  // nextText 删除边界到光标之间的一个可见字符。
  const nextText = `${text.slice(0, previousBoundary)}${text.slice(normalizedSelection.end)}`;
  return {
    text: nextText,
    selection: { start: previousBoundary, end: previousBoundary },
  };
}

/** 把任意 selection 数值转换为有效整数索引。 */
function clampChatSelectionIndex(value: number, textLength: number): number {
  if (!Number.isFinite(value)) return textLength;
  return Math.max(0, Math.min(textLength, Math.floor(value)));
}

/** 查找光标之前的完整 grapheme 起点。 */
function findPreviousChatGraphemeBoundary(text: string, cursor: number): number {
  // prefix 隔离光标前内容，避免后半段影响分词边界。
  const prefix = text.slice(0, cursor);
  // Segmenter 在现代浏览器中优先提供标准 grapheme 语义。
  const Segmenter = (
    Intl as unknown as { Segmenter?: ChatGraphemeSegmenterConstructor }
  ).Segmenter;
  if (Segmenter) {
    // segmenter 覆盖肤色、ZWJ、旗帜和组合音标。
    const segmenter = new Segmenter(undefined, { granularity: 'grapheme' });
    // previousBoundary 最终保存最近一个分段起点。
    let previousBoundary = 0;
    for (const segment of segmenter.segment(prefix)) {
      previousBoundary = segment.index;
    }
    return previousBoundary;
  }
  return findFallbackChatGraphemeBoundary(prefix);
}

/** 在无 Segmenter 的浏览器中覆盖常见 emoji 组合。 */
function findFallbackChatGraphemeBoundary(prefix: string): number {
  // codePoints 避免直接拆断 UTF-16 代理对。
  const codePoints = Array.from(prefix);
  // graphemeStartIndex 从最后一个码点向左吞并扩展符号。
  let graphemeStartIndex = codePoints.length - 1;
  while (
    graphemeStartIndex > 0 &&
    isChatGraphemeExtend(codePoints[graphemeStartIndex])
  ) {
    graphemeStartIndex -= 1;
  }
  while (
    graphemeStartIndex > 1 &&
    codePoints[graphemeStartIndex - 1] === CHAT_ZERO_WIDTH_JOINER
  ) {
    graphemeStartIndex -= 2;
    while (
      graphemeStartIndex > 0 &&
      isChatGraphemeExtend(codePoints[graphemeStartIndex])
    ) {
      graphemeStartIndex -= 1;
    }
  }
  if (
    graphemeStartIndex > 0 &&
    isChatRegionalIndicator(codePoints[graphemeStartIndex]) &&
    isChatRegionalIndicator(codePoints[graphemeStartIndex - 1])
  ) {
    graphemeStartIndex -= 1;
  }
  return codePoints.slice(0, graphemeStartIndex).join('').length;
}

/** 判断码点是否应与前面的基础字符共同删除。 */
function isChatGraphemeExtend(codePoint: string | undefined): boolean {
  if (!codePoint) return false;
  // value 用于识别 variation、肤色和 tag 范围。
  const value = codePoint.codePointAt(0) ?? 0;
  return (
    CHAT_COMBINING_MARK_PATTERN.test(codePoint) ||
    value === 0xfe0e ||
    value === 0xfe0f ||
    (value >= 0x1f3fb && value <= 0x1f3ff) ||
    (value >= 0xe0020 && value <= 0xe007f)
  );
}

/** 判断码点是否属于组成国旗的区域指示符。 */
function isChatRegionalIndicator(codePoint: string | undefined): boolean {
  if (!codePoint) return false;
  // value 范围来自 Unicode Regional Indicator Symbol Letter。
  const value = codePoint.codePointAt(0) ?? 0;
  return value >= 0x1f1e6 && value <= 0x1f1ff;
}
