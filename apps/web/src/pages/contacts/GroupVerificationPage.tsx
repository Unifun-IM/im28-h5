import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react';
import type { WebIMGroupApplication } from '@im28/im-sdk/web';
import { Link, Navigate } from 'react-router-dom';

import clearIconURL from '../../assets/rn/assets/icons/imm28/xmark-circle.solid.svg';
import nextIconURL from '../../assets/rn/assets/icons/imm28/nav-arrow-right.regular.svg';
import searchIconURL from '../../assets/rn/assets/icons/imm28/search.regular.svg';
import { getRNAvatarGradient, getRNAvatarInitial } from '../../components/rn-avatar-view.js';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';
import { useWebIMRuntime } from '../../runtime/index.js';
import { GroupApplicationsError, GroupApplicationsHeader, GroupApplicationsPageState } from './GroupApplicationsShared.js';
import { buildGroupVerificationEntries, readGroupApplicationError } from './group-application-view.js';
import './group-applications-page.css';

/** RN 群聊验证索引页通过一个 audit facade 聚合可审核群。 */
export function GroupVerificationPage() {
  // runtime context 是页面唯一 SDK 入口。
  const { runtime, snapshot, restoring, startupError } = useWebIMRuntime();
  // applications 保存完整审核列表供群聚合。
  const [applications, setApplications] = useState<readonly WebIMGroupApplication[]>([]);
  // keyword 驱动群名称/ID 搜索。
  const [keyword, setKeyword] = useState('');
  // loading 覆盖首次读取和刷新。
  const [loading, setLoading] = useState(false);
  // error 显示真实 Gateway 失败。
  const [error, setError] = useState<string | null>(null);

  /** 从唯一 groupApplications facade 拉取审核列表。 */
  const loadApplications = useCallback(async (): Promise<void> => {
    if (!runtime || !snapshot.userID) return;
    setLoading(true);
    setError(null);
    try {
      setApplications(await runtime.getSync().groupApplications.list({ pageSize: 100 }));
    } catch (cause) {
      setError(readGroupApplicationError(cause, '群聊验证加载失败'));
    } finally {
      setLoading(false);
    }
  }, [runtime, snapshot.userID]);

  useEffect(() => { void loadApplications(); }, [loadApplications]);

  // groups 只聚合待处理记录并按 RN 数量排序。
  const groups = useMemo(
    () => buildGroupVerificationEntries(applications, snapshot.userID ?? '', keyword),
    [applications, keyword, snapshot.userID],
  );

  if (restoring) return <GroupApplicationsPageState label="正在恢复群聊验证" />;
  if (!runtime) return <GroupApplicationsPageState label="运行配置不可用" detail={startupError} />;
  if (!snapshot.userID) return <Navigate to="/login" replace />;

  return <main className="rn-group-applications-page" aria-busy={loading}>
    <section className="rn-group-applications-surface">
      <GroupApplicationsHeader title="群聊验证" backTo="/contacts" />
      <label className="rn-group-applications-search">
        <RNAssetIcon assetURL={searchIconURL} />
        <input type="search" value={keyword} placeholder="搜索群聊/群ID" aria-label="搜索群聊验证" onChange={event => setKeyword(event.target.value)} />
        {keyword ? <button type="button" aria-label="清除" onClick={() => setKeyword('')}><RNAssetIcon assetURL={clearIconURL} /></button> : null}
      </label>
      {error ? <GroupApplicationsError message={error} onRetry={() => void loadApplications()} /> : null}
      <div className="rn-group-verification-list">
        {groups.map(group => {
          // avatarStyle 复用 RN 稳定头像色。
          const avatarStyle = { '--group-application-avatar-gradient': getRNAvatarGradient(group.groupID) } as CSSProperties;
          return <Link key={group.groupID} to={`/contacts/group-applications/${encodeURIComponent(group.groupID)}`}>
            <span className="rn-group-application-avatar is-group" style={avatarStyle}>
              <span>{getRNAvatarInitial(group.groupName, '群')}</span>
              {group.groupAvatarURL ? <img src={group.groupAvatarURL} alt="" onError={event => { event.currentTarget.hidden = true; }} /> : null}
            </span>
            <span className="rn-group-verification-body"><span><strong>{group.groupName}</strong><small>ID: {group.groupID}</small></span><span className="rn-group-verification-trailing"><em className={group.isOwner ? 'is-owner' : ''}>{group.isOwner ? '群主' : '管理员'}</em><b>{group.count > 99 ? '99+' : group.count}</b><RNAssetIcon assetURL={nextIconURL} /></span></span>
          </Link>;
        })}
        {!loading && !error && groups.length === 0 ? <p className="rn-group-applications-empty">{keyword ? '没有找到相关群聊' : '暂无群聊验证'}</p> : null}
      </div>
    </section>
  </main>;
}
