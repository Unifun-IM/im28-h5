import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

/** 群申请页面样式源码用于防止桌面壳层约束回退。 */
const groupApplicationsStyles = readFileSync(new URL('./group-applications-page.css', import.meta.url), 'utf8');
/** 验证消息页面样式源码用于防止桌面壳层约束回退。 */
const verificationMessagesStyles = readFileSync(new URL('./verification-messages-page.css', import.meta.url), 'utf8');
/** 验证页面桌面壳层必须保持与其他移动页面一致的居中宽度。 */
const DESKTOP_SURFACE_RULE = /width:\s*100%;[\s\S]*?min-height:\s*100dvh;[\s\S]*?max-width:\s*480px;[\s\S]*?margin:\s*0 auto;/;

describe('verification responsive layout', () => {
  it('keeps verification and group application surfaces mobile-width on desktop', () => {
    expect(verificationMessagesStyles).toMatch(DESKTOP_SURFACE_RULE);
    expect(groupApplicationsStyles).toMatch(DESKTOP_SURFACE_RULE);
  });
});
