import { Link } from 'react-router-dom';

import chatIconURL from '../../assets/rn/assets/icons/imm28/tab-chat.svg';
import chatSelectedIconURL from '../../assets/rn/assets/icons/imm28/tab-chat.selected.svg';
import contactsIconURL from '../../assets/rn/assets/icons/imm28/tab-contacts.svg';
import contactsSelectedIconURL from '../../assets/rn/assets/icons/imm28/tab-contacts.selected.svg';
import meIconURL from '../../assets/rn/assets/icons/imm28/tab-me.svg';
import meSelectedIconURL from '../../assets/rn/assets/icons/imm28/tab-me.selected.svg';
import phoneIconURL from '../../assets/rn/assets/icons/imm28/tab-phone.svg';
import phoneSelectedIconURL from '../../assets/rn/assets/icons/imm28/tab-phone.selected.svg';
import { formatConversationUnread } from '../../pages/conversations/conversation-list-view.js';
import { RNAssetIcon } from '../RNAssetIcon.js';
import './primary-tab-bar.css';

/** 主导航标签的稳定路由标识。 */
export type PrimaryTabKey = 'chats' | 'contacts' | 'calls' | 'me';

/** 单个主导航标签的 RN 资产和可用路由。 */
interface PrimaryTabConfig {
  readonly key: PrimaryTabKey;
  readonly label: string;
  readonly href: string | null;
  readonly iconURL: string;
  readonly selectedIconURL: string;
}

/** 全局主导航组件参数。 */
interface PrimaryTabBarProps {
  readonly activeTab: PrimaryTabKey;
  readonly unreadTotal: number;
}

/** 四个标签严格复用 RN HomeTabBar 的顺序、文案和图标。 */
const PRIMARY_TABS: readonly PrimaryTabConfig[] = [
  { key: 'chats', label: '消息', href: '/conversations', iconURL: chatIconURL, selectedIconURL: chatSelectedIconURL },
  { key: 'contacts', label: '通讯录', href: '/contacts', iconURL: contactsIconURL, selectedIconURL: contactsSelectedIconURL },
  { key: 'calls', label: '通话', href: '/calls', iconURL: phoneIconURL, selectedIconURL: phoneSelectedIconURL },
  { key: 'me', label: '我', href: '/me', iconURL: meIconURL, selectedIconURL: meSelectedIconURL },
];

/** 渲染全局 RN 主标签栏；未迁移标签保持可见但不可导航。 */
export function PrimaryTabBar({ activeTab, unreadTotal }: PrimaryTabBarProps) {
  return (
    <nav className="rn-primary-tab-bar" aria-label="主导航" role="tablist">
      {PRIMARY_TABS.map(tab => {
        // selected 决定 RN 实心图标和主文字色。
        const selected = activeTab === tab.key;
        // content 复用链接与禁用按钮完全相同的内部布局。
        const content = (
          <>
            <span className="rn-primary-tab-icon-wrap">
              <RNAssetIcon assetURL={selected ? tab.selectedIconURL : tab.iconURL} />
              {tab.key === 'chats' && unreadTotal > 0 ? (
                <span className={`rn-primary-tab-badge${unreadTotal >= 100 ? ' is-wide' : ''}`}>
                  {formatConversationUnread(unreadTotal)}
                </span>
              ) : null}
            </span>
            <span className="rn-primary-tab-label">{tab.label}</span>
          </>
        );
        return tab.href ? (
          <Link
            className={`rn-primary-tab-item${selected ? ' is-selected' : ''}`}
            aria-current={selected ? 'page' : undefined}
            aria-selected={selected}
            key={tab.key}
            role="tab"
            to={tab.href}
          >
            {content}
          </Link>
        ) : (
          <button
            className="rn-primary-tab-item"
            type="button"
            aria-label={`${tab.label}（暂不可用）`}
            aria-selected={false}
            disabled
            key={tab.key}
            role="tab"
          >
            {content}
          </button>
        );
      })}
    </nav>
  );
}
