import { describe, expect, it } from 'vitest';

import messageViewSource from './chat-message-view.ts?raw';
import primitiveSource from './chat-message-view-primitives.ts?raw';
import {
  asRecord,
  formatChatMessageTime,
  formatDuration,
  formatFileSize,
  readFirstRecord,
  readNestedString,
  readNestedText,
  readNumber,
  readPositiveNumber,
  readString,
} from './chat-message-view-primitives.js';

/** 消息 view primitive owner 锁定未知 payload 的 fail-closed 基础规则。 */
describe('chat message view primitives', () => {
  /** 对象与数组读取拒绝 null、primitive 和数组伪对象。 */
  it('narrows unknown records and first array entries safely', () => {
    expect(asRecord({ value: 1 })).toEqual({ value: 1 });
    expect(asRecord(null)).toEqual({});
    expect(asRecord([])).toEqual({});
    expect(readFirstRecord([{ value: 1 }])).toEqual({ value: 1 });
    expect(readFirstRecord(['invalid'])).toEqual({});
    expect(readFirstRecord({ value: 1 })).toEqual({});
  });

  /** 普通字段去空白，正文只用空白校验并保留 UTF-16 原文。 */
  it('trims display strings while preserving source text', () => {
    // source 同时覆盖普通展示字段和实体敏感正文。
    const source = { owner: { title: '  标题  ', text: ' A😎B ' } };

    expect(readString(' value ')).toBe('value');
    expect(readString(1)).toBe('');
    expect(readNestedString(source, 'owner', 'title')).toBe('标题');
    expect(readNestedText(source, 'owner', 'text')).toBe(' A😎B ');
    expect(readNestedText({ owner: { text: '   ' } }, 'owner', 'text')).toBe('');
  });

  /** 数值、媒体尺寸、时长和文件大小保持既有边界格式。 */
  it('normalizes numeric media presentation values', () => {
    expect(readNumber('1536')).toBe(1536);
    expect(readNumber(Number.POSITIVE_INFINITY)).toBe(0);
    expect(readPositiveNumber('400')).toBe(400);
    expect(readPositiveNumber(0)).toBeUndefined();
    expect(formatDuration(62)).toBe('1:02');
    expect(formatDuration(0)).toBe('');
    expect(formatChatMessageTime(0)).toBe('');
    expect(formatChatMessageTime(1_700_000_000)).toMatch(/^\d{2}:\d{2}$/);
    expect(formatFileSize(512)).toBe('512 B');
    expect(formatFileSize('1536')).toBe('1.5 KB');
    expect(formatFileSize(2 * 1024 * 1024)).toBe('2.0 MB');
  });

  /** contentType 分发保留在唯一 view owner，primitive 不演化为第二 parser。 */
  it('keeps message dispatch out of the primitive owner', () => {
    expect(messageViewSource).toContain("from './chat-message-view-primitives.js'");
    expect(messageViewSource).toContain('export function getChatMessageView');
    expect(primitiveSource).not.toMatch(/contentType|ChatMessageView|@im28\/im-sdk/);
    expect(messageViewSource.split('\n').length).toBeLessThanOrEqual(301);
    expect(primitiveSource.split('\n').length).toBeLessThanOrEqual(301);
  });
});
