import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

/** 建群页样式源码用于保护移动宽度桌面壳层。 */
const createGroupStyles = readFileSync(new URL('./create-group-page.css', import.meta.url), 'utf8');
/** 建群页主体必须与既有 Footer 和复核层共用 480px 桌面宽度。 */
const CREATE_GROUP_SURFACE_RULE = /\.rn-create-group-surface\s*\{[\s\S]*?width:\s*100%;[\s\S]*?min-height:\s*100dvh;[\s\S]*?max-width:\s*480px;[\s\S]*?margin:\s*0 auto;/;

describe('create group responsive layout', () => {
  it('keeps the create surface aligned with the desktop footer and review sheet', () => {
    expect(createGroupStyles).toMatch(CREATE_GROUP_SURFACE_RULE);
  });
});
