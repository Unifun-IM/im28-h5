/** 目标选择模式决定是否允许跨标签累积和 ALL。 */
export type ChatTargetPickerSelectionMode = 'single' | 'multiple';

/** 可选择目标只暴露 UI 和提交所需稳定字段。 */
export interface ChatTargetPickerItem {
  readonly key: string;
  readonly kind: 'friend' | 'group';
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly avatarURL: string;
}

/** 单次选择更新参数显式携带模式和目标上限。 */
export interface ToggleChatTargetSelectionOptions {
  readonly current: ReadonlyMap<string, ChatTargetPickerItem>;
  readonly target: ChatTargetPickerItem;
  readonly mode: ChatTargetPickerSelectionMode;
  readonly maxSelected: number;
}

/** 切换单个目标，单选替换集合，多选保留跨标签顺序。 */
export function toggleChatTargetSelection(
  options: ToggleChatTargetSelectionOptions,
): ReadonlyMap<string, ChatTargetPickerItem> {
  /** next 从当前只读集合复制，避免外部 owner 被原地修改。 */
  const next = new Map(options.current);
  if (next.has(options.target.key)) {
    next.delete(options.target.key);
    return next;
  }
  if (options.mode === 'single') return new Map([[options.target.key, options.target]]);
  if (next.size >= options.maxSelected) return next;
  next.set(options.target.key, options.target);
  return next;
}

/** 切换当前可见集合的 ALL，并保持另一标签已选结果。 */
export function toggleAllVisibleChatTargets(
  current: ReadonlyMap<string, ChatTargetPickerItem>,
  visible: readonly ChatTargetPickerItem[],
  maxSelected: number,
): ReadonlyMap<string, ChatTargetPickerItem> {
  /** next 保留当前标签之外的已选目标。 */
  const next = new Map(current);
  /** allSelected 只判断当前过滤结果，搜索时 ALL 仅作用于可见项。 */
  const allSelected = visible.length > 0 && visible.every(target => next.has(target.key));
  for (const target of visible) {
    if (allSelected) {
      next.delete(target.key);
    } else if (!next.has(target.key) && next.size < maxSelected) {
      next.set(target.key, target);
    }
  }
  return next;
}
