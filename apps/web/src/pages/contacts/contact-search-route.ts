/** 联系人搜索只允许恢复实际承载全局添加朋友入口的场景。 */
export type ContactSearchBackHref = '/contacts' | '/conversations' | '/conversations/archived';

/** 从未知 Router state 字段读取联系人搜索的白名单来源。 */
export function readContactSearchBackHref(value: unknown): ContactSearchBackHref {
  if (value === '/conversations' || value === '/conversations/archived') return value;
  return '/contacts';
}
