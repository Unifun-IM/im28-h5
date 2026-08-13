import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { PrimaryTabBar } from './PrimaryTabBar.js';

/** 使用路由上下文渲染主标签栏静态合同。 */
function renderPrimaryTabBar(options: {
  readonly activeTab?: 'chats' | 'contacts' | 'calls' | 'me';
  readonly contactsUnreadTotal?: number;
  readonly unreadTotal?: number;
} = {}): string {
  return renderToStaticMarkup(
    <MemoryRouter>
      <PrimaryTabBar
        activeTab={options.activeTab ?? 'chats'}
        contactsUnreadTotal={options.contactsUnreadTotal ?? 0}
        unreadTotal={options.unreadTotal ?? 0}
        onConversationTabReselect={() => false}
      />
    </MemoryRouter>,
  );
}

describe('PrimaryTabBar', () => {
  it('分别展示消息未读和通讯录验证未读角标', () => {
    // markup 同时覆盖两个独立角标入口，防止通讯录计数误覆盖消息计数。
    const markup = renderPrimaryTabBar({ unreadTotal: 8, contactsUnreadTotal: 12 });
    expect(markup).toContain('>8<');
    expect(markup).toContain('>12<');
  });

  it('通讯录计数遵循零隐藏和 RN 999+ 上限', () => {
    expect(renderPrimaryTabBar()).not.toContain('rn-primary-tab-badge');
    expect(renderPrimaryTabBar({ contactsUnreadTotal: 150 })).toContain('>150<');
    expect(renderPrimaryTabBar({ contactsUnreadTotal: 1200 })).toContain('>999+<');
  });

  it('四个已迁移主标签全部保持可导航', () => {
    // markup 用于确认迁移完成后不再保留禁用按钮分支。
    const markup = renderPrimaryTabBar();
    expect(markup.match(/role="tab"/g)).toHaveLength(4);
    expect(markup).not.toContain('暂不可用');
    expect(markup).not.toContain('disabled=""');
  });
});
