import type { WebIMGroupApplication } from '@im28/im-sdk/web';

/** 群聊验证索引行。 */
export interface GroupVerificationEntry {
  readonly groupID: string;
  readonly groupName: string;
  readonly groupAvatarURL: string;
  readonly isOwner: boolean;
  readonly count: number;
}

/** 单群申请列表的 section/row 联合模型。 */
export type GroupApplicationListEntry =
  | { readonly type: 'section'; readonly key: string; readonly title: string }
  | { readonly type: 'application'; readonly key: string; readonly application: WebIMGroupApplication };

/** 收敛群申请异常且不泄漏凭据。 */
export function readGroupApplicationError(cause: unknown, fallback: string): string {
  return cause instanceof Error && cause.message ? cause.message : fallback;
}

/** 按群聚合待审核申请并应用 RN 搜索与排序。 */
export function buildGroupVerificationEntries(
  applications: readonly WebIMGroupApplication[],
  currentUserID: string,
  keyword: string,
): readonly GroupVerificationEntry[] {
  // groups 使用 groupID 合并同群待审核记录。
  const groups = new Map<string, GroupVerificationEntry>();
  for (const application of applications) {
    if (application.status !== 'pending') continue;
    // existing 保留同群第一条记录中的稳定资料。
    const existing = groups.get(application.groupID);
    groups.set(application.groupID, existing
      ? { ...existing, count: existing.count + 1 }
      : {
          groupID: application.groupID,
          groupName: application.groupName,
          groupAvatarURL: application.groupAvatarURL,
          isOwner: Boolean(currentUserID && application.ownerUserID === currentUserID),
          count: 1,
        });
  }
  // query 统一大小写并忽略两端空白。
  const query = keyword.trim().toLocaleLowerCase();
  return [...groups.values()]
    .filter(group => !query || [group.groupName, group.groupID]
      .some(value => value.toLocaleLowerCase().includes(query)))
    .sort((left, right) => right.count - left.count || left.groupName.localeCompare(right.groupName));
}

/** 统计目标群待审核申请，供群管理入口复用同一状态语义。 */
export function countPendingGroupApplications(
  applications: readonly WebIMGroupApplication[],
  groupID: string,
): number {
  return applications.filter(application => (
    application.groupID === groupID && application.status === 'pending'
  )).length;
}

/** 筛选单群申请并生成最近三天/三天前分组。 */
export function buildGroupApplicationEntries(
  applications: readonly WebIMGroupApplication[],
  groupID: string,
  keyword: string,
  now = Date.now(),
): readonly GroupApplicationListEntry[] {
  // query 统一详情页搜索输入。
  const query = keyword.trim().toLocaleLowerCase();
  // filtered 只匹配目标群和页面真实可见字段。
  const filtered = applications.filter(application => application.groupID === groupID && (!query || [
    application.requesterName,
    application.requesterUserID,
    application.message,
    application.sourceType,
  ].some(value => value.toLocaleLowerCase().includes(query))));
  // entries 保留 facade 已确定的待处理优先和时间顺序。
  const entries: GroupApplicationListEntry[] = [];
  // lastSection 防止重复插入连续日期标题。
  let lastSection = '';
  for (const application of filtered) {
    // sectionTitle 复刻 RN 三天分组。
    const sectionTitle = getGroupApplicationSectionTitle(application.createdAt, now);
    if (sectionTitle !== lastSection) {
      entries.push({ type: 'section', key: `section-${sectionTitle}-${entries.length}`, title: sectionTitle });
      lastSection = sectionTitle;
    }
    entries.push({ type: 'application', key: application.applicationID, application });
  }
  return entries;
}

/** 返回 RN 群申请来源文案。 */
export function getGroupApplicationSourceText(application: WebIMGroupApplication): string {
  if (application.type === 'invite') return application.groupName
    ? `群成员 [${application.groupName}] 邀请`
    : '群成员邀请';
  // source 兼容 Gateway 自由文本与稳定 code。
  const source = application.sourceType.trim().toLocaleLowerCase();
  if (['search_id', 'group_id', 'id'].some(code => source.includes(code))) return '搜索ID';
  return '搜索群名称';
}

/** 返回 RN 群申请状态文案。 */
export function getGroupApplicationStatusText(application: WebIMGroupApplication): string {
  if (application.status === 'accepted') return '已添加';
  if (application.status === 'rejected') return application.type === 'invite' ? '已失效' : '已拒绝';
  return '待验证';
}

/** 返回确认框使用的中文日期。 */
export function formatGroupApplicationDate(value: string): string {
  // timestamp 仅接受可解析服务端时间。
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) return '';
  // date 使用浏览器本地时区对齐 RN Date。
  const date = new Date(timestamp);
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}

/** 按三天阈值返回群申请分组标题。 */
function getGroupApplicationSectionTitle(value: string, now: number): string {
  // timestamp 缺失或不可解析时归入旧记录。
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) return '三天前';
  return now - timestamp <= 3 * 24 * 60 * 60 * 1000 ? '最近三天' : '三天前';
}
