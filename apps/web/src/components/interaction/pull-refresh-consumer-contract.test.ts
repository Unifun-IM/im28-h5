import { describe, expect, it } from 'vitest';

/** 页面源码用于结构校验，不执行任何页面数据或路由副作用。 */
const PAGE_SOURCES = import.meta.glob('../../pages/**/*.tsx', {
  eager: true,
  import: 'default',
  query: '?raw',
}) as Record<string, string>;

/** 页面样式源码用于阻止历史下拉提示选择器回流。 */
const PAGE_STYLE_SOURCES = import.meta.glob('../../pages/**/*.css', {
  eager: true,
  import: 'default',
  query: '?raw',
}) as Record<string, string>;

/** 下拉刷新展示 owner 契约锁定手势消费者和全局提示的一对一关系。 */
describe('pull refresh consumer contract', () => {
  /** 所有生产页面只能复用全局三态提示，不得再手写展示 DOM。 */
  it('uses the shared indicator in every pull-refresh page', () => {
    /** consumers 排除测试源码，只保留真实页面手势消费者。 */
    const consumers = Object.entries(PAGE_SOURCES).filter(
      ([path, source]) => !path.includes('.test.') && source.includes('usePullRefresh'),
    );
    expect(consumers.length).toBeGreaterThan(0);
    consumers.forEach(([path, source]) => {
      expect(source, path).toContain('PullRefreshIndicator');
      expect(source, path).not.toMatch(/className=.*rn-[a-z0-9-]*pull/);
    });
  });

  /** 页面 CSS 不得重新声明已经退出的局部提示选择器。 */
  it('keeps legacy page-local pull selectors deleted', () => {
    Object.entries(PAGE_STYLE_SOURCES).forEach(([path, source]) => {
      expect(source, path).not.toMatch(/\.rn-[a-z0-9-]*pull(?:[\s.{:]|$)/);
    });
  });
});
