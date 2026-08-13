import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react';
import {
  IM_BROADCAST_MAX_TARGETS,
  type IMBroadcastTarget,
  type WebIMContact,
  type WebIMJoinedGroup,
} from '@im28/im-sdk/web';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';

import backIconURL from '../../assets/rn/assets/icons/imm28/nav-arrow-left.regular.svg';
import clearIconURL from '../../assets/rn/assets/icons/imm28/xmark-circle.solid.svg';
import searchIconURL from '../../assets/rn/assets/icons/imm28/search.regular.svg';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';
import { getRNAvatarGradient, getRNAvatarInitial } from '../../components/rn-avatar-view.js';
import { useWebIMRuntime } from '../../runtime/index.js';
import { readBroadcastBackHref, readBroadcastRouteState } from './broadcast-route.js';
import {
  contactToBroadcastTarget,
  filterBroadcastTargets,
  groupToBroadcastTarget,
  type BroadcastDisplayTarget,
} from './broadcast-target-view.js';
import './broadcast-page.css';

/** 群发选择页支持好友和已加入群两个 RN tab。 */
type BroadcastTargetTab = 'friend' | 'group';

/** 群发选择页只编排 facade 数据和稳定身份选择。 */
export function BroadcastTargetSelectPage() {
  /** navigate 只进入 compose SPA 或返回首页。 */
  const navigate = useNavigate();
  /** location 提供受控返回页和从 compose 返回的初始选择。 */
  const location = useLocation();
  /** runtime 是页面唯一 SDK 入口。 */
  const { runtime, snapshot, restoring, startupError } = useWebIMRuntime();
  /** sync 只在 runtime 可用时解析目标 facade。 */
  const sync = useMemo(() => runtime?.getSync() ?? null, [runtime]);
  /** routeState 只可能包含稳定目标身份。 */
  const routeState = useMemo(() => readBroadcastRouteState(location.state), [location.state]);
  /** backHref 从入口或 compose 返回状态中读取。 */
  const backHref = routeState?.backHref ?? readBroadcastBackHref(location.state);
  /** activeTab 决定当前目标网格数据源。 */
  const [activeTab, setActiveTab] = useState<BroadcastTargetTab>('friend');
  /** keyword 只做本地当前 tab 搜索。 */
  const [keyword, setKeyword] = useState('');
  /** contacts 保存 cache-first 好友结果。 */
  const [contacts, setContacts] = useState<readonly WebIMContact[]>([]);
  /** groups 保存 cache-first 已加入群结果。 */
  const [groups, setGroups] = useState<readonly WebIMJoinedGroup[]>([]);
  /** selected 只保存 stable kind + targetID。 */
  const [selected, setSelected] = useState<ReadonlyMap<string, IMBroadcastTarget>>(
    () => new Map((routeState?.targets ?? []).map(target => [`${target.kind}:${target.targetID}`, target])),
  );
  /** loading 表示首次 cache-first 和远端刷新。 */
  const [loading, setLoading] = useState(true);
  /** error 显示真实 facade 或上限失败。 */
  const [error, setError] = useState<string | null>(null);

  /** 先读好友和群缓存，再并行刷新真实 Gateway 数据。 */
  const loadTargets = useCallback(async (): Promise<void> => {
    if (!sync || !snapshot.userID) return;
    setLoading(true);
    setError(null);
    try {
      /** cachedResults 支持慢网首屏。 */
      const cachedResults = await Promise.allSettled([
        sync.contacts.listCached(),
        sync.groups.listCached(),
      ]);
      if (cachedResults[0].status === 'fulfilled') setContacts(cachedResults[0].value);
      if (cachedResults[1].status === 'fulfilled') setGroups(cachedResults[1].value);
      /** refreshedResults 由两个 canonical facade 完成分页和落库。 */
      const [refreshedContacts, refreshedGroups] = await Promise.all([
        sync.contacts.list({ pageSize: 100 }),
        sync.groups.sync({ pageSize: 50 }),
      ]);
      setContacts(refreshedContacts);
      setGroups(refreshedGroups);
    } catch (cause) {
      setError(readBroadcastPageError(cause, '加载群发目标失败，请稍后重试'));
    } finally {
      setLoading(false);
    }
  }, [snapshot.userID, sync]);

  useEffect(() => { void loadTargets(); }, [loadTargets]);

  /** tabTargets 保持 facade 原始顺序。 */
  const tabTargets = useMemo(
    () => activeTab === 'friend'
      ? contacts.map(contactToBroadcastTarget)
      : groups.map(groupToBroadcastTarget),
    [activeTab, contacts, groups],
  );
  /** visibleTargets 仅应用页面关键词。 */
  const visibleTargets = useMemo(
    () => filterBroadcastTargets(tabTargets, keyword),
    [keyword, tabTargets],
  );
  /** selectedTargets 保留跨 tab 首次选择顺序。 */
  const selectedTargets = useMemo(() => [...selected.values()], [selected]);
  /** allTabSelected 只判断当前 tab 的完整选择。 */
  const allTabSelected = tabTargets.length > 0 && tabTargets.every(target => selected.has(target.key));

  /** toggleTarget 切换目标并执行 shared 50 人上限。 */
  function toggleTarget(target: BroadcastDisplayTarget): void {
    setError(null);
    setSelected(current => {
      /** next 不变更新保证 React 可观察。 */
      const next = new Map(current);
      if (next.has(target.key)) next.delete(target.key);
      else if (next.size >= IM_BROADCAST_MAX_TARGETS) {
        setError(`最多选择 ${IM_BROADCAST_MAX_TARGETS} 个目标`);
      } else next.set(target.key, { kind: target.kind, targetID: target.targetID });
      return next;
    });
  }

  /** toggleAll 选择或取消当前 tab，跨 tab 合计仍不超过上限。 */
  function toggleAll(): void {
    setError(null);
    setSelected(current => {
      /** next 保存另一 tab 已选结果。 */
      const next = new Map(current);
      if (allTabSelected) {
        for (const target of tabTargets) next.delete(target.key);
        return next;
      }
      for (const target of tabTargets) {
        if (next.has(target.key)) continue;
        if (next.size >= IM_BROADCAST_MAX_TARGETS) {
          setError(`最多选择 ${IM_BROADCAST_MAX_TARGETS} 个目标`);
          break;
        }
        next.set(target.key, { kind: target.kind, targetID: target.targetID });
      }
      return next;
    });
  }

  /** startBroadcast 只把稳定身份交给 compose route。 */
  function startBroadcast(): void {
    if (!selectedTargets.length) return;
    navigate('/broadcast/compose', { state: { targets: selectedTargets, backHref } });
  }

  if (restoring) return <BroadcastPageState label="正在恢复会话" />;
  if (!runtime) return <BroadcastPageState label="运行配置不可用" detail={startupError} />;
  if (!snapshot.userID) return <Navigate to="/login" replace />;

  return (
    <main className="rn-broadcast-page" aria-busy={loading}>
      <section className="rn-broadcast-surface">
        <header className="rn-broadcast-header">
          <Link to={backHref} aria-label="返回"><RNAssetIcon assetURL={backIconURL} /></Link>
          <h1>选择消息目标</h1><span aria-hidden="true" />
        </header>
        <label className="rn-broadcast-search">
          <RNAssetIcon assetURL={searchIconURL} />
          <input type="search" value={keyword} placeholder="找朋友或群聊" aria-label="查找群发目标" onChange={event => setKeyword(event.target.value)} />
          {keyword ? <button type="button" aria-label="清除搜索" onClick={() => setKeyword('')}><RNAssetIcon assetURL={clearIconURL} /></button> : null}
        </label>
        {selected.size ? (
          <div className="rn-broadcast-selected-summary">
            <span>已选择 {selected.size} 个目标</span>
            <button type="button" onClick={() => setSelected(new Map())}>清空</button>
          </div>
        ) : null}
        <nav className="rn-broadcast-tabs" aria-label="群发目标类型">
          <button type="button" className={activeTab === 'friend' ? 'is-active' : ''} onClick={() => setActiveTab('friend')}>用户</button>
          <button type="button" className={activeTab === 'group' ? 'is-active' : ''} onClick={() => setActiveTab('group')}>群聊</button>
        </nav>
        {error ? <p className="rn-broadcast-error" role="alert">{error}</p> : null}
        <section className="rn-broadcast-grid" aria-label="可选择群发目标">
          {!keyword.trim() ? <BroadcastTargetTile key="all" target={null} title={activeTab === 'friend' ? '全选好友' : '全选群聊'} selected={allTabSelected} onToggle={toggleAll} /> : null}
          {visibleTargets.map(target => <BroadcastTargetTile key={target.key} target={target} title={target.title} selected={selected.has(target.key)} onToggle={() => toggleTarget(target)} />)}
        </section>
        {!loading && !visibleTargets.length ? <p className="rn-broadcast-empty">{keyword.trim() ? '未找到相关目标' : activeTab === 'friend' ? '暂无好友' : '暂无群聊'}</p> : null}
        <footer className="rn-broadcast-footer">
          <button type="button" disabled={!selected.size} onClick={startBroadcast}>开始群发消息{selected.size ? `（${selected.size}）` : ''}</button>
        </footer>
      </section>
    </main>
  );
}

