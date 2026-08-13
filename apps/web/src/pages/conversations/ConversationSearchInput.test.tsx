import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { ConversationSearchInput } from './ConversationSearchInput.js';

// 搜索输入 contract 锁定 RN 默认有值可清除、空值隐藏按钮。
describe('ConversationSearchInput', () => {
  /** 构造不执行副作用的服务端静态视图。 */
  function renderInput(value: string): string {
    return renderToStaticMarkup(
      <ConversationSearchInput value={value} onChange={vi.fn()} onSubmit={vi.fn()} />,
    );
  }

  it('shows the RN clear control only when the query has content', () => {
    expect(renderInput('donk')).toContain('aria-label="清除"');
    expect(renderInput('')).not.toContain('aria-label="清除"');
  });

  it('keeps the search input semantics', () => {
    /** markup 证明输入仍是 search、关闭自动填充且保留占位文案。 */
    const markup = renderInput('donk');
    expect(markup).toContain('type="search"');
    expect(markup).toContain('autoComplete="off"');
    expect(markup).toContain('placeholder="搜索"');
  });
});
