import type { IMBroadcastTarget } from '@im28/im-sdk/web';

/** 群发路由状态只保存稳定目标身份和受控返回页。 */
export interface BroadcastRouteState {
  readonly targets: readonly IMBroadcastTarget[];
  readonly backHref: '/conversations' | '/contacts';
}

/** 从未知 Router state 读取去重且合法的群发身份。 */
export function readBroadcastRouteState(value: unknown): BroadcastRouteState | null {
  if (!value || typeof value !== 'object') return null;
  /** record 只读取本应用写入的 targets 和 backHref。 */
  const record = value as { readonly targets?: unknown; readonly backHref?: unknown };
  if (!Array.isArray(record.targets)) return null;
  /** targets 保持首见顺序并拒绝非法客户端类型。 */
  const targets: IMBroadcastTarget[] = [];
  /** seen 防止刷新恢复时重复显示同一目标。 */
  const seen = new Set<string>();
  for (const item of record.targets) {
    if (!item || typeof item !== 'object') continue;
    /** target 只接受 shared SDK 定义的两个身份字段。 */
    const target = item as { readonly kind?: unknown; readonly targetID?: unknown };
    if (target.kind !== 'friend' && target.kind !== 'group') continue;
    /** targetID 必须是非空字符串。 */
    const targetID = typeof target.targetID === 'string' ? target.targetID.trim() : '';
    if (!targetID) continue;
    /** key 分离好友和群的身份空间。 */
    const key = `${target.kind}:${targetID}`;
    if (seen.has(key)) continue;
    seen.add(key);
    targets.push({ kind: target.kind, targetID });
  }
  if (!targets.length) return null;
  /** backHref 只允许首页两个已有入口。 */
  const backHref = record.backHref === '/contacts' ? '/contacts' : '/conversations';
  return { targets, backHref };
}

/** 从首页入口 state 读取受控返回页。 */
export function readBroadcastBackHref(value: unknown): '/conversations' | '/contacts' {
  if (!value || typeof value !== 'object') return '/conversations';
  /** backHref 不能接受任意外部 URL。 */
  const backHref = (value as { readonly backHref?: unknown }).backHref;
  return backHref === '/contacts' ? '/contacts' : '/conversations';
}
