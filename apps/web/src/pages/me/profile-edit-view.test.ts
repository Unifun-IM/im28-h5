import { describe, expect, it } from 'vitest';

import {
  readMeProfileRouteState,
  shouldSubmitProfileNicknameKey,
} from './profile-edit-view.js';

/** 个人资料快捷动作只接受应用内部定义的精确布尔合同。 */
describe('readMeProfileRouteState', () => {
  /** 非对象、缺失字段和相似真值都不能触发头像来源弹层。 */
  it('rejects unknown and truthy lookalike values', () => {
    expect(readMeProfileRouteState(null)).toEqual({ openAvatarSource: false });
    expect(readMeProfileRouteState('avatar')).toEqual({ openAvatarSource: false });
    expect(readMeProfileRouteState({ openAvatarSource: 'true' })).toEqual({ openAvatarSource: false });
  });

  /** 精确 true 触发已有头像来源 owner，其他字段不会改变合同。 */
  it('accepts only the explicit avatar shortcut', () => {
    expect(readMeProfileRouteState({ openAvatarSource: true, ignored: true })).toEqual({
      openAvatarSource: true,
    });
  });
});

/** 昵称输入只把明确完成键交给既有保存链。 */
describe('shouldSubmitProfileNicknameKey', () => {
  /** 普通 Enter 对齐 RN onSubmitEditing。 */
  it('accepts a single non-composing Enter key', () => {
    expect(shouldSubmitProfileNicknameKey({ key: 'Enter', isComposing: false, repeat: false })).toBe(true);
  });

  /** 中文输入确认、长按重复和其他按键不能提前提交。 */
  it('rejects composing, repeated and non-Enter keys', () => {
    expect(shouldSubmitProfileNicknameKey({ key: 'Enter', isComposing: true, repeat: false })).toBe(false);
    expect(shouldSubmitProfileNicknameKey({ key: 'Enter', isComposing: false, repeat: true })).toBe(false);
    expect(shouldSubmitProfileNicknameKey({ key: 'NumpadEnter', isComposing: false, repeat: false })).toBe(false);
  });
});
