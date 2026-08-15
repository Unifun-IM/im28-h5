import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { formatIMUserDisplayName, type WebIMContact } from '@im28/im-sdk/web';
import { Link, Navigate } from 'react-router-dom';

import bellIconURL from '../../assets/rn/assets/icons/imm28/bell.solid.svg';
import groupsIconURL from '../../assets/rn/assets/icons/imm28/contact-groups.svg';
import searchIconURL from '../../assets/rn/assets/icons/imm28/search.regular.svg';
import starIconURL from '../../assets/rn/assets/icons/imm28/star.solid.svg';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';
import { usePrimaryTabBadges } from '../../components/primary-tabs/index.js';
import { CallTypeActionSheet } from '../../components/call/CallTypeActionSheet.js';
import { HomeActionMenu } from '../../components/home-actions/HomeActionMenu.js';
import { PullRefreshIndicator } from '../../components/interaction/index.js';
import { usePullRefresh } from '../../hooks/use-pull-refresh.js';
import { useWebIMRuntime } from '../../runtime/index.js';
import { ContactActionMenu } from './ContactActionMenu.js';
import { ContactDeleteSheet } from './ContactActionSheets.js';
import { ContactRow } from './ContactRow.js';
import { VerificationCountBadge } from './VerificationCountBadge.js';
import {
  STARRED_CONTACT_INDEX,
  buildContactListEntries,
  getContactIndexes,
  getContactSectionID,
} from './contact-list-view.js';
import { useContactsPageActions } from './useContactsPageActions.js';
import './contacts-page.css';

