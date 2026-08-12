import { describe, expect, it } from 'vitest';

import {
  compareContactIndexedNames,
  getContactIndexKey,
  getContactSortKey,
} from './contact-index-helpers.js';

// 联系人索引回归锁定 RN pinyin-pro 参数和 fallback 语义。
describe('contact index helpers', () => {
  it('使用中文姓名和多音地名的拼音首字母', () => {
    expect(getContactIndexKey('张三')).toBe('Z');
    expect(getContactIndexKey('李四')).toBe('L');
    expect(getContactIndexKey('重庆')).toBe('C');
  });

  it('保留拉丁首字母并将数字、符号和空名称归入井号', () => {
    expect(getContactIndexKey(' Uma')).toBe('U');
    expect(getContactIndexKey('Vera')).toBe('V');
    expect(getContactIndexKey('1号')).toBe('#');
    expect(getContactIndexKey('😊用户')).toBe('#');
    expect(getContactIndexKey('   ')).toBe('#');
  });

  it('使用 RN 同一拼音参数排序中文和拉丁名称', () => {
    /** names 模拟群成员页面的混合展示名称。 */
    const names = ['张三', 'Alice', '李四'];
    expect([...names].sort(compareContactIndexedNames)).toEqual(['Alice', '李四', '张三']);
    expect(getContactSortKey('重庆')).toBe('chongqing');
  });
});
