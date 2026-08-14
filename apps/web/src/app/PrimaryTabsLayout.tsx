import {
  Activity,
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type UIEventHandler,
} from 'react';
import type { WebIMSync } from '@im28/im-sdk/web';
import { useLocation } from 'react-router-dom';

import {
  PrimaryTabBadgeProvider,
  PrimaryTabBar,
  type PrimaryTabKey,
} from '../components/primary-tabs/index.js';
import { CallsPage } from '../pages/calls/CallsPage.js';
import { getConversationUnreadTotal } from '../pages/conversations/conversation-list-view.js';
import { ConversationsPage } from '../pages/conversations/ConversationsPage.js';
import { useVerificationUnreadCounts } from '../pages/contacts/use-verification-unread.js';
import { MePage } from '../pages/me/MePage.js';
import { useWebIMRuntime } from '../runtime/index.js';
import { getPrimaryTabBarVisible } from './primary-tab-chrome.js';

/** 通讯录主场景保持按需下载，首次切换后由 Activity 保留状态。 */
const ContactsPage = lazy(() => import('../pages/contacts/ContactsPage.js'));

/** 为四个主页面提供可保留场景、稳定 SPA URL 和唯一全局底栏。 */
export function PrimaryTabsLayout() {
  // runtime snapshot 决定底栏认证可见性并驱动实时角标刷新。
  const { runtime, snapshot, restoring } = useWebIMRuntime();
  // location 将 React Router URL 映射为 RN 主标签选中态。
  const location = useLocation();
  // sync 仅用于从当前账号 cache 读取真实会话未读数。
  const sync = useMemo(() => runtime?.getSync() ?? null, [runtime]);
  // unread state 同时接收 cache 基线和会话页最新汇总。
  const [unreadTotal, setUnreadTotal] = usePrimaryTabUnreadTotal(
    sync,
    snapshot.userID,
    snapshot.dataVersion,
  );
  // verificationUnread 复用验证中心的 shared 计数语义，为通讯录页和底栏提供同一快照。
  const verificationUnread = useVerificationUnreadCounts();
  // callsChromeHidden 只接收通话编辑页对主壳底栏的可见性请求。
  const [callsChromeHidden, setCallsChromeHidden] = useState(false);
  /** conversationTabReselectRef 只保存当前消息页注册的只读滚动动作。 */
  const conversationTabReselectRef = useRef<(() => boolean) | null>(null);
  // activeTab 只映射当前已经具备真实路由的主页面。
  const activeTab: PrimaryTabKey = location.pathname.startsWith('/contacts')
    ? 'contacts'
    : location.pathname.startsWith('/calls')
      ? 'calls'
      : location.pathname.startsWith('/me')
        ? 'me'
        : 'chats';
  // reportConversationUnreadTotal 约束异常值后更新全局角标。
  const reportConversationUnreadTotal = useCallback((nextUnreadTotal: number) => {
    setUnreadTotal(Math.max(0, Math.trunc(nextUnreadTotal)));
  }, []);
  /** registerConversationTabReselect 随消息页挂载注册，离开后立即清理。 */
  const registerConversationTabReselect = useCallback((handler: (() => boolean) | null) => {
    conversationTabReselectRef.current = handler;
  }, []);
  /** handleConversationTabReselect 只转发当前页面动作，不读取会话或 DOM。 */
  const handleConversationTabReselect = useCallback(() => (
    conversationTabReselectRef.current?.() ?? false
  ), []);

  // showTabBar 阻止匿名、恢复中、配置失败和通话编辑页显示认证导航。
  const showTabBar = getPrimaryTabBarVisible({
    activeTab,
    callsChromeHidden,
    restoring,
    runtimeReady: Boolean(runtime),
    userID: snapshot.userID,
  });
  return (
    <PrimaryTabBadgeProvider
      verificationUnreadCounts={verificationUnread.counts}
      refreshVerificationUnreadCounts={verificationUnread.refresh}
      reportConversationUnreadTotal={reportConversationUnreadTotal}
      registerConversationTabReselect={registerConversationTabReselect}
    >
      <div
        className={`rn-primary-tabs-layout${showTabBar ? ' has-tab-bar' : ''}`}
        data-im-runtime-state={snapshot.state}
      >
        <div className="rn-primary-tabs-content">
          <PrimaryTabScene tab="chats" activeTab={activeTab}>
            <ConversationsPage />
          </PrimaryTabScene>
          <PrimaryTabScene tab="contacts" activeTab={activeTab}>
            <Suspense fallback={<PrimaryTabLoadingState label="正在加载通讯录" />}>
              <ContactsPage />
            </Suspense>
          </PrimaryTabScene>
          <PrimaryTabScene tab="calls" activeTab={activeTab}>
            <CallsPage onChromeHiddenChange={setCallsChromeHidden} />
          </PrimaryTabScene>
          <PrimaryTabScene tab="me" activeTab={activeTab}>
            <MePage />
          </PrimaryTabScene>
        </div>
        {showTabBar ? (
          <PrimaryTabBar
            activeTab={activeTab}
            contactsUnreadTotal={verificationUnread.counts.total}
            unreadTotal={unreadTotal}
            onConversationTabReselect={handleConversationTabReselect}
          />
        ) : null}
      </div>
    </PrimaryTabBadgeProvider>
  );
}

