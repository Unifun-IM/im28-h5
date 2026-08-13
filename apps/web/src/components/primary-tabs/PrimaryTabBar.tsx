import { useEffect, useRef, type MouseEvent } from 'react';
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
import { shouldRequestPrimaryConversationTabReselect } from './primary-tab-reselect.js';
import './primary-tab-bar.css';

/** 主导航标签的稳定路由标识。 */
export type PrimaryTabKey = 'chats' | 'contacts' | 'calls' | 'me';

/** 单个主导航标签的 RN 资产和可用路由。 */
interface PrimaryTabConfig {
  readonly key: PrimaryTabKey;
  readonly label: string;
  readonly href: string;
  readonly iconURL: string;
  readonly selectedIconURL: string;
}

/** 全局主导航组件参数。 */
interface PrimaryTabBarProps {
  readonly activeTab: PrimaryTabKey;
  readonly contactsUnreadTotal: number;
  readonly unreadTotal: number;
  readonly onConversationTabReselect: () => boolean;
}

/** 四个标签严格复用 RN HomeTabBar 的顺序、文案和图标。 */
const PRIMARY_TABS: readonly PrimaryTabConfig[] = [
  { key: 'chats', label: '消息', href: '/conversations', iconURL: chatIconURL, selectedIconURL: chatSelectedIconURL },
  { key: 'contacts', label: '通讯录', href: '/contacts', iconURL: contactsIconURL, selectedIconURL: contactsSelectedIconURL },
  { key: 'calls', label: '通话', href: '/calls', iconURL: phoneIconURL, selectedIconURL: phoneSelectedIconURL },
  { key: 'me', label: '我', href: '/me', iconURL: meIconURL, selectedIconURL: meSelectedIconURL },
];

/** 渲染全局 RN 主标签栏并连接四个已迁移主路由。 */
export function PrimaryTabBar({
  activeTab,
  contactsUnreadTotal,
  unreadTotal,
  onConversationTabReselect,
}: PrimaryTabBarProps) {
  /** lastConversationTabPressTimeRef 对齐 RN 320ms 双击窗口。 */
  const lastConversationTabPressTimeRef = useRef(0);

  useEffect(() => {
    if (activeTab !== 'chats') {
      lastConversationTabPressTimeRef.current = 0;
    }
  }, [activeTab]);

  /** handleTabClick 只在已选消息 Tab 的第二次点击触发页面滚动。 */
  function handleTabClick(
    event: MouseEvent<HTMLAnchorElement>,
    tab: PrimaryTabConfig,
    selected: boolean,
  ): void {
    if (tab.key !== 'chats') {
      lastConversationTabPressTimeRef.current = 0;
      return;
    }
    /** now 固定本次用户点击时间，避免一次处理读取多个时钟值。 */
    const now = Date.now();
    /** doublePress 只接受已选消息页内相邻 320ms 的两次点击。 */
    const shouldReselect = shouldRequestPrimaryConversationTabReselect(
      selected,
      unreadTotal,
      lastConversationTabPressTimeRef.current,
      now,
    );
    lastConversationTabPressTimeRef.current = now;
    if (shouldReselect && onConversationTabReselect()) {
      event.preventDefault();
    }
  }
  return (
    <nav className="rn-primary-tab-bar" aria-label="主导航" role="tablist">
      {PRIMARY_TABS.map(tab => {
        // selected 决定 RN 实心图标和主文字色。
        const selected = activeTab === tab.key;
        // badgeCount 分别投影消息未读和好友/群验证未读，其他主 Tab 不展示角标。
        const badgeCount = tab.key === 'chats'
          ? unreadTotal
          : tab.key === 'contacts'
            ? contactsUnreadTotal
            : 0;
        // content 复用四个已迁移主路由完全相同的内部布局。
        const content = (
          <>
            <span className="rn-primary-tab-icon-wrap">
              <RNAssetIcon assetURL={selected ? tab.selectedIconURL : tab.iconURL} />
              {badgeCount > 0 ? (
                <span className={`rn-primary-tab-badge${badgeCount >= 100 ? ' is-wide' : ''}`}>
                  {formatConversationUnread(badgeCount)}
                </span>
              ) : null}
            </span>
            <span className="rn-primary-tab-label">{tab.label}</span>
          </>
        );
        return (
          <Link
            className={`rn-primary-tab-item${selected ? ' is-selected' : ''}`}
            aria-current={selected ? 'page' : undefined}
            aria-selected={selected}
            key={tab.key}
            role="tab"
            to={tab.href}
            onClick={event => handleTabClick(event, tab, selected)}
          >
            {content}
          </Link>
        );
      })}
    </nav>
  );
}
