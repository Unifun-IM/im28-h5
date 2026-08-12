import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react';
import type { WebIMContact } from '@im28/im-sdk/web';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';

import closeIconURL from '../../assets/rn/assets/icons/imm28/xmark.regular.svg';
import clearIconURL from '../../assets/rn/assets/icons/imm28/xmark-circle.solid.svg';
import searchIconURL from '../../assets/rn/assets/icons/imm28/search.regular.svg';
import checkIconURL from '../../assets/rn/assets/icons/imm28/check-circle.solid.svg';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';
import { getRNAvatarGradient, getRNAvatarInitial } from '../../components/rn-avatar-view.js';
import { useWebIMRuntime } from '../../runtime/index.js';
import { filterChatForwardTargets, contactToChatForwardTarget } from '../chat/forward-target-view.js';
import { readContactCardShareLocationState } from './contact-action-view.js';
import './contact-card-share.css';

/** RN 名片分享页只选择好友目标，不开放群聊或最近会话。 */
export function ContactCardSharePage() {
  /** routeUserID 标识正在分享的名片用户。 */
  const { userID: routeUserID = '' } = useParams();
  /** location 提供不可刷新恢复的公开名片展示状态。 */
  const location = useLocation();
  /** navigate 管理关闭、分享成功和认证跳转。 */
  const navigate = useNavigate();
  /** runtime 提供联系人读取、名片分享和单聊解析 facade。 */
  const { runtime, snapshot, restoring, startupError } = useWebIMRuntime();
  /** shareState 严格校验 URL 与 history state 属于同一用户。 */
  const shareState = useMemo(
    () => readContactCardShareLocationState(location.state, routeUserID),
    [location.state, routeUserID],
  );
  /** contacts 保存 cache-first 后的真实好友列表。 */
  const [contacts, setContacts] = useState<readonly WebIMContact[]>([]);
  /** keyword 只执行本地好友筛选。 */
  const [keyword, setKeyword] = useState('');
  /** selectedUserID 对齐 RN 当前单选集合行为。 */
  const [selectedUserID, setSelectedUserID] = useState('');
  /** loading 标识联系人 facade 的刷新轮次。 */
  const [loading, setLoading] = useState(false);
  /** sharing 阻止名片分享重复提交。 */
  const [sharing, setSharing] = useState(false);
  /** error 呈现真实读取或写入失败。 */
  const [error, setError] = useState<string | null>(null);

  /** 先读 SQLite 联系人缓存，再刷新 Gateway 完整好友列表。 */
  const loadContacts = useCallback(async (): Promise<void> => {
    if (!runtime || !snapshot.userID || !shareState) return;
    /** contactsFacade 是本页唯一联系人 owner。 */
    const contactsFacade = runtime.getSync().contacts;
    setLoading(true);
    setError(null);
    try {
      try {
        setContacts(await contactsFacade.listCached());
      } catch {
        // 缓存不可用时继续执行 canonical 远端读取。
      }
      setContacts(await contactsFacade.list({ pageSize: 100 }));
    } catch (cause) {
      setError(readCardShareError(cause, '好友列表加载失败'));
    } finally {
      setLoading(false);
    }
  }, [runtime, shareState, snapshot.userID]);

  useEffect(() => { void loadContacts(); }, [loadContacts]);

  /** targets 排除本人和名片主人，保持 RN 名片分享约束。 */
  const targets = useMemo(() => contacts
    .filter(contact => contact.userID !== snapshot.userID && contact.userID !== routeUserID)
    .map(contactToChatForwardTarget), [contacts, routeUserID, snapshot.userID]);
  /** visibleTargets 复用聊天转发页的稳定本地筛选。 */
  const visibleTargets = useMemo(
    () => filterChatForwardTargets(targets, keyword),
    [keyword, targets],
  );

  /** shareCard 仅在用户选择目标并点击分享后执行真实 Gateway 写入。 */
  async function shareCard(): Promise<void> {
    if (!runtime || !shareState || !selectedUserID || sharing) return;
    setSharing(true);
    setError(null);
    try {
      await runtime.getSync().contacts.shareUserCard({
        cardUserID: shareState.card.userID,
        targetUserIDs: [selectedUserID],
      });
      /** conversation 由 shared facade 创建或复用，页面不拼接 ID。 */
      const conversation = await runtime.getSync().peerProfile.openConversation(selectedUserID);
      navigate(`/conversations/${encodeURIComponent(conversation.conversationID)}`, { replace: true });
    } catch (cause) {
      setError(readCardShareError(cause, '分享好友名片失败'));
    } finally {
      setSharing(false);
    }
  }

  if (restoring) return <CardShareState label="正在恢复会话" />;
  if (!runtime) return <CardShareState label="运行配置不可用" detail={startupError} />;
  if (!snapshot.userID) return <Navigate to="/login" replace />;
  if (!shareState) {
    return <Navigate to={`/contacts/users/${encodeURIComponent(routeUserID)}`} replace />;
  }

  return (
    <main className="rn-contact-card-share-page" aria-busy={loading || sharing}>
      <section className="rn-contact-card-share-sheet">
        <header className="rn-contact-card-share-header">
          <button type="button" aria-label="关闭选择聊天" onClick={() => navigate(-1)}>
            <RNAssetIcon assetURL={closeIconURL} />
          </button>
          <h1>{`已选中(${selectedUserID ? 1 : 0})`}</h1>
          <span aria-hidden="true" />
        </header>
        <label className="rn-contact-card-share-search">
          <RNAssetIcon assetURL={searchIconURL} />
          <span className="sr-only">搜索好友</span>
          <input type="search" value={keyword} placeholder="搜索" onChange={event => setKeyword(event.target.value)} />
          {keyword ? (
            <button type="button" aria-label="清除搜索" onClick={() => setKeyword('')}>
              <RNAssetIcon assetURL={clearIconURL} />
            </button>
          ) : null}
        </label>
        {error ? <p className="rn-contact-card-share-error" role="alert">{error}</p> : null}
        <section className="rn-contact-card-share-grid" aria-label="选择分享好友">
          {visibleTargets.map(target => {
            /** selected 只投影当前单选目标。 */
            const selected = selectedUserID === target.id;
            /** avatarStyle 使用好友 ID 生成稳定 RN fallback 渐变。 */
            const avatarStyle = {
              '--contact-card-target-gradient': getRNAvatarGradient(target.id),
            } as CSSProperties;
            return (
              <button
                type="button"
                key={target.key}
                className={selected ? 'is-selected' : undefined}
                aria-pressed={selected}
                disabled={sharing}
                onClick={() => setSelectedUserID(selected ? '' : target.id)}
              >
                <span className="rn-contact-card-share-avatar" style={avatarStyle}>
                  <span>{getRNAvatarInitial(target.title)}</span>
                  {target.avatarURL ? <img src={target.avatarURL} alt="" onError={event => { event.currentTarget.hidden = true; }} /> : null}
                  {selected ? <span className="rn-contact-card-share-check"><RNAssetIcon assetURL={checkIconURL} /></span> : null}
                </span>
                <strong>{target.title}</strong>
              </button>
            );
          })}
          {loading && targets.length === 0 ? <p>正在加载好友</p> : null}
          {!loading && visibleTargets.length === 0 ? <p>{keyword.trim() ? '未找到相关好友' : '暂无可分享好友'}</p> : null}
        </section>
        <footer className="rn-contact-card-share-footer">
          <button type="button" disabled={!selectedUserID || sharing} onClick={() => void shareCard()}>
            {sharing ? '正在分享' : '分享'}
          </button>
        </footer>
      </section>
    </main>
  );
}

/** 统一呈现名片分享页的认证恢复和运行配置错误。 */
function CardShareState({ label, detail }: { readonly label: string; readonly detail?: string | null }) {
  return <main className="rn-contact-card-share-state"><strong>{label}</strong>{detail ? <span>{detail}</span> : null}</main>;
}

/** 将未知名片分享异常转换为可见文案。 */
function readCardShareError(cause: unknown, fallback: string): string {
  return cause instanceof Error && cause.message ? cause.message : fallback;
}

export default ContactCardSharePage;
