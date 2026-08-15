import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

/** composerStyles 读取真实 Composer 样式源码。 */
const composerStyles = readFileSync(new URL('./chat-composer-layout.css', import.meta.url), 'utf8');
/** messageStyles 读取真实消息样式源码。 */
const messageStyles = readFileSync(new URL('./chat-message-layout.css', import.meta.url), 'utf8');
/** pageStyles 读取真实页面壳样式源码。 */
const pageStyles = readFileSync(new URL('./chat-page-shell.css', import.meta.url), 'utf8');
/** stateStyles 读取真实页面状态样式源码。 */
const stateStyles = readFileSync(new URL('./chat-page-state.css', import.meta.url), 'utf8');
/** facadeStyles 读取真实 facade 源码并锁定导入顺序。 */
const facadeStyles = readFileSync(new URL('./chat-page.css', import.meta.url), 'utf8');

/** 聊天主样式必须保持小型 facade 和按责任分离的唯一 selector owner。 */
describe('chat page CSS owner contract', () => {
  /** facade 导入顺序必须保持原始级联顺序，响应式覆盖位于最后。 */
  it('keeps a stable facade import order', () => {
    expect(facadeStyles).toMatch(
      /^@import '\.\/chat-page-shell\.css';\n@import '\.\/chat-message-layout\.css';\n@import '\.\/chat-composer-layout\.css';\n@import '\.\/chat-page-state\.css';/,
    );
    expect(facadeStyles).toContain('@media (max-width: 480px)');
    expect(facadeStyles).not.toContain('.rn-chat-composer {');
  });

  /** 页面、消息、Composer 和状态 selector 只能落在对应责任文件。 */
  it('keeps responsibility selectors in their canonical owners', () => {
    expect(pageStyles).toContain('.rn-chat-header {');
    expect(pageStyles).toContain('.rn-chat-message-stage {');
    expect(messageStyles).toContain('.rn-chat-message-row {');
    expect(messageStyles).toContain('.rn-chat-bubble {');
    expect(composerStyles).toContain('.rn-chat-composer {');
    expect(composerStyles).toContain('.rn-chat-action-panel {');
    expect(stateStyles).toContain('.rn-chat-page-state {');
  });
});