/** RN 通讯录核心页通过 Web SDK facade 读取真实 Gateway 好友列表。 */
export function ContactsPage() {
  /** pageRef 用于在保留式主场景内定位独立滚动容器。 */
  const pageRef = useRef<HTMLElement | null>(null);
  // runtime context 是页面唯一允许消费的 SDK owner。
  const { runtime, snapshot, restoring, startupError } = useWebIMRuntime();
  // contacts facade 不向页面暴露 Gateway client 或 token。
  const contactsFacade = useMemo(() => runtime?.getSync().contacts ?? null, [runtime]);
  // contacts 保存已完成分页和归一化的好友记录。
  const [contacts, setContacts] = useState<readonly WebIMContact[]>([]);
  // loading 控制首次加载和刷新状态。
  const [loading, setLoading] = useState(false);
  /** refreshing 区分用户下拉刷新和首次 cache-first 恢复。 */
  const [refreshing, setRefreshing] = useState(false);
  // error 显示真实 SDK/Gateway 失败，不降级为空列表成功。
  const [error, setError] = useState<string | null>(null);
  /** activeIndex 投影 RN 索引栏当前选择态。 */
  const [activeIndex, setActiveIndex] = useState('');
  // verificationCounts 读取主导航壳的唯一计数快照，避免通讯录重复请求两个 facade。
  const {
    verificationUnreadCounts: verificationCounts,
    refreshVerificationUnreadCounts: refreshVerificationCounts,
  } = usePrimaryTabBadges();
  /** removeDeletedContact 只在 shared 删除成功后更新当前列表投影。 */
  const removeDeletedContact = useCallback((userID: string): void => {
    setContacts(current => current.filter(item => item.userID !== userID));
  }, []);
  /** actions 集中持有长按菜单、会话、分享、通话和删除动作。 */
  const actions = useContactsPageActions({
    runtime,
    onContactDeleted: removeDeletedContact,
  });

  /** 先读账号 SQLite cache，再调用唯一 contacts facade 完成远端刷新。 */
  const loadContacts = useCallback(async () => {
    if (!contactsFacade || !snapshot.userID) return;
    setLoading(true);
    setError(null);
    try {
      try {
        /** cachedContacts 保证离线或慢网时先展示当前账号已有好友。 */
        const cachedContacts = await contactsFacade.listCached();
        setContacts(cachedContacts);
      } catch {
        // cache 不可用仍允许 canonical 远端读取给出最终结果。
      }
      setContacts(await contactsFacade.list());
    } catch {
      setError('加载失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, [contactsFacade, snapshot.userID]);

  /** 下拉刷新只执行共享 contacts facade，不在页面复制 Gateway 调用。 */
  const refreshContacts = useCallback(async () => {
    if (!contactsFacade || !snapshot.userID || refreshing) return;
    setRefreshing(true);
    setError(null);
    try {
      // contacts 与 verification counts 对齐 RN 同一次下拉刷新入口。
      const [nextContacts] = await Promise.all([
        contactsFacade.list(),
        refreshVerificationCounts(),
      ]);
      setContacts(nextContacts);
    } catch {
      setError('加载失败，请稍后重试');
    } finally {
      setRefreshing(false);
    }
  }, [contactsFacade, refreshVerificationCounts, refreshing, snapshot.userID]);

  /** pullRefresh 复用跨列表触摸适配器并注入联系人 canonical refresh。 */
  const pullRefresh = usePullRefresh({
    refreshing,
    onRefresh: refreshContacts,
  });

  useEffect(() => {
    void loadContacts();
  }, [loadContacts]);

  useEffect(() => {
    void refreshVerificationCounts();
  }, [refreshVerificationCounts]);

  // entries 聚合星标和普通联系人分组，搜索由独立 RN 全屏路由负责。
  const entries = useMemo(
    () => buildContactListEntries(contacts, ''),
    [contacts],
  );
  // indexes 只展示当前结果实际存在的分组。
  const indexes = useMemo(() => getContactIndexes(entries), [entries]);

  useEffect(() => {
    setActiveIndex(indexes[0] ?? '');
  }, [indexes]);

  /** scrollToTop 对齐 RN 索引栏顶部搜索图标的真实行为。 */
  const scrollToTop = useCallback(() => {
    setActiveIndex(indexes[0] ?? '');
    /** scene 是通讯录所属的 Activity 独立滚动视口。 */
    const scene = pageRef.current?.closest<HTMLElement>('[data-primary-tab-scene]');
    if (scene) scene.scrollTo({ top: 0, behavior: 'smooth' });
    else globalThis.scrollTo({ top: 0, behavior: 'smooth' });
  }, [indexes]);

  /** scrollToIndex 更新活动态并把目标分组滚到 sticky header 下方。 */
  const scrollToIndex = useCallback((index: string) => {
    setActiveIndex(index);
    document.getElementById(getContactSectionID(index))?.scrollIntoView({
      block: 'start',
      behavior: 'smooth',
    });
  }, []);

  if (restoring) return <ContactsPageState label="正在恢复会话" />;
  if (!runtime) {
    return <ContactsPageState label="运行配置不可用" detail={startupError} />;
  }
  if (!snapshot.userID) return <Navigate to="/login" replace />;

  return (
    <main
      ref={pageRef}
      className="rn-contacts-page"
      onTouchStart={pullRefresh.onTouchStart}
      onTouchMove={pullRefresh.onTouchMove}
      onTouchEnd={pullRefresh.onTouchEnd}
      onTouchCancel={pullRefresh.onTouchCancel}
      onPointerDown={pullRefresh.onPointerDown}
      onPointerMove={pullRefresh.onPointerMove}
      onPointerUp={pullRefresh.onPointerUp}
      onPointerCancel={pullRefresh.onPointerCancel}
    >
      <section className="rn-contacts-surface" aria-busy={loading || refreshing}>
        <header className="rn-contacts-header">
          <div className="rn-contacts-header-top">
            <span aria-hidden="true" />
            <h1>通讯录({contacts.length})</h1>
            <div><HomeActionMenu /></div>
          </div>
          <Link className="rn-contacts-search" to="/contacts/search" aria-label="搜索好友或账号ID">
            <RNAssetIcon assetURL={searchIconURL} />
            <span className="rn-contacts-search-placeholder">搜索好友/账号ID</span>
          </Link>
        </header>

        <PullRefreshIndicator
          refreshing={refreshing}
          armed={pullRefresh.armed}
          pullDistance={pullRefresh.pullDistance}
        />

        {error ? (
          <div className="rn-contacts-error" role="alert">
            <span>{error}</span>
            <button type="button" onClick={() => void loadContacts()}>重试</button>
          </div>
        ) : null}

        <section className="rn-contacts-list" aria-label="联系人列表">
          <Link className="rn-contact-shortcut" to="/contacts/verifications/friend">
            <span><RNAssetIcon assetURL={bellIconURL} /></span>
            <strong><span>验证消息</span><VerificationCountBadge count={verificationCounts.total} /></strong>
          </Link>
          <Link className="rn-contact-shortcut is-group-list" to="/contacts/groups">
            <span><RNAssetIcon assetURL={groupsIconURL} /></span>
            <strong>我的群聊</strong>
          </Link>
          {loading && contacts.length === 0 ? (
            <div className="rn-contacts-loading" aria-label="正在加载通讯录"><span /></div>
          ) : error && contacts.length === 0 ? null : entries.length ? (
            entries.map(entry => entry.type === 'section' ? (
              <div
                className="rn-contact-section"
                id={getContactSectionID(entry.title)}
                key={entry.key}
              >
                {entry.title === STARRED_CONTACT_INDEX ? (
                  <RNAssetIcon assetURL={starIconURL} />
                ) : null}
                <span>{entry.title === STARRED_CONTACT_INDEX ? '星标好友' : entry.title}</span>
              </div>
            ) : (
              <ContactRow
                key={entry.key}
                contact={entry.contact}
                onOpenActions={actions.openContactActions}
              />
            ))
          ) : (
            <p className="rn-contacts-empty">当前暂无好友</p>
          )}
        </section>

        {indexes.length ? (
          <nav className="rn-contact-index" aria-label="通讯录索引">
            <button
              type="button"
              className="rn-contact-index-search"
              aria-label="跳转到顶部"
              onClick={scrollToTop}
            >
              <RNAssetIcon assetURL={searchIconURL} />
            </button>
            {indexes.map(index => (
              <button
                type="button"
                key={index}
                className={activeIndex === index ? 'is-active' : undefined}
                aria-current={activeIndex === index ? 'true' : undefined}
                aria-label={`跳转到${index === STARRED_CONTACT_INDEX ? '星标好友' : index}`}
                onClick={() => scrollToIndex(index)}
              >
                {index === STARRED_CONTACT_INDEX ? <RNAssetIcon assetURL={starIconURL} /> : index}
              </button>
            ))}
          </nav>
        ) : null}
        {actions.actionError ? (
          <p className="rn-contact-action-error" role="alert">{actions.actionError}</p>
        ) : null}
        <ContactActionMenu
          menu={actions.actionMenu}
          pending={actions.actionPending}
          onClose={actions.closeActionMenu}
          onAction={actions.handleContactAction}
        />
        <CallTypeActionSheet
          open={Boolean(actions.callTarget)}
          peerName={actions.callTarget?.displayName ||
            formatIMUserDisplayName(actions.callTarget?.userID)}
          pending={actions.actionPending}
          onClose={actions.closeCallTarget}
          onSelect={mediaType => void actions.startContactCall(mediaType)}
        />
        <ContactDeleteSheet
          contact={actions.deleteTarget}
          pending={actions.actionPending}
          onClose={actions.closeDeleteTarget}
          onDelete={scope => void actions.deleteContact(scope)}
        />
      </section>
    </main>
  );
}

/** 统一承载通讯录启动和配置错误。 */
function ContactsPageState({
  label,
  detail,
}: {
  readonly label: string;
  readonly detail?: string | null;
}) {
  return (
    <main className="rn-contacts-page-state">
      <strong>{label}</strong>
      {detail ? <span>{detail}</span> : null}
    </main>
  );
}

export default ContactsPage;
