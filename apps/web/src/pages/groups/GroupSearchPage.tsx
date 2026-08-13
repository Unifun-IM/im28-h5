import type { CSSProperties } from 'react';
import { useEffect, useMemo, useState } from 'react';
import type { WebIMGroupSearchItem } from '@im28/im-sdk/web';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';

import backIconURL from '../../assets/rn/assets/icons/imm28/nav-arrow-left.regular.svg';
import clearIconURL from '../../assets/rn/assets/icons/imm28/xmark-circle.solid.svg';
import searchIconURL from '../../assets/rn/assets/icons/imm28/search.regular.svg';
import { getRNAvatarGradient, getRNAvatarInitial } from '../../components/rn-avatar-view.js';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';
import { useWebIMRuntime } from '../../runtime/index.js';
import {
  readGroupSearchCreateState,
  readGroupSearchKeyword,
} from './group-search-route.js';
import './group-search-page.css';

/** RN 查找群聊页通过 shared groupApplications.search 消费真实 Gateway 结果。 */
export function GroupSearchPage() {
  /** runtime 提供账号隔离的唯一群搜索 facade。 */
  const { runtime, snapshot, restoring, startupError } = useWebIMRuntime();
  /** location 只承载建群选择和搜索输入。 */
  const location = useLocation();
  /** navigate 负责返回建群、进入已有会话或申请页。 */
  const navigate = useNavigate();
  /** createState 是已验证的建群选择上下文。 */
  const createState = useMemo(() => readGroupSearchCreateState(location.state), [location.state]);
  /** keyword 在返回申请页后恢复，避免重复输入。 */
  const [keyword, setKeyword] = useState(() => readGroupSearchKeyword(location.state));
  /** groups 只保存 shared DTO，不持有 Gateway 原始结构。 */
  const [groups, setGroups] = useState<readonly WebIMGroupSearchItem[]>([]);
  /** searching 覆盖 250ms 防抖后的真实请求。 */
  const [searching, setSearching] = useState(false);
  /** openingGroupID 阻止已加入群在规范会话解析期间重复打开。 */
  const [openingGroupID, setOpeningGroupID] = useState<string | null>(null);
  /** error 保留真实 SDK/Gateway 失败。 */
  const [error, setError] = useState<string | null>(null);
  /** normalizedKeyword 控制空态和搜索调用。 */
  const normalizedKeyword = keyword.trim();

  useEffect(() => {
    if (!runtime || !snapshot.userID || !normalizedKeyword) {
      setGroups([]);
      setSearching(false);
      setError(null);
      return;
    }
    /** active 防止过期搜索覆盖新关键词结果。 */
    let active = true;
    /** timer 对齐 RN 250ms 输入防抖。 */
    const timer = window.setTimeout(() => {
      setSearching(true);
      setError(null);
      void runtime.getSync().groupApplications.search(normalizedKeyword)
        .then(result => { if (active) setGroups(result); })
        .catch(cause => {
          if (!active) return;
          setGroups([]);
          setError(readGroupSearchError(cause));
        })
        .finally(() => { if (active) setSearching(false); });
    }, 250);
    return () => { active = false; window.clearTimeout(timer); };
  }, [normalizedKeyword, runtime, snapshot.userID]);

  /** returnToCreation 保留已选好友并回到 RN 建群主页面。 */
  function returnToCreation(): void {
    navigate('/groups/create', { state: createState });
  }

  /** openGroup 根据 shared 三态解析规范会话、进入申请页或保持不可操作。 */
  async function openGroup(group: WebIMGroupSearchItem): Promise<void> {
    if (group.status === 'pending') return;
    if (group.status === 'joined') {
      if (!runtime || openingGroupID) return;
      setOpeningGroupID(group.groupID);
      setError(null);
      try {
        /** conversation 由 SDK 校验 Gateway 群/会话身份并写入当前账号缓存。 */
        const conversation = await runtime.getSync().conversations.openGroup({
          groupID: group.groupID,
          conversationID: group.conversationID,
        });
        navigate(`/conversations/${encodeURIComponent(conversation.conversationID)}`);
      } catch (cause) {
        setError(readGroupSearchError(cause));
      } finally {
        setOpeningGroupID(null);
      }
      return;
    }
    navigate(`/groups/${encodeURIComponent(group.groupID)}/apply`, {
      state: {
        sourceType: 'search',
        searchKeyword: normalizedKeyword,
        createState,
      },
    });
  }

  if (restoring) return <GroupSearchState label="正在恢复会话" />;
  if (!runtime) return <GroupSearchState label="运行配置不可用" detail={startupError} />;
  if (!snapshot.userID) return <Navigate to="/login" replace />;

  return (
    <main className="rn-group-search-page" aria-busy={searching}>
      <section className="rn-group-search-surface">
        <header className="rn-group-search-header">
          <button type="button" aria-label="返回发起群聊" onClick={returnToCreation}><RNAssetIcon assetURL={backIconURL} /></button>
          <h1>查找群聊</h1><span aria-hidden="true" />
        </header>
        <label className="rn-group-search-box">
          <RNAssetIcon assetURL={searchIconURL} />
          <input autoFocus type="search" value={keyword} placeholder="输入群 ID 或群名称" autoCapitalize="none" autoComplete="off" onChange={event => setKeyword(event.target.value)} />
          {keyword ? <button type="button" aria-label="清除搜索" onClick={() => setKeyword('')}><RNAssetIcon assetURL={clearIconURL} /></button> : null}
        </label>
        {error ? <p className="rn-group-search-error" role="alert">{error}</p> : null}
        {searching ? <GroupSearchLoading /> : normalizedKeyword && !groups.length && !error ? <p className="rn-group-search-empty">未找到该群聊</p> : null}
        {!searching ? <section className="rn-group-search-results" aria-label="群聊搜索结果">
          {groups.map(group => <GroupSearchRow key={group.groupID} group={group} keyword={normalizedKeyword} opening={openingGroupID === group.groupID} onOpen={() => { void openGroup(group); }} />)}
        </section> : null}
      </section>
    </main>
  );
}

