import { describe, expect, it } from 'vitest';

import {
  toggleAllVisibleChatTargets,
  toggleChatTargetSelection,
  type ChatTargetPickerItem,
} from './chat-target-picker-selection.js';

/** 创建选择规则测试使用的稳定目标。 */
function createTarget(key: string, kind: 'friend' | 'group' = 'friend'): ChatTargetPickerItem {
  return { key, kind, id: key, title: key, description: '', avatarURL: '' };
}

describe('chat target picker selection', () => {
  it('replaces the previous target in single mode', () => {
    /** first 是单选初始目标。 */
    const first = createTarget('friend:1');
    /** second 是下一次单选目标。 */
    const second = createTarget('group:2', 'group');
    expect([...toggleChatTargetSelection({
      current: new Map([[first.key, first]]), target: second, mode: 'single', maxSelected: 50,
    }).keys()]).toEqual([second.key]);
  });

  it('selects and clears visible ALL while preserving the other tab', () => {
    /** group 是另一标签已选目标。 */
    const group = createTarget('group:1', 'group');
    /** friends 是当前标签可见目标。 */
    const friends = [createTarget('friend:1'), createTarget('friend:2')];
    /** selected 是执行 ALL 后的跨标签集合。 */
    const selected = toggleAllVisibleChatTargets(new Map([[group.key, group]]), friends, 50);
    expect([...selected.keys()]).toEqual([group.key, friends[0]!.key, friends[1]!.key]);
    expect([...toggleAllVisibleChatTargets(selected, friends, 50).keys()]).toEqual([group.key]);
  });

  it('does not exceed the configured multiple-selection limit', () => {
    /** targets 模拟当前标签三个可见目标。 */
    const targets = [createTarget('friend:1'), createTarget('friend:2'), createTarget('friend:3')];
    expect(toggleAllVisibleChatTargets(new Map(), targets, 2).size).toBe(2);
  });
});
