import type { WebIMContact } from '@im28/im-sdk-web';

/** 通讯录页面分组后的稳定渲染项。 */
export type ContactListEntry =
  | { readonly type: 'section'; readonly key: string; readonly title: string }
  | { readonly type: 'contact'; readonly key: string; readonly contact: WebIMContact };

/** 星标好友在 RN 字母索引中的固定标识。 */
export const STARRED_CONTACT_INDEX = '★';

/** 按 RN remark、nickname、ID 字段执行本地搜索。 */
export function filterWebIMContacts(
  contacts: readonly WebIMContact[],
  keyword: string,
): readonly WebIMContact[] {
  // query 统一大小写和首尾空白，不改变原始记录。
  const query = keyword.trim().toLocaleLowerCase();
  if (!query) return contacts;
  return contacts.filter(contact =>
    [contact.displayName, contact.nickname, contact.remark, contact.userID]
      .join('\n')
      .toLocaleLowerCase()
      .includes(query),
  );
}

/** 将好友列表转换为星标优先、随后按索引分组的 RN 列表。 */
export function buildContactListEntries(
  contacts: readonly WebIMContact[],
  keyword: string,
): readonly ContactListEntry[] {
  // filteredContacts 保留 SDK 的好友添加时间顺序。
  const filteredContacts = filterWebIMContacts(contacts, keyword);
  // entries 是页面唯一渲染数据源。
  const entries: ContactListEntry[] = [];
  // starred 只在非搜索状态进入独立星标分组。
  const starred = keyword.trim()
    ? []
    : filteredContacts.filter(contact => contact.isStarred);
  if (starred.length) {
    entries.push({ type: 'section', key: 'section-starred', title: STARRED_CONTACT_INDEX });
    for (const contact of starred) {
      entries.push({ type: 'contact', key: `starred-${contact.userID}`, contact });
    }
  }
  // groups 收集非星标联系人并保持首个分组出现顺序。
  const groups = new Map<string, WebIMContact[]>();
  for (const contact of filteredContacts) {
    if (!keyword.trim() && contact.isStarred) continue;
    // indexKey 由显示名称的首个可索引字符决定。
    const indexKey = getContactIndexKey(contact.displayName);
    groups.set(indexKey, [...(groups.get(indexKey) ?? []), contact]);
  }
  for (const [title, groupContacts] of groups) {
    entries.push({ type: 'section', key: `section-${title}`, title });
    for (const contact of groupContacts) {
      entries.push({ type: 'contact', key: `contact-${contact.userID}`, contact });
    }
  }
  return entries;
}

/** 返回当前列表实际存在的右侧索引项。 */
export function getContactIndexes(
  entries: readonly ContactListEntry[],
): readonly string[] {
  return entries
    .filter((entry): entry is Extract<ContactListEntry, { readonly type: 'section' }> =>
      entry.type === 'section')
    .map(entry => entry.title);
}

/** 将联系人显示名称映射为字母、数字或其他分组。 */
function getContactIndexKey(displayName: string): string {
  // firstCharacter 跳过显示名称开头空白。
  const firstCharacter = Array.from(displayName.trim())[0] ?? '#';
  if (/^[A-Za-z]$/.test(firstCharacter)) return firstCharacter.toUpperCase();
  if (/^[0-9]$/.test(firstCharacter)) return '0-9';
  return '#';
}

/** 为分组标题生成稳定 DOM anchor。 */
export function getContactSectionID(index: string): string {
  return `contact-section-${index === STARRED_CONTACT_INDEX ? 'starred' : encodeURIComponent(index)}`;
}
