import { useCallback, useEffect, useMemo, useState } from 'react';
import type { WebIMJoinedGroup } from '@im28/im-sdk/web';
import { Link, Navigate, useNavigate } from 'react-router-dom';

import backIconURL from '../../assets/rn/assets/icons/imm28/nav-arrow-left.regular.svg';
import clearIconURL from '../../assets/rn/assets/icons/imm28/xmark-circle.solid.svg';
import searchIconURL from '../../assets/rn/assets/icons/imm28/search.regular.svg';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';
import { useWebIMRuntime } from '../../runtime/index.js';
import { JoinedGroupRow } from './JoinedGroupRow.js';
import {
  filterJoinedGroups,
  findJoinedGroupConversationID,
} from './joined-group-view.js';
import './joined-groups-page.css';

/** RN 我的群聊页面使用 cache-first groups facade 和真实会话 facade。 */
export function JoinedGroupsPage() {
  // runtime context 是页面唯一 SDK 入口。
  const { runtime, snapshot, restoring, startupError } = useWebIMRuntime();
  // navigate 只负责 React Router SPA 页面切换。
  const navigate = useNavigate();
  // groups 保存 SQLite 或完整远端同步结果。
  const [groups, setGroups] = useState<readonly WebIMJoinedGroup[]>([]);
  // keyword 驱动群名和群 ID 本地搜索。
  const [keyword, setKeyword] = useState('');
  // loading 覆盖首次缓存读取和远端刷新。
  const [loading, setLoading] = useState(false);
  // openingGroupID 阻止重复打开群会话。
  const [openingGroupID, setOpeningGroupID] = useState('');
  // error 显示真实数据库、Gateway 或会话失败。
  const [error, setError] = useState<string | null>(null);

  /** 先读取当前账号 SQLite，再用完整 Gateway 快照刷新。 */
  const loadGroups = useCallback(async (): Promise<void> => {
    if (!runtime || !snapshot.userID) return;
    // facade 绑定 runtime 的 account database 和 Gateway owners。
    const facade = runtime.getSync().groups;
    setLoading(true);
    setError(null);
    try {
      // cachedGroups 允许离线或弱网时立即展示上次完整快照。
      const cachedGroups = await facade.listCached();
      setGroups(cachedGroups);
      // syncedGroups 只在远端全分页成功并替换 SQLite 后返回。
      const syncedGroups = await facade.sync({ pageSize: 50 });
      setGroups(syncedGroups);
    } catch (cause) {
      setError(readJoinedGroupError(cause));
    } finally {
      setLoading(false);
    }
  }, [runtime, snapshot.userID]);

  useEffect(() => { void loadGroups(); }, [loadGroups]);

  /** 从 cache 或远端会话列表解析真实 conversation 后进入聊天页。 */
  const openGroup = useCallback(async (group: WebIMJoinedGroup): Promise<void> => {
    if (!runtime || openingGroupID) return;
    setOpeningGroupID(group.groupID);
    setError(null);
    try {
      // conversations 先读取当前账号 SQLite，避免无意义网络请求。
      let conversations = await runtime.getSync().conversations.listCached({ limit: 500 });
      // conversationID 只接受真实 cache 命中的会话。
      let conversationID = findJoinedGroupConversationID(group, conversations);
      if (!conversationID) {
        // 远端同步仍复用 canonical conversation facade。
        conversations = await runtime.getSync().conversations.sync({ pageSize: 100 });
        conversationID = findJoinedGroupConversationID(group, conversations);
      }
      if (!conversationID) throw new Error('群会话尚未建立');
      navigate(`/conversations/${encodeURIComponent(conversationID)}`);
    } catch (cause) {
      setError(readJoinedGroupError(cause, '打开群聊失败'));
    } finally {
      setOpeningGroupID('');
    }
  }, [navigate, openingGroupID, runtime]);

  // visibleGroups 保持 SDK 服务端顺序并应用本地搜索。
  const visibleGroups = useMemo(
    () => filterJoinedGroups(groups, keyword),
    [groups, keyword],
  );

  if (restoring) return <JoinedGroupsPageState label="正在恢复我的群聊" />;
  if (!runtime) {
    return <JoinedGroupsPageState label="运行配置不可用" detail={startupError} />;
  }
  if (!snapshot.userID) return <Navigate to="/login" replace />;

  return (
    <main className="rn-joined-groups-page" aria-busy={loading}>
      <section className="rn-joined-groups-surface">
        <header className="rn-joined-groups-header">
          <Link to="/contacts" aria-label="返回通讯录">
            <RNAssetIcon assetURL={backIconURL} />
          </Link>
          <h1>我的群聊</h1>
          <span aria-hidden="true" />
        </header>
        <label className="rn-joined-groups-search">
          <span className="sr-only">搜索群聊或群ID</span>
          <RNAssetIcon assetURL={searchIconURL} />
          <input
            type="search"
            value={keyword}
            placeholder="搜索群聊/群ID"
            onChange={event => setKeyword(event.target.value)}
          />
          {keyword ? (
            <button type="button" aria-label="清除" onClick={() => setKeyword('')}>
              <RNAssetIcon assetURL={clearIconURL} />
            </button>
          ) : null}
        </label>
        {error ? (
          <div className="rn-joined-groups-error" role="status">
            <span>{error}</span>
            <button type="button" onClick={() => void loadGroups()}>重试</button>
          </div>
        ) : null}
        <section className="rn-joined-groups-list" aria-label="我的群聊列表">
          {visibleGroups.map(group => (
            <JoinedGroupRow
              key={group.groupID}
              group={group}
              opening={openingGroupID === group.groupID}
              onOpen={() => void openGroup(group)}
            />
          ))}
          {loading && groups.length === 0 ? (
            <div className="rn-joined-groups-loading" aria-label="正在加载群聊">
              <span />
            </div>
          ) : null}
          {!loading && !error && visibleGroups.length === 0 ? (
            <p className="rn-joined-groups-empty">
              {keyword.trim() ? '没有找到相关群聊' : '暂无群聊'}
            </p>
          ) : null}
        </section>
      </section>
    </main>
  );
}

/** 我的群聊启动状态参数。 */
interface JoinedGroupsPageStateProps {
  readonly label: string;
  readonly detail?: string | null;
}

/** 统一承载我的群聊启动和配置错误。 */
function JoinedGroupsPageState({
  label,
  detail,
}: JoinedGroupsPageStateProps) {
  return (
    <main className="rn-joined-groups-state">
      <strong>{label}</strong>
      {detail ? <span>{detail}</span> : null}
    </main>
  );
}

/** 将未知异常转换为不包含敏感数据的页面文案。 */
function readJoinedGroupError(
  cause: unknown,
  fallback = '群聊加载失败，请稍后重试',
): string {
  return cause instanceof Error && cause.message ? cause.message : fallback;
}
