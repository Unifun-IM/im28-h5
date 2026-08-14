import type {
  Conversation,
  WebIMContact,
  WebIMContactSearchUser,
  WebIMJoinedGroup,
} from '@im28/im-sdk/web';

import { filterWebIMContacts } from './contact-filter.js';
import {
  readContactSearchBackHref,
  type ContactSearchBackHref,
} from './contact-search-route.js';
import { filterJoinedGroups } from './joined-group-view.js';

/** 群会话缓存只投影本地搜索与打开会话需要的最小字段。 */
export interface ContactSearchConversationGroup {
  readonly source: 'conversation';
  readonly groupID: string;
  readonly conversationID: string;
  readonly name: string;
  readonly avatarURL: string;
  readonly introduction: '';
}

/** 本地群搜索项优先保留完整 joined-group，否则使用会话只读 fallback。 */
export type ContactSearchLocalGroup = WebIMJoinedGroup | ContactSearchConversationGroup;

/** 联系人搜索本地结果保持好友在前、已加入群聊在后的稳定联合类型。 */
export type ContactSearchLocalResult =
  | { readonly type: 'friend'; readonly key: string; readonly contact: WebIMContact }
  | { readonly type: 'group'; readonly key: string; readonly group: ContactSearchLocalGroup };

/** 联系人搜索键盘完成判断只读取浏览器稳定按键字段。 */
export interface ContactSearchKeyboardInput {
  readonly key: string;
  readonly isComposing: boolean;
  readonly repeat: boolean;
}

/** 对齐 RN 搜索键：仅完成输入并收起键盘，不隐式发起服务器请求。 */
export function shouldDismissContactSearchKeyboard(
  input: ContactSearchKeyboardInput,
): boolean {
  return input.key === 'Enter' && !input.isComposing && !input.repeat;
}

/** 复用通讯录与我的群聊既有过滤规则合并本地搜索结果。 */
export function buildContactSearchLocalResults(
  contacts: readonly WebIMContact[],
  groups: readonly WebIMJoinedGroup[],
  conversations: readonly Conversation[],
  keyword: string,
): readonly ContactSearchLocalResult[] {
  /** query 只判断空关键词，具体大小写与字段规则交给既有过滤 owner。 */
  const query = keyword.trim();
  if (!query) return [];
  /** matchedContacts 保持 contacts facade 的稳定显示顺序。 */
  const matchedContacts = filterWebIMContacts(contacts, query);
  /** localGroups 先冻结完整群资料，避免会话旧字段覆盖 canonical snapshot。 */
  const localGroups = new Map<string, ContactSearchLocalGroup>();
  groups.forEach(group => localGroups.set(group.groupID, group));
  conversations.forEach(conversation => {
    /** groupID 只接受群会话的稳定 target identity。 */
    const groupID = conversation.type === 'group' ? conversation.targetID.trim() : '';
    if (!groupID || localGroups.has(groupID)) return;
    localGroups.set(groupID, {
      source: 'conversation',
      groupID,
      conversationID: conversation.conversationID,
      name: conversation.name?.trim() || groupID,
      avatarURL: conversation.faceURL?.trim() || '',
      introduction: '',
    });
  });
  /** matchedGroups 复用唯一群名/群 ID 过滤规则。 */
  const matchedGroups = filterJoinedGroups([...localGroups.values()], query);
  return [
    ...matchedContacts.map(contact => ({
      type: 'friend' as const,
      key: `friend-${contact.userID}`,
      contact,
    })),
    ...matchedGroups.map(group => ({
      type: 'group' as const,
      key: `group-${group.groupID}`,
      group,
    })),
  ];
}

/** 搜索文本中可单独高亮的稳定片段。 */
export interface ContactSearchTextPart {
  readonly text: string;
  readonly highlighted: boolean;
}

/** 联系人搜索页可从群申请页恢复的受控服务器状态。 */
export interface ContactSearchRouteState {
  readonly searchKeyword: string;
  readonly serverTab: 'friends' | 'groups' | null;
  readonly searchBackHref: ContactSearchBackHref;
}

/** 联系人搜索结果进入资料页时允许携带的完整 Router state。 */
export interface ContactSearchProfileLocationState extends ContactSearchRouteState {
  readonly backHref: '/contacts/search';
}

/** 为用户资料路由构造有界且可白名单解析的搜索返回状态。 */
export function createContactSearchProfileState(
  searchKeyword: string,
  serverTab: ContactSearchRouteState['serverTab'],
  searchBackHref: unknown = '/contacts',
): ContactSearchProfileLocationState {
  return {
    backHref: '/contacts/search',
    searchKeyword: searchKeyword.trim().slice(0, 100),
    serverTab,
    searchBackHref: readContactSearchBackHref(searchBackHref),
  };
}

/** 从未知 Router state 恢复有界关键词和合法服务器页签。 */
export function readContactSearchRouteState(state: unknown): ContactSearchRouteState {
  if (!state || typeof state !== 'object') {
    return { searchKeyword: '', serverTab: null, searchBackHref: '/contacts' };
  }
  /** keyword 只恢复展示输入，限制异常 history state 大小。 */
  const keyword = Reflect.get(state, 'searchKeyword');
  /** tab 仅允许群申请返回时恢复群聊页签。 */
  const tab = Reflect.get(state, 'serverTab');
  return {
    searchKeyword: typeof keyword === 'string' ? keyword.trim().slice(0, 100) : '',
    serverTab: tab === 'friends' || tab === 'groups' ? tab : null,
    searchBackHref: readContactSearchBackHref(Reflect.get(state, 'searchBackHref')),
  };
}

/** 只为精确的联系人搜索返回地址恢复纯 presentation state。 */
export function readContactSearchProfileReturnState(
  state: unknown,
): ContactSearchRouteState | undefined {
  if (!state || typeof state !== 'object') return undefined;
  /** backHref 必须是唯一允许恢复搜索上下文的内部地址。 */
  const backHref = Reflect.get(state, 'backHref');
  if (backHref !== '/contacts/search') return undefined;
  return readContactSearchRouteState(state);
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