/** 群搜索行只渲染 shared DTO 和关系状态。 */
function GroupSearchRow({ group, keyword, opening, onOpen }: { readonly group: WebIMGroupSearchItem; readonly keyword: string; readonly opening: boolean; readonly onOpen: () => void }) {
  /** avatarStyle 复用 RN 稳定头像色。 */
  const avatarStyle = { '--rn-group-search-gradient': getRNAvatarGradient(group.groupID) } as CSSProperties;
  /** description 对齐 RN 群 ID、成员数和简介投影。 */
  const description = `${group.memberCount ? `${group.memberCount}人 · ` : ''}群ID：${group.groupID}`;
  return <button className="rn-group-search-row" type="button" disabled={group.status === 'pending' || opening} aria-busy={opening} onClick={onOpen}>
    <span className="rn-group-search-avatar" style={avatarStyle}><span>{getRNAvatarInitial(group.title, '群')}</span>{group.avatarURL ? <img src={group.avatarURL} alt="" onError={event => { event.currentTarget.hidden = true; }} /> : null}</span>
    <span className="rn-group-search-body"><strong>{highlightGroupSearchText(group.title, keyword)}</strong><small>{description}</small>{group.description ? <small>{group.description}</small> : null}</span>
    {group.status === 'available' ? <em>申请加入</em> : group.status === 'pending' ? <i>待通过</i> : opening ? <i>正在进入</i> : null}
  </button>;
}

/** 用安全 React 文本节点标记群名中的搜索词。 */
function highlightGroupSearchText(text: string, keyword: string) {
  /** index 使用不区分大小写的同长度输入定位。 */
  const index = text.toLocaleLowerCase().indexOf(keyword.toLocaleLowerCase());
  if (index < 0 || !keyword) return text;
  return <>{text.slice(0, index)}<mark>{text.slice(index, index + keyword.length)}</mark>{text.slice(index + keyword.length)}</>;
}

/** 群搜索加载态不伪造结果。 */
function GroupSearchLoading() { return <div className="rn-group-search-loading"><span /><p>正在搜索</p></div>; }

/** 群搜索启动状态参数。 */
interface GroupSearchStateProps { readonly label: string; readonly detail?: string | null; }

/** 群搜索启动态复用独立全屏容器。 */
function GroupSearchState({ label, detail }: GroupSearchStateProps) { return <main className="rn-group-search-state"><strong>{label}</strong>{detail ? <span>{detail}</span> : null}</main>; }

/** 将未知搜索失败转为无凭据页面提示。 */
function readGroupSearchError(cause: unknown): string { return cause instanceof Error && cause.message ? cause.message : '搜索失败，请重试'; }

export default GroupSearchPage;
