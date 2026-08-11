import {
  normalizeConversationAutoDeleteSeconds,
  type Message,
} from '@im28/im-sdk/web';

/** 从 type1701 系统消息生成 RN 同源文案。 */
export function getChatAutoDeleteSystemText(
  message: Message,
  currentUserID = '',
): string | null {
  if (message.contentType !== 1701) return null;
  /** body 是 shared mapper 保存的 Gateway system body。 */
  const body = asRecord(message.payload);
  /** system 必须带规范事件类型。 */
  const system = asRecord(body.system);
  if (readString(system.event_type) !== 'conversation_auto_delete_changed') {
    return null;
  }
  /** extra 保存操作者、秒数和启用状态。 */
  const extra = asRecord(system.extra);
  /** seconds 必须命中 Gateway 完整枚举。 */
  const seconds = normalizeConversationAutoDeleteSeconds(
    Number(extra.auto_delete_seconds),
  );
  /** enabled 只接受服务端布尔字符串或布尔值。 */
  const enabled = readBoolean(extra.enabled);
  if (
    seconds === undefined ||
    enabled === null ||
    (seconds > 0) !== enabled
  ) {
    return null;
  }
  /** operatorUserID 用于当前用户身份判断。 */
  const operatorUserID = readString(extra.operator_user_id);
  /** operatorNickname 是非自己的首选展示名。 */
  const operatorNickname = readString(extra.operator_nickname);
  /** who 与 RN 一致优先显示“你”，否则昵称或“对方”。 */
  const who =
    operatorUserID && operatorUserID === currentUserID
      ? '你'
      : operatorNickname || '对方';
  return enabled
    ? who + '已设置消息在' + formatAutoDeleteSeconds(seconds) + '后自动删除'
    : who + '已关闭消息自动删除';
}

/** 将自动删除枚举格式化为 RN 系统消息时长。 */
function formatAutoDeleteSeconds(seconds: number): string {
  /** labels 覆盖 Gateway 完整枚举中的启用档位。 */
  const labels: Readonly<Record<number, string>> = {
    21_600: '6小时',
    43_200: '12小时',
    86_400: '1天',
    259_200: '3天',
    604_800: '7天',
    1_296_000: '15天',
    2_592_000: '1个月',
    5_184_000: '2个月',
    7_776_000: '3个月',
    15_552_000: '6个月',
  };
  return labels[seconds] ?? String(seconds) + '秒';
}

/** 将未知值收窄为普通 JSON object。 */
function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

/** 读取并裁剪未知文本。 */
function readString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

/** 读取 Gateway 布尔值或规范布尔字符串。 */
function readBoolean(value: unknown): boolean | null {
  if (value === true || value === 'true') return true;
  if (value === false || value === 'false') return false;
  return null;
}
