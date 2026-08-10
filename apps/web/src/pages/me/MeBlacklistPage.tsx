import type { CSSProperties } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { WebIMBlacklistUser } from '@im28/im-sdk/web';
import { Navigate } from 'react-router-dom';

import searchIconURL from '../../assets/rn/assets/icons/imm28/search.regular.svg';
import { getRNAvatarGradient, getRNAvatarInitial } from '../../components/rn-avatar-view.js';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';
import { useWebIMRuntime } from '../../runtime/index.js';
import { filterBlacklistUsers } from './blacklist-view.js';
import { MeProfileHeader } from './MeProfileHeader.js';
import './me-page.css';
import './me-profile-page.css';
import './me-blacklist-page.css';

/** RN 黑名单页通过认证 sync facade 读取和解除真实用户。 */
export function MeBlacklistPage() {
  // runtime context 是页面唯一 SDK 入口。
  const { runtime, snapshot, restoring, startupError } = useWebIMRuntime();
  // users 保留服务端顺序的完整黑名单。
  const [users, setUsers] = useState<readonly WebIMBlacklistUser[]>([]);
  // keyword 驱动无请求的 RN 本地搜索。
  const [keyword, setKeyword] = useState('');
  // loading 覆盖首次读取和手动重试。
  const [loading, setLoading] = useState(false);
  // error 透传真实 Gateway 失败。
  const [error, setError] = useState<string | null>(null);
  // pendingUser 控制 RN 同源底部确认层。
  const [pendingUser, setPendingUser] = useState<WebIMBlacklistUser | null>(null);
  // removingUserID 阻止同一时刻重复删除。
  const [removingUserID, setRemovingUserID] = useState<string | null>(null);

  /** 从聚合 sync facade 拉取完整黑名单。 */
  const loadUsers = useCallback(async (): Promise<void> => {
    if (!runtime || !snapshot.userID) return;
    setLoading(true);
    setError(null);
    try {
      setUsers(await runtime.getSync().blacklist.list({ pageSize: 100 }));
    } catch (cause) {
      setError(readBlacklistError(cause, '黑名单加载失败'));
    } finally {
      setLoading(false);
    }
  }, [runtime, snapshot.userID]);

  useEffect(() => { void loadUsers(); }, [loadUsers]);

  /** 仅在 Gateway 解除成功后从当前列表移除用户。 */
  const confirmRemove = useCallback(async (): Promise<void> => {
    if (!runtime || !pendingUser || removingUserID) return;
    // target 固定本次确认对象，避免异步期间状态漂移。
    const target = pendingUser;
    setPendingUser(null);
    setRemovingUserID(target.userID);
    setError(null);
    try {
      await runtime.getSync().blacklist.remove(target.userID);
      setUsers(current => current.filter(user => user.userID !== target.userID));
    } catch (cause) {
      setError(readBlacklistError(cause, '解除黑名单失败'));
    } finally {
      setRemovingUserID(null);
    }
  }, [pendingUser, removingUserID, runtime]);

  // visibleUsers 是当前关键字的纯本地筛选结果。
  const visibleUsers = useMemo(() => filterBlacklistUsers(users, keyword), [keyword, users]);

  if (restoring) return <BlacklistPageState label="正在恢复黑名单" />;
  if (!runtime) return <BlacklistPageState label="运行配置不可用" detail={startupError} />;
  if (!snapshot.userID) return <Navigate to="/login" replace />;

  return (
    <main className="rn-me-blacklist-page" aria-busy={loading}>
      <section className="rn-me-blacklist-surface">
        <MeProfileHeader title="黑名单" backHref="/me/settings/permissions" />
        <label className="rn-me-blacklist-search">
          <RNAssetIcon assetURL={searchIconURL} />
          <input type="search" value={keyword} placeholder="搜索" aria-label="搜索黑名单" onChange={event => setKeyword(event.target.value)} />
        </label>
        {error ? <div className="rn-me-blacklist-error" role="status"><span>{error}</span><button type="button" onClick={() => void loadUsers()}>重试</button></div> : null}
        <div className="rn-me-blacklist-list" role="list">
          {visibleUsers.map(user => <BlacklistRow key={user.userID} user={user} removing={removingUserID === user.userID} onRemove={() => setPendingUser(user)} />)}
          {!loading && visibleUsers.length === 0 ? <p className="rn-me-blacklist-empty">{keyword.trim() ? '未找到相关用户' : '暂无黑名单用户'}</p> : null}
        </div>
      </section>
      {pendingUser ? <UnblockConfirmSheet onCancel={() => setPendingUser(null)} onConfirm={() => void confirmRemove()} /> : null}
    </main>
  );
}

/** 黑名单列表行参数。 */
interface BlacklistRowProps {
  readonly user: WebIMBlacklistUser;
  readonly removing: boolean;
  readonly onRemove: () => void;
}

/** 复刻 RN 40px 头像、关系标签和解除操作。 */
function BlacklistRow({ user, removing, onRemove }: BlacklistRowProps) {
  // avatarStyle 复用 RN FNV-1a 渐变规则。
  const avatarStyle = { '--blacklist-avatar-gradient': getRNAvatarGradient(user.userID) } as CSSProperties;
  return <article className="rn-me-blacklist-row" role="listitem">
    <span className="rn-me-blacklist-avatar" style={avatarStyle}>
      <span>{getRNAvatarInitial(user.displayName)}</span>
      {user.avatarURL ? <img src={user.avatarURL} alt="" loading="lazy" onError={event => { event.currentTarget.hidden = true; }} /> : null}
    </span>
    <div className="rn-me-blacklist-row-main">
      <strong>{user.displayName}</strong>
      <span>{user.isFriend ? '通讯录好友' : '陌生人'}</span>
      <button type="button" disabled={removing} aria-label={`解除 ${user.displayName}`} onClick={onRemove}>{removing ? '解除中' : '解除'}</button>
    </div>
  </article>;
}

/** RN 黑名单解除确认底部层参数。 */
interface UnblockConfirmSheetProps {
  readonly onCancel: () => void;
  readonly onConfirm: () => void;
}

/** 复刻 RN 解除确认操作层，并支持点击遮罩取消。 */
function UnblockConfirmSheet({ onCancel, onConfirm }: UnblockConfirmSheetProps) {
  return <div className="rn-me-blacklist-sheet-backdrop" role="presentation" onClick={onCancel}>
    <section className="rn-me-blacklist-sheet" role="alertdialog" aria-modal="true" aria-labelledby="unblock-title" onClick={event => event.stopPropagation()}>
      <p id="unblock-title">确定解除用户黑名单?</p>
      <button className="is-danger" type="button" onClick={onConfirm}>确定解除</button>
      <button type="button" onClick={onCancel}>取消</button>
    </section>
  </div>;
}

/** 收敛黑名单 API 异常且不泄漏凭据。 */
function readBlacklistError(cause: unknown, fallback: string): string {
  return cause instanceof Error && cause.message ? cause.message : fallback;
}

/** 统一承载黑名单页启动状态。 */
function BlacklistPageState({ label, detail }: { readonly label: string; readonly detail?: string | null }) {
  return <main className="rn-me-page-state"><strong>{label}</strong>{detail ? <span>{detail}</span> : null}</main>;
}
