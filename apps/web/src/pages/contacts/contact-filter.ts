import type { WebIMContact } from '@im28/im-sdk/web';

/** 按 RN remark、nickname、账号、ID、手机号和邮箱字段执行本地搜索。 */
export function filterWebIMContacts(
  contacts: readonly WebIMContact[],
  keyword: string,
): readonly WebIMContact[] {
  /** query 统一大小写和首尾空白，不改变原始记录。 */
  const query = keyword.trim().toLocaleLowerCase();
  if (!query) return contacts;
  return contacts.filter(contact =>
    [
      contact.displayName,
      contact.nickname,
      contact.remark,
      contact.account,
      contact.userID,
      contact.phone,
      contact.email,
    ]
      .join('\n')
      .toLocaleLowerCase()
      .includes(query),
  );
}
