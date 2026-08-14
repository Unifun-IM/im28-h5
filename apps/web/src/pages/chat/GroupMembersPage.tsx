import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type {
  Conversation,
  WebIMGroupMember,
  WebIMJoinedGroup,
} from '@im28/im-sdk/web';
import {
  Link,
  Navigate,
  useLocation,
  useParams,
} from 'react-router-dom';

import backIconURL from '../../assets/rn/assets/icons/imm28/nav-arrow-left.regular.svg';
import clearIconURL from '../../assets/rn/assets/icons/imm28/xmark-circle.solid.svg';
import searchIconURL from '../../assets/rn/assets/icons/imm28/search.regular.svg';
import { PullRefreshIndicator } from '../../components/interaction/index.js';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';
import { PageNavbar } from '../../components/navigation/PageNavbar.js';
import { usePullRefresh } from '../../hooks/use-pull-refresh.js';
import { useWebIMRuntime } from '../../runtime/index.js';
import {
  buildGroupMemberListEntries,
  getGroupMemberIndexes,
  shouldShowGroupMemberPresence,
} from './group-members-view.js';
import { GroupMemberRow } from './GroupMemberRow.js';
import { useObservedUserPresence } from './useObservedUserPresence.js';
import './group-members-page.css';

/** RN 群成员完整列表只消费共享 groupMembers facade。 */
export function GroupMembersPage() {
  // conversationID 由稳定的群设置子路由提供。
  const { conversationID = '' } = useParams();
  // location 为资料页保存准确的群成员返回路由。
  const location = useLocation();
  // runtime context 提供认证快照和唯一 Web sync composition。
  const { runtime, snapshot, restoring, startupError } = useWebIMRuntime();
  // sync 生命周期绑定当前认证 runtime。
  const sync = useMemo(() => runtime?.getSync() ?? null, [runtime]);
  // conversation 保存当前账号缓存命中的群会话。
  const [conversation, setConversation] = useState<Conversation | null>(null);
  // group 保存人数等共享群事实。
  const [group, setGroup] = useState<WebIMJoinedGroup | null>(null);
  // members 保存完整 cache-first 成员快照。
  const [members, setMembers] = useState<readonly WebIMGroupMember[]>([]);
  // keyword 驱动名称和用户 ID 本地搜索。
  const [keyword, setKeyword] = useState('');
  // loading 覆盖首次 cache-first 读取。
  const [loading, setLoading] = useState(true);
  // refreshing 区分用户下拉刷新和首次恢复。
  const [refreshing, setRefreshing] = useState(false);
  // error 保留真实 SQLite 或 Gateway 失败。
  const [error, setError] = useState<string | null>(null);
  // activeIndex 投影 RN 右侧索引当前态。
  const [activeIndex, setActiveIndex] = useState('');
  // loadIDRef 阻止离开或快速切换路由后的旧请求写回。
  const loadIDRef = useRef(0);

  /** 解析真实群会话并按 cache、远端顺序加载完整成员。 */
  const loadMembers = useCallback(async (): Promise<void> => {
    if (!sync || !snapshot.userID || !conversationID) return;
    /** loadID 标识本次 cache-first 请求链。 */
    const loadID = loadIDRef.current + 1;
    loadIDRef.current = loadID;
    setLoading(true);
    setError(null);
    try {
      /** conversations 先读当前账号 SQLite，缺失时才完整同步。 */
      let conversations = await sync.conversations.listCached({ limit: 500 });
      /** target 必须是当前账号真实群会话。 */
      let target = conversations.find(item => item.conversationID === conversationID);
      if (!target) {
        conversations = await sync.conversations.sync({ pageSize: 100 });
        target = conversations.find(item => item.conversationID === conversationID);
      }
      if (!target || target.type !== 'group' || !target.targetID.trim()) {
        throw new Error('群聊不存在或尚未同步');
      }
      if (loadIDRef.current !== loadID) return;
      setConversation(target);
      /** groupID 只来自共享 Conversation targetID。 */
      const groupID = target.targetID.trim();
      /** cachedGroups 保证弱网时先恢复人数等群事实。 */
      const cachedGroups = await sync.groups.listCached();
      if (loadIDRef.current !== loadID) return;
      setGroup(cachedGroups.find(item => item.groupID === groupID) ?? null);
      try {
        /** cachedMembers 允许页面在远端刷新前立即展示。 */
        const cachedMembers = await sync.groupMembers.listCached(groupID);
        if (loadIDRef.current !== loadID) return;
        setMembers(cachedMembers);
      } catch {
        // cache 读取失败仍让 canonical 远端同步给出最终结果。
      }
      /** refreshedGroups 先保证成员 facade 所需群 cache 存在。 */
      const refreshedGroups = await sync.groups.sync({ pageSize: 100 });
      if (loadIDRef.current !== loadID) return;
      setGroup(refreshedGroups.find(item => item.groupID === groupID) ?? null);
      /** refreshedMembers 是完整全分页、success-only 替换后的结果。 */
      const refreshedMembers = await sync.groupMembers.sync(groupID, { pageSize: 100 });
      if (loadIDRef.current !== loadID) return;
      setMembers(refreshedMembers);
    } catch (cause) {
      if (loadIDRef.current === loadID) setError(readGroupMembersError(cause));
    } finally {
      if (loadIDRef.current === loadID) setLoading(false);
    }
  }, [conversationID, snapshot.userID, sync]);

  /** 下拉刷新只调用既有群和成员 facade。 */
  const refreshMembers = useCallback(async (): Promise<void> => {
    if (!sync || !conversation || refreshing) return;
    /** loadID 让显式刷新取代仍在途的首次请求。 */
    const loadID = loadIDRef.current + 1;
    loadIDRef.current = loadID;
    setLoading(false);
    setRefreshing(true);
    setError(null);
    try {
      /** groupID 已由真实群会话验证。 */
      const groupID = conversation.targetID;
      /** refreshedGroups 更新总人数和群状态。 */
      const refreshedGroups = await sync.groups.sync({ pageSize: 100 });
      if (loadIDRef.current !== loadID) return;
      setGroup(refreshedGroups.find(item => item.groupID === groupID) ?? null);
      /** refreshedMembers 完成全分页后再一次写回页面。 */
      const refreshedMembers = await sync.groupMembers.sync(groupID, { pageSize: 100 });
      if (loadIDRef.current !== loadID) return;
      setMembers(refreshedMembers);
    } catch (cause) {
      if (loadIDRef.current === loadID) setError(readGroupMembersError(cause));
    } finally {
      if (loadIDRef.current === loadID) setRefreshing(false);
    }
  }, [conversation, refreshing, sync]);

  /** pullRefresh 复用会话/联系人列表的浏览器触摸适配器。 */
  const pullRefresh = usePullRefresh({
    refreshing,
    onRefresh: refreshMembers,
  });

  useEffect(() => {
    void loadMembers();
    return () => {
      loadIDRef.current += 1;
    };
  }, [loadMembers]);

  // entries 复用 SDK 名称 owner并仅做 RN 拼音列表投影。
  const entries = useMemo(
    () => buildGroupMemberListEntries(members, keyword),
    [keyword, members],
  );
  // indexes 只显示当前筛选结果真实存在的分组。
  const indexes = useMemo(() => getGroupMemberIndexes(entries), [entries]);
  // settingsURL 是本页固定返回目标。
  const settingsURL = `/conversations/${encodeURIComponent(conversationID)}/settings`;
  // memberCount 优先使用群事实，冷 cache 时回退完整成员数。
  const memberCount = group?.memberCount || members.length;
  // showOnlineStatus 只接受 shared mode=normal 判定。
  const showOnlineStatus = shouldShowGroupMemberPresence(group);
  // memberUserIDs 为当前完整成员快照建立一个批量 presence observation。
  const memberUserIDs = useMemo(() => members.map(member => member.userID), [members]);
  // onlineByID 仅保存当前页面内存状态，不进入成员 DTO 或 SQLite。
  const onlineByID = useObservedUserPresence({
    runtime,
    accountUserID: snapshot.userID,
    userIDs: memberUserIDs,
    visible: showOnlineStatus,
  });

  useEffect(() => {
    setActiveIndex(indexes[0] ?? '');
  }, [indexes]);

  /** 返回顶部并恢复首个索引活动态。 */
  const scrollToTop = useCallback(() => {
    setActiveIndex(indexes[0] ?? '');
    globalThis.scrollTo({ top: 0, behavior: 'smooth' });
  }, [indexes]);

  /** 跳转到成员字母分组并更新当前态。 */
  const scrollToIndex = useCallback((index: string) => {
    setActiveIndex(index);
    document.getElementById(getGroupMemberSectionID(index))?.scrollIntoView({
      block: 'start',
      behavior: 'smooth',
    });
  }, []);

  if (restoring) return <GroupMembersPageState label="正在恢复群成员" />;
  if (!runtime) return <GroupMembersPageState label="运行配置不可用" detail={startupError} />;
  if (!snapshot.userID) return <Navigate to="/login" replace />;
  if (!conversationID) return <Navigate to="/conversations" replace />;

  return (
    <main
      className="rn-group-members-page"
      aria-busy={loading || refreshing}
      onTouchStart={pullRefresh.onTouchStart}
      onTouchMove={pullRefresh.onTouchMove}
      onTouchEnd={pullRefresh.onTouchEnd}
      onTouchCancel={pullRefresh.onTouchCancel}
    >
      <section className="rn-group-members-surface">
        <PageNavbar className="rn-group-members-header">
          <Link to={settingsURL} aria-label="返回群设置"><RNAssetIcon assetURL={backIconURL} /></Link>
          <h1>群成员（{memberCount}）</h1>
          <span aria-hidden="true" />
        </PageNavbar>
        <label className="rn-group-members-search">
          <span className="sr-only">搜索群成员</span>
          <RNAssetIcon assetURL={searchIconURL} />
          <input
            type="search"
            value={keyword}
            placeholder="搜索"
            onChange={event => setKeyword(event.target.value)}
          />
          {keyword ? (
            <button type="button" aria-label="清除" onClick={() => setKeyword('')}>
              <RNAssetIcon assetURL={clearIconURL} />
            </button>
          ) : null}
        </label>
        <PullRefreshIndicator
          refreshing={refreshing}
          armed={pullRefresh.armed}
          pullDistance={pullRefresh.pullDistance}
        />
        {error ? (
          <div className="rn-group-members-error" role="alert">
            <span>{error}</span>
            <button type="button" onClick={() => void loadMembers()}>重试</button>
          </div>
        ) : null}
        <section className="rn-group-members-list" aria-label="群成员列表">
          {entries.map(entry => entry.type === 'section' ? (
            <div
              className="rn-group-members-section"
              id={getGroupMemberSectionID(entry.title)}
              key={entry.key}
            >
              {entry.title}
            </div>
          ) : (
            <GroupMemberRow
              key={entry.key}
              entry={entry}
              backHref={location.pathname}
              groupConversationID={conversationID}
              online={Boolean(onlineByID[entry.member.userID])}
              showOnlineStatus={showOnlineStatus}
            />
          ))}
          {loading && members.length === 0 ? (
            <div className="rn-group-members-loading" aria-label="正在加载群成员"><span /></div>
          ) : null}
          {!loading && !error && entries.length === 0 ? (
            <p className="rn-group-members-empty">
              {keyword.trim() ? '未找到相关成员' : '暂无群成员'}
            </p>
          ) : null}
        </section>
        {indexes.length ? (
          <nav className="rn-group-members-index" aria-label="群成员索引">
            <button type="button" aria-label="跳转到顶部" onClick={scrollToTop}>
              <RNAssetIcon assetURL={searchIconURL} />
            </button>
            {indexes.map(index => (
              <button
                type="button"
                key={index}
                className={activeIndex === index ? 'is-active' : undefined}
                aria-current={activeIndex === index ? 'true' : undefined}
                aria-label={`跳转到${index}`}
                onClick={() => scrollToIndex(index)}
              >
                {index}
              </button>
            ))}
          </nav>
        ) : null}
      </section>
    </main>
  );
}

/** 为成员分组生成稳定 DOM anchor。 */
function getGroupMemberSectionID(index: string): string {
  return `group-member-section-${encodeURIComponent(index)}`;
}

/** 将群成员异常转换为不含凭据的页面文案。 */
function readGroupMembersError(cause: unknown): string {
  return cause instanceof Error && cause.message ? cause.message : '群成员加载失败，请稍后重试';
}

/** 群成员启动状态参数。 */
interface GroupMembersPageStateProps {
  readonly label: string;
  readonly detail?: string | null;
}

/** 统一承载群成员恢复和配置错误。 */
function GroupMembersPageState({ label, detail }: GroupMembersPageStateProps) {
  return <main className="rn-group-members-state"><strong>{label}</strong>{detail ? <span>{detail}</span> : null}</main>;
}

export default GroupMembersPage;
