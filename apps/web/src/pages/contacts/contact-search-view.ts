import type {
  WebIMContact,
  WebIMContactSearchUser,
} from '@im28/im-sdk/web';

/** 搜索文本中可单独高亮的稳定片段。 */
export interface ContactSearchTextPart {
  readonly text: string;
  readonly highlighted: boolean;
}

/** 搜索结果摘要所需的最小公开字段。 */
type ContactSearchDescriptionSource = Pick<
  WebIMContactSearchUser,
  'userID' | 'nickname' | 'account' | 'phone' | 'email'
>;

/** 将关键词匹配拆成保持原文大小写的安全文本片段。 */
export function splitContactSearchText(
  text: string,
  keyword: string,
): readonly ContactSearchTextPart[] {
  // normalizedKeyword 只移除搜索输入首尾空白。
  const normalizedKeyword = keyword.trim();
  if (!normalizedKeyword) return [{ text, highlighted: false }];
  // escapedKeyword 防止用户输入被当作正则表达式执行。
  const escapedKeyword = normalizedKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // segments 使用捕获组保留所有匹配原文。
  const segments = text.split(new RegExp(`(${escapedKeyword})`, 'gi')).filter(Boolean);
  // normalizedMatch 统一片段比较的大小写。
  const normalizedMatch = normalizedKeyword.toLocaleLowerCase();
  return segments.map(segment => ({
    text: segment,
    highlighted: segment.toLocaleLowerCase() === normalizedMatch,
  }));
}

/** 选择最能解释当前关键词命中的 RN 搜索结果摘要。 */
export function getContactSearchDescription(
  source: ContactSearchDescriptionSource,
  keyword: string,
): string {
  // candidates 按昵称、账号、手机号、邮箱、ID 的可读顺序匹配。
  const candidates = [
    { label: '昵称', value: source.nickname },
    { label: '账号', value: source.account },
    { label: '手机号', value: source.phone },
    { label: '邮箱', value: source.email },
    { label: 'ID', value: source.userID },
  ].filter(candidate => candidate.value.trim());
  // query 使用小写比较但不改变远端展示值。
  const query = keyword.trim().toLocaleLowerCase();
  // matchedCandidate 优先解释实际命中的字段。
  const matchedCandidate = candidates.find(candidate =>
    query && candidate.value.toLocaleLowerCase().includes(query));
  // fallbackCandidate 在无字段命中时稳定回退 ID。
  const fallbackCandidate = candidates.find(candidate => candidate.label === 'ID') ?? candidates[0];
  // candidate 是最终用于展示的公开字段。
  const candidate = matchedCandidate ?? fallbackCandidate;
  return candidate ? `${candidate.label}：${candidate.value}` : '';
}

/** 将好友记录投影为搜索摘要需要的公开字段。 */
export function toContactSearchDescriptionSource(
  contact: WebIMContact,
): ContactSearchDescriptionSource {
  return {
    userID: contact.userID,
    nickname: contact.nickname,
    account: contact.account,
    phone: contact.phone,
    email: contact.email,
  };
}
