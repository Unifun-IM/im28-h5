import {
  formatIMFriendSourceType,
  type WebIMFriendApplication,
} from '@im28/im-sdk/web';

/** 好友申请列表的 section/row 联合模型。 */
export type FriendApplicationListEntry =
  | { readonly type: 'section'; readonly key: string; readonly title: string }
  | { readonly type: 'application'; readonly key: string; readonly application: WebIMFriendApplication };

/** 按 RN 可见字段搜索并生成最近三天/三天前分组。 */
export function buildFriendApplicationEntries(
  applications: readonly WebIMFriendApplication[],
  keyword: string,
  now = Date.now(),
): readonly FriendApplicationListEntry[] {
  // query 统一大小写并忽略两端空白。
  const query = keyword.trim().toLocaleLowerCase();
  // filtered 只匹配页面真实可见或稳定身份字段。
  const filtered = applications.filter(application => !query || [
    application.displayName,
    application.userID,
    application.message,
    application.sourceType,
  ].some(value => value.toLocaleLowerCase().includes(query)));
  // entries 保留 facade 已确定的待处理优先和时间顺序。
  const entries: FriendApplicationListEntry[] = [];
  // lastSection 防止重复插入连续日期标题。
  let lastSection = '';
  for (const application of filtered) {
    // sectionTitle 复刻 RN 三天分组。
    const sectionTitle = getFriendApplicationSectionTitle(application.createdAt, now);
    if (sectionTitle !== lastSection) {
      entries.push({ type: 'section', key: `section-${sectionTitle}-${entries.length}`, title: sectionTitle });
      lastSection = sectionTitle;
    }
    entries.push({ type: 'application', key: application.applicationID, application });
  }
  return entries;
}

/** 返回 RN 申请来源文案。 */
export function getFriendApplicationSourceText(application: WebIMFriendApplication): string {
  if (application.direction === 'outgoing') return '我申请添加对方';
  return formatIMFriendSourceType(application.sourceType, '通过ID添加');
}

/** 返回 RN 申请消息文案。 */
export function getFriendApplicationMessageText(application: WebIMFriendApplication): string {
  // message 按方向提供 RN 空值回退。
  const message = application.message ||
    (application.direction === 'incoming' ? '请求添加你为好友' : '等待对方验证');
  return application.direction === 'outgoing' ? `我：${message}` : message;
}

/** 返回 RN 已处理状态文案。 */
export function getFriendApplicationStatusText(status: string): string {
  if (status === 'accepted') return '已添加';
  if (['rejected', 'canceled', 'expired'].includes(status)) return '已过期';
  return '待验证';
}

/** 判断当前行是否显示真实 accept 操作。 */
export function canAcceptFriendApplication(application: WebIMFriendApplication): boolean {
  return application.direction === 'incoming' && application.status === 'pending';
}

/** 返回确认框使用的中文日期。 */
export function formatFriendApplicationDate(value: string): string {
  // timestamp 仅接受可解析服务端时间。
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) return '';
  // date 使用浏览器本地时区对齐 RN Date。
  const date = new Date(timestamp);
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}

/** 按三天阈值返回分组标题。 */
function getFriendApplicationSectionTitle(value: string, now: number): string {
  // timestamp 缺失或不可解析时归入旧记录。
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) return '三天前';
  return now - timestamp <= 3 * 24 * 60 * 60 * 1000 ? '最近三天' : '三天前';
}
