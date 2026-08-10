import type { GatewayCall } from '@im28/im-sdk-web';

/** 获取通话记录稳定 ID。 */
export function getCallID(call: GatewayCall): string {
  return call.call_id?.trim() || call.client_call_id?.trim() || '';
}

/** 获取当前账号视角下的对端 ID。 */
export function getCallPeerID(call: GatewayCall, selfID: string): string {
  // directID 从 RN 支持的单聊会话前缀解析。
  const directID = parseDirectPeerID(call.conversation_id ?? '');
  // candidates 按 Gateway v2 peer、会话、caller 顺序回退。
  const candidates = [call.user_id, directID, call.caller_id]
    .map(value => value?.trim() ?? '')
    .filter(Boolean);
  return candidates.find(value => value !== selfID) ?? '';
}

/** 获取通话记录展示名称。 */
export function getCallDisplayName(call: GatewayCall, selfID: string): string {
  return call.nickname?.trim() || getCallPeerID(call, selfID) || '未知用户';
}

/** 判断 Gateway 明确标记的未接记录。 */
export function isMissedCall(call: GatewayCall): boolean {
  return call.answer_status?.trim().toLowerCase() === 'missed';
}

/** 归一化当前账号视角下的呼入呼出方向。 */
export function getCallDirection(
  call: GatewayCall,
  selfID: string,
): 'incoming' | 'outgoing' {
  if (call.direction === 'outgoing') return 'outgoing';
  if (call.direction === 'incoming') return 'incoming';
  return call.caller_id?.trim() === selfID ? 'outgoing' : 'incoming';
}

/** 按 RN 语义格式化通话结果和时长。 */
export function formatCallStatus(call: GatewayCall): string {
  if (isMissedCall(call)) return '未接';
  // durationSeconds 只在接通和结束时间完整时展示。
  const durationSeconds = getCallDurationSeconds(call);
  if (durationSeconds > 0) return `通话时长 ${formatDuration(durationSeconds)}`;
  // statusText 映射未建立时长的终态。
  const statusText: Readonly<Record<string, string>> = {
    ringing: '呼叫中',
    active: '通话中',
    canceled: '已取消',
    rejected: '已拒绝',
    failed: '通话失败',
  };
  return statusText[call.status?.trim().toLowerCase() ?? ''] ?? '通话结束';
}

/** 按 RN 列表语义格式化当天时间或紧凑日期。 */
export function formatCallTime(value: string | undefined, now = new Date()): string {
  // timestamp 只接受有效时间。
  const timestamp = value ? Date.parse(value) : 0;
  if (!Number.isFinite(timestamp) || timestamp <= 0) return '';
  // date 提供本地时区显示。
  const date = new Date(timestamp);
  // clock 保持秒级精度。
  const clock = [date.getHours(), date.getMinutes(), date.getSeconds()]
    .map(part => String(part).padStart(2, '0'))
    .join(':');
  if (date.toDateString() === now.toDateString()) return clock;
  // prefix 同年省略年份。
  const prefix = date.getFullYear() === now.getFullYear()
    ? `${date.getMonth() + 1}/${date.getDate()}`
    : `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
  return `${prefix} ${clock}`;
}

/** 判断取消或拒绝态以选择禁用图标。 */
export function isCanceledCall(call: GatewayCall): boolean {
  // status 兼容英式拼写。
  const status = call.status?.trim().toLowerCase() ?? '';
  return ['canceled', 'cancelled', 'rejected'].includes(status);
}

/** 从单聊会话 ID 中解析对端 ID。 */
function parseDirectPeerID(conversationID: string): string {
  // prefix 顺序与 RN helper 一致。
  const prefix = ['si_', 'single_', 'direct_'].find(value => conversationID.startsWith(value));
  return prefix ? conversationID.slice(prefix.length).trim() : '';
}

/** 计算已接通通话时长秒数。 */
function getCallDurationSeconds(call: GatewayCall): number {
  // start 优先使用接通时间。
  const start = Date.parse(call.answered_at ?? call.started_at ?? '');
  // end 必须来自明确结束时间。
  const end = Date.parse(call.ended_at ?? '');
  if (!Number.isFinite(start) || !Number.isFinite(end)) return 0;
  return Math.max(0, Math.round((end - start) / 1000));
}

/** 将秒数格式化为 RN 通话时长文案片段。 */
function formatDuration(totalSeconds: number): string {
  // minutes 与 seconds 固定两位秒数。
  const minutes = Math.floor(totalSeconds / 60);
  // seconds 保留分钟内余数。
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
