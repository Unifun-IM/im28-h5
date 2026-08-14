import type { Message } from '@im28/im-sdk/web';

/** RN 分类搜索支持的页面集合。 */
export type ChatSearchPage = 'home' | 'text' | 'date' | 'media' | 'file';
/** RN 媒体页的筛选集合。 */
export type ChatSearchMediaFilter = 'all' | 'image' | 'video';
/** 按月分组后的缓存消息集合。 */
export interface ChatSearchMonthSection {
  readonly key: string;
  readonly title: string;
  readonly messages: readonly Message[];
}
/** 日历单元格保存日期状态和当天最早消息。 */
export interface ChatSearchCalendarDay {
  readonly key: string;
  readonly day: number;
  readonly isCurrentMonth: boolean;
  readonly isToday: boolean;
  readonly isSelected: boolean;
  readonly messageCount: number;
  readonly firstMessage?: Message;
}
/** 单个月份固定渲染六周日历。 */
export interface ChatSearchCalendarMonth {
  readonly key: string;
  readonly title: string;
  readonly days: readonly ChatSearchCalendarDay[];
}
/** SQLite 日期查询使用包含下界、排除上界的时间窗口。 */
export interface ChatSearchTimeRange {
  readonly afterSendTime: number;
  readonly beforeSendTime: number;
}
/** 索引搜索路由只保存可刷新 presentation 状态。 */
export interface ChatSearchIndexedRouteState {
  readonly page: 'date' | 'media' | 'file';
  readonly monthCount: number;
  readonly mediaFilter: ChatSearchMediaFilter;
}

/** 图片消息的共享 content type。 */
export const CHAT_SEARCH_IMAGE_TYPE = 102;
/** 视频消息的共享 content type。 */
export const CHAT_SEARCH_VIDEO_TYPE = 104;
/** 文件消息的共享 content type。 */
export const CHAT_SEARCH_FILE_TYPE = 105;
/** 路由最多恢复十年月份，拒绝恶意 query 制造超大日历。 */
const CHAT_SEARCH_MAX_ROUTE_MONTHS = 120;

/** 从 React Router query 收敛索引页、月份数和媒体筛选。 */
export function readChatSearchIndexedRouteState(
  searchParams: URLSearchParams,
  defaultMonthCount: number,
): ChatSearchIndexedRouteState | null {
  /** page 只接受三个已实现的 RN 索引页。 */
  const page = searchParams.get('view');
  if (page !== 'date' && page !== 'media' && page !== 'file') return null;
  /** parsedMonthCount 只允许有界正整数。 */
  const parsedMonthCount = Number(searchParams.get('months'));
  /** fallbackMonthCount 保证调用方默认值至少为一。 */
  const fallbackMonthCount = Math.max(1, Math.trunc(defaultMonthCount));
  /** monthCount 防止刷新 URL 扩张为无限日历。 */
  const monthCount = Number.isSafeInteger(parsedMonthCount)
    && parsedMonthCount >= 1
    && parsedMonthCount <= CHAT_SEARCH_MAX_ROUTE_MONTHS
    ? parsedMonthCount
    : fallbackMonthCount;
  /** rawFilter 对未知筛选回退全部。 */
  const rawFilter = searchParams.get('filter');
  /** mediaFilter 只接受 RN 全部、图片、视频三态。 */
  const mediaFilter: ChatSearchMediaFilter = rawFilter === 'image' || rawFilter === 'video'
    ? rawFilter
    : 'all';
  return { page, monthCount, mediaFilter };
}

/** 按发送时间倒序复制消息，避免修改 SDK 只读结果。 */
export function sortChatSearchMessages(messages: readonly Message[]): readonly Message[] {
  return [...messages].sort((left, right) => right.sendTime - left.sendTime);
}

/** 按 RN `YYYY年M月` 规则分组缓存消息。 */
export function groupChatSearchMessagesByMonth(
  messages: readonly Message[],
): readonly ChatSearchMonthSection[] {
  /** sections 保留倒序消息首次出现的月份顺序。 */
  const sections = new Map<string, Message[]>();
  for (const message of sortChatSearchMessages(messages)) {
    /** date 同时兼容秒和毫秒时间戳。 */
    const date = new Date(toChatSearchMilliseconds(message.sendTime));
    /** key 使用稳定年月，title 保留 RN 文案。 */
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    /** current 复用该月已经收集的消息数组。 */
    const current = sections.get(key) ?? [];
    current.push(message);
    sections.set(key, current);
  }
  return [...sections.entries()].map(([key, monthMessages]) => {
    /** firstDate 只用于生成该组稳定标题。 */
    const firstDate = new Date(toChatSearchMilliseconds(monthMessages[0]?.sendTime ?? 0));
    return {
      key,
      title: `${firstDate.getFullYear()}年${firstDate.getMonth() + 1}月`,
      messages: monthMessages,
    };
  });
}

