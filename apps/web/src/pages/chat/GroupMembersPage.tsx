import { useCallback, useEffect, useState } from 'react';
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
import { GroupMemberRow } from './GroupMemberRow.js';
import { useGroupMembersPageState } from './useGroupMembersPageState.js';
import './group-members-page.css';

/** RN 群成员完整列表只消费共享 groupMembers facade。 */
export function GroupMembersPage() {
  // conversationID 由稳定的群设置子路由提供。
  const { conversationID = '' } = useParams();
  // location 为资料页保存准确的群成员返回路由。
  const location = useLocation();
  // runtime context 提供认证快照和唯一 Web sync composition。
  const { runtime, snapshot, restoring, startupError } = useWebIMRuntime();
  // activeIndex 投影 RN 右侧索引当前态。
  const [activeIndex, setActiveIndex] = useState('');
  // state 统一承载 cache-first、完整同步、搜索投影和 presence observation。
  const state = useGroupMembersPageState({
    runtime,
    userID: snapshot.userID,
    conversationID,
  });

  /** pullRefresh 复用会话/联系人列表的浏览器触摸适配器。 */
  const pullRefresh = usePullRefresh({
    refreshing: state.refreshing,
    onRefresh: state.refreshMembers,
  });
  // settingsURL 是本页固定返回目标。
  const settingsURL = `/conversations/${encodeURIComponent(conversationID)}/settings`;
  useEffect(() => {
    setActiveIndex(state.indexes[0] ?? '');
  }, [state.indexes]);

  /** 返回顶部并恢复首个索引活动态。 */
  const scrollToTop = useCallback(() => {
    setActiveIndex(state.indexes[0] ?? '');
    globalThis.scrollTo({ top: 0, behavior: 'smooth' });
  }, [state.indexes]);

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
      aria-busy={state.loading || state.refreshing}
      onTouchStart={pullRefresh.onTouchStart}
      onTouchMove={pullRefresh.onTouchMove}
      onTouchEnd={pullRefresh.onTouchEnd}
      onTouchCancel={pullRefresh.onTouchCancel}
      onPointerDown={pullRefresh.onPointerDown}
      onPointerMove={pullRefresh.onPointerMove}
      onPointerUp={pullRefresh.onPointerUp}
      onPointerCancel={pullRefresh.onPointerCancel}
    >
      <section className="rn-group-members-surface">
        <PageNavbar className="rn-group-members-header">
          <Link to={settingsURL} aria-label="返回群设置"><RNAssetIcon assetURL={backIconURL} /></Link>
          <h1>群成员（{state.memberCount}）</h1>
          <span aria-hidden="true" />
        </PageNavbar>
        <label className="rn-group-members-search">
          <span className="sr-only">搜索群成员</span>
          <RNAssetIcon assetURL={searchIconURL} />
          <input
            type="search"
            value={state.keyword}
            placeholder="搜索"
            onChange={event => state.changeKeyword(event.target.value)}
          />
          {state.keyword ? (
            <button type="button" aria-label="清除" onClick={() => state.changeKeyword('')}>
              <RNAssetIcon assetURL={clearIconURL} />
            </button>
          ) : null}
        </label>
        <PullRefreshIndicator
          refreshing={state.refreshing}
          armed={pullRefresh.armed}
          pullDistance={pullRefresh.pullDistance}
        />
        {state.error ? (
          <div className="rn-group-members-error" role="alert">
            <span>{state.error}</span>
            <button type="button" onClick={() => void state.loadMembers()}>重试</button>
          </div>
        ) : null}
        <section className="rn-group-members-list" aria-label="群成员列表">
          {state.entries.map(entry => entry.type === 'section' ? (
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
              online={Boolean(state.onlineByID[entry.member.userID])}
              showOnlineStatus={state.showOnlineStatus}
            />
          ))}
          {state.loading && state.members.length === 0 ? (
            <div className="rn-group-members-loading" aria-label="正在加载群成员"><span /></div>
          ) : null}
          {!state.loading && !state.error && state.entries.length === 0 ? (
            <p className="rn-group-members-empty">
              {state.keyword.trim() ? '未找到相关成员' : '暂无群成员'}
            </p>
          ) : null}
        </section>
        {state.indexes.length ? (
          <nav className="rn-group-members-index" aria-label="群成员索引">
            <button type="button" aria-label="跳转到顶部" onClick={scrollToTop}>
              <RNAssetIcon assetURL={searchIconURL} />
            </button>
            {state.indexes.map(index => (
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