/** 群发目标网格项对齐 RN 五列头像选择。 */
function BroadcastTargetTile({ target, title, selected, onToggle }: {
  readonly target: BroadcastDisplayTarget | null;
  readonly title: string;
  readonly selected: boolean;
  readonly onToggle: () => void;
}) {
  /** identity 为全选 tile 或真实目标提供稳定渐变。 */
  const identity = target?.targetID ?? 'broadcast-all';
  /** avatarStyle 注入 RN fallback 渐变。 */
  const avatarStyle = { '--broadcast-avatar-gradient': getRNAvatarGradient(identity) } as CSSProperties;
  return (
    <button type="button" className="rn-broadcast-tile" aria-pressed={selected} onClick={onToggle}>
      <span className="rn-broadcast-avatar" style={avatarStyle}>
        <span>{target ? getRNAvatarInitial(title) : 'ALL'}</span>
        {target?.avatarURL ? <img src={target.avatarURL} alt="" onError={event => { event.currentTarget.hidden = true; }} /> : null}
        {selected ? <em>✓</em> : null}
      </span>
      <span>{title}</span>
    </button>
  );
}

/** 群发启动状态参数。 */
interface BroadcastPageStateProps {
  readonly label: string;
  readonly detail?: string | null;
}

/** 统一承载 runtime 恢复和配置错误。 */
function BroadcastPageState({ label, detail }: BroadcastPageStateProps) {
  return <main className="rn-broadcast-state"><strong>{label}</strong>{detail ? <span>{detail}</span> : null}</main>;
}

/** 将未知异常转换为不含凭据的页面文案。 */
function readBroadcastPageError(cause: unknown, fallback: string): string {
  return cause instanceof Error && cause.message ? cause.message : fallback;
}

export default BroadcastTargetSelectPage;