/** 计算当前月向前若干月的 SQLite 时间范围。 */
export function getChatSearchCalendarRange(
  baseMonth: Date,
  monthCount: number,
): ChatSearchTimeRange {
  /** count 至少包含当前月。 */
  const count = Math.max(1, Math.trunc(monthCount));
  /** after 是最早展示月份的本地月初。 */
  const after = new Date(baseMonth.getFullYear(), baseMonth.getMonth() - count + 1, 1);
  /** before 是当前月下个月月初。 */
  const before = new Date(baseMonth.getFullYear(), baseMonth.getMonth() + 1, 1);
  return { afterSendTime: after.getTime(), beforeSendTime: before.getTime() };
}

/** 从缓存窗口构造 RN 周一开头的月份日历。 */
export function buildChatSearchCalendarMonths(
  messages: readonly Message[],
  baseMonth: Date,
  monthCount: number,
  selectedDayKey = '',
): readonly ChatSearchCalendarMonth[] {
  /** dayMessages 按本地日期收集倒序消息。 */
  const dayMessages = new Map<string, Message[]>();
  for (const message of sortChatSearchMessages(messages)) {
    /** key 使用用户本地日历日期。 */
    const key = getChatSearchDateKey(new Date(toChatSearchMilliseconds(message.sendTime)));
    /** current 保存该日期倒序消息，末项就是当天最早消息。 */
    const current = dayMessages.get(key) ?? [];
    current.push(message);
    dayMessages.set(key, current);
  }
  /** count 与查询窗口保持同一最小约束。 */
  const count = Math.max(1, Math.trunc(monthCount));
  return Array.from({ length: count }, (_, index) => {
    /** monthStart 按从旧到新的顺序生成月份。 */
    const monthStart = new Date(baseMonth.getFullYear(), baseMonth.getMonth() - count + 1 + index, 1);
    return buildChatSearchCalendarMonth(monthStart, dayMessages, selectedDayKey);
  });
}

/** 构造单个月份固定 42 格的日历模型。 */
function buildChatSearchCalendarMonth(
  monthStart: Date,
  dayMessages: ReadonlyMap<string, readonly Message[]>,
  selectedDayKey: string,
): ChatSearchCalendarMonth {
  /** leadingDays 把 JavaScript 周日开头转换为 RN 周一开头。 */
  const leadingDays = (monthStart.getDay() + 6) % 7;
  /** todayKey 只用于当前日强调。 */
  const todayKey = getChatSearchDateKey(new Date());
  /** days 固定六周，避免月份切换导致布局跳动。 */
  const days = Array.from({ length: 42 }, (_, index) => {
    /** date 允许落入相邻月份，渲染时保持禁用。 */
    const date = new Date(monthStart.getFullYear(), monthStart.getMonth(), 1 - leadingDays + index);
    /** key 对应 cache 分组键。 */
    const key = getChatSearchDateKey(date);
    /** messages 保持 newest-first，最后一条是 RN 点击定位目标。 */
    const messages = dayMessages.get(key) ?? [];
    return {
      key,
      day: date.getDate(),
      isCurrentMonth: date.getMonth() === monthStart.getMonth()
        && date.getFullYear() === monthStart.getFullYear(),
      isToday: key === todayKey,
      isSelected: key === selectedDayKey,
      messageCount: messages.length,
      ...(messages.length ? { firstMessage: messages[messages.length - 1] } : {}),
    };
  });
  /** key 是月份标题和 React key 共用的稳定身份。 */
  const key = `${monthStart.getFullYear()}-${String(monthStart.getMonth() + 1).padStart(2, '0')}`;
  return { key, title: `${monthStart.getFullYear()}年${monthStart.getMonth() + 1}月`, days };
}

/** 从文件名提取最多三个字符的 RN 类型标签。 */
export function getChatSearchFileExtension(fileName: string): string {
  /** parts 用点分隔文件名并拒绝无扩展名情况。 */
  const parts = fileName.split('.');
  if (parts.length < 2) return 'FILE';
  return parts.at(-1)?.slice(0, 3).toUpperCase() || 'FILE';
}

/** 生成本地日期稳定键。 */
function getChatSearchDateKey(date: Date): string {
  /** month 固定两位以保持字典序。 */
  const month = String(date.getMonth() + 1).padStart(2, '0');
  /** day 固定两位以保持字典序。 */
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

/** 将 Gateway 秒时间戳和本地毫秒时间戳统一为毫秒。 */
function toChatSearchMilliseconds(value: number): number {
  return value > 1_000_000_000_000 ? value : value * 1000;
}
