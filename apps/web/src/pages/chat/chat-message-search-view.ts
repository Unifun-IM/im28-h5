/** 聊天记录搜索高亮后的稳定文本片段。 */
export interface ChatMessageSearchTextSegment {
  readonly text: string;
  readonly highlighted: boolean;
}

/** 按 RN 不区分大小写规则拆分关键词高亮片段。 */
export function splitChatMessageSearchText(
  text: string,
  keyword: string,
): readonly ChatMessageSearchTextSegment[] {
  /** query 保留原关键词字符长度，只去除首尾空白。 */
  const query = keyword.trim();
  if (!text || !query) return text ? [{ text, highlighted: false }] : [];
  /** lowerText 只用于定位，不改变最终展示字符。 */
  const lowerText = text.toLocaleLowerCase();
  /** lowerQuery 对齐 RN 大小写不敏感搜索。 */
  const lowerQuery = query.toLocaleLowerCase();
  /** segments 保持原正文的完整字符顺序。 */
  const segments: ChatMessageSearchTextSegment[] = [];
  /** cursor 指向尚未投影的 UTF-16 起点。 */
  let cursor = 0;
  while (cursor < text.length) {
    /** matchIndex 是下一处不区分大小写的命中位置。 */
    const matchIndex = lowerText.indexOf(lowerQuery, cursor);
    if (matchIndex < 0) {
      segments.push({ text: text.slice(cursor), highlighted: false });
      break;
    }
    if (matchIndex > cursor) {
      segments.push({ text: text.slice(cursor, matchIndex), highlighted: false });
    }
    /** matchEnd 保留原 query 的 UTF-16 长度。 */
    const matchEnd = matchIndex + query.length;
    segments.push({ text: text.slice(matchIndex, matchEnd), highlighted: true });
    cursor = matchEnd;
  }
  return segments;
}

/** 按 RN 年/月/日格式呈现搜索结果时间。 */
export function formatChatMessageSearchDate(timestamp: number): string {
  if (!timestamp) return '';
  /** milliseconds 同时兼容 Gateway 秒与本地毫秒时间戳。 */
  const milliseconds = timestamp > 1_000_000_000_000
    ? timestamp
    : timestamp * 1000;
  /** date 使用浏览器当前时区，与 RN 本地日期一致。 */
  const date = new Date(milliseconds);
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
}