/** 主场景参数只表达路由选中态和页面内容，不承载业务状态。 */
interface PrimaryTabSceneProps {
  readonly tab: PrimaryTabKey;
  readonly activeTab: PrimaryTabKey;
  readonly children: ReactNode;
}

/** React Activity 隐藏时保留页面状态，并暂停该场景副作用。 */
function PrimaryTabScene({ tab, activeTab, children }: PrimaryTabSceneProps) {
  /** sceneRef 指向当前 Tab 唯一滚动容器。 */
  const sceneRef = useRef<HTMLDivElement | null>(null);
  /** savedScrollTopRef 保存 Activity 隐藏子树前的滚动位置。 */
  const savedScrollTopRef = useRef(0);
  /** visible 决定当前场景是否参与布局和交互。 */
  const visible = tab === activeTab;
  /** handleSceneScroll 只保存用户在可见场景产生的真实滚动位置。 */
  const handleSceneScroll = useCallback<UIEventHandler<HTMLDivElement>>(event => {
    if (visible) savedScrollTopRef.current = event.currentTarget.scrollTop;
  }, [visible]);
  useLayoutEffect(() => {
    if (!visible) return;
    /** scene 在 Activity 恢复内容高度后还原上次滚动位置。 */
    const scene = sceneRef.current;
    if (!scene) return;
    scene.scrollTop = savedScrollTopRef.current;
  }, [visible]);
  return (
    <div
      ref={sceneRef}
      className="rn-primary-tab-scene"
      data-primary-tab-scene={visible ? 'active' : 'inactive'}
      aria-hidden={!visible}
      onScroll={handleSceneScroll}
    >
      <Activity name={`primary-tab-${tab}`} mode={visible ? 'visible' : 'hidden'}>
        {children}
      </Activity>
    </div>
  );
}

/** 主场景异步加载态固定在独立滚动视口内。 */
function PrimaryTabLoadingState({ label }: { readonly label: string }) {
  return <main className="rn-primary-tab-loading" aria-busy="true"><strong>{label}</strong></main>;
}

/** 从当前账号 cache 建立全局消息角标基线，并允许页面上报覆盖。 */
function usePrimaryTabUnreadTotal(
  sync: WebIMSync | null,
  userID: string | null,
  dataVersion: number,
) {
  // unreadTotal 保存主导航当前可见的非静音未读总数。
  const [unreadTotal, setUnreadTotal] = useState(0);
  useEffect(() => {
    if (!sync || !userID) {
      setUnreadTotal(0);
      return;
    }
    // active 防止异步 cache 读取在 runtime 切换后覆盖新账号状态。
    let active = true;
    void sync.conversations
      .listCachedItems({ archived: false, limit: 100 })
      .then(items => {
        if (active) setUnreadTotal(getConversationUnreadTotal(items));
      })
      .catch(() => {
        if (active) setUnreadTotal(0);
      });
    return () => {
      active = false;
    };
  }, [dataVersion, sync, userID]);
  return [unreadTotal, setUnreadTotal] as const;
}
