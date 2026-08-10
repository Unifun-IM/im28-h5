import type {
  WebIMContact,
  WebIMContactSearchUser,
} from '@im28/im-sdk/web';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';

import rightIconURL from '../../assets/rn/assets/icons/imm28/nav-arrow-right.regular.svg';
import searchIconURL from '../../assets/rn/assets/icons/imm28/search.regular.svg';
import clearIconURL from '../../assets/rn/assets/icons/imm28/xmark-circle.solid.svg';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';
import { useWebIMRuntime } from '../../runtime/index.js';
import { ContactProfileAvatar } from './ContactProfileShared.js';
import { buildContactProfileRoute } from './contact-profile-view.js';
import { filterWebIMContacts } from './contact-list-view.js';
import {
  getContactSearchDescription,
  splitContactSearchText,
  toContactSearchDescriptionSource,
} from './contact-search-view.js';
import './contact-search-page.css';

/** 联系人搜索页面在本地与远端结果间的显式模式。 */
type ContactSearchMode = 'local' | 'server';

/** RN 联系人搜索页只通过 contacts facade 读取本地好友和远端用户。 */
export function ContactSearchPage() {
  // runtime context 是页面唯一允许消费的 SDK owner。
  const { runtime, snapshot, restoring, startupError } = useWebIMRuntime();
  // contactsFacade 统一好友列表与远端用户搜索 operation。
  const contactsFacade = useMemo(() => runtime?.getSync().contacts ?? null, [runtime]);
  // keyword 保存当前输入，不写入 URL 或持久化存储。
  const [keyword, setKeyword] = useState('');
  // mode 对齐 RN 显式进入服务器搜索的交互。
  const [mode, setMode] = useState<ContactSearchMode>('local');
  // contacts 保存唯一 facade 返回的好友列表。
  const [contacts, setContacts] = useState<readonly WebIMContact[]>([]);
  // serverUsers 保存当前一次成功远端搜索结果。
  const [serverUsers, setServerUsers] = useState<readonly WebIMContactSearchUser[]>([]);
  // loadingLocal 标记好友列表读取状态。
  const [loadingLocal, setLoadingLocal] = useState(false);
  // loadingServer 标记真实 Gateway 用户搜索状态。
  const [loadingServer, setLoadingServer] = useState(false);
  // localError 保留好友读取失败，仍允许用户进入服务器搜索。
  const [localError, setLocalError] = useState<string | null>(null);
  // serverError 保留远端失败且不清空上次成功结果。
  const [serverError, setServerError] = useState<string | null>(null);

  /** 通过 contacts facade 加载可本地匹配的真实好友。 */
  const loadContacts = useCallback(async () => {
    if (!contactsFacade || !snapshot.userID) return;
    setLoadingLocal(true);
    setLocalError(null);
    try {
      setContacts(await contactsFacade.list());
    } catch {
      setLocalError('加载联系人失败，请稍后重试');
    } finally {
      setLoadingLocal(false);
    }
  }, [contactsFacade, snapshot.userID]);

  useEffect(() => {
    void loadContacts();
  }, [loadContacts]);

  // normalizedKeyword 控制空态和 SDK 调用参数。
  const normalizedKeyword = keyword.trim();
  // localResults 复用通讯录唯一纯过滤规则。
  const localResults = useMemo(
    () => normalizedKeyword ? filterWebIMContacts(contacts, normalizedKeyword) : [],
    [contacts, normalizedKeyword],
  );

  /** 显式调用 contacts facade 的真实 Gateway 用户搜索。 */
  const runServerSearch = useCallback(async () => {
    if (!contactsFacade || !normalizedKeyword || loadingServer) return;
    setMode('server');
    setLoadingServer(true);
    setServerError(null);
    try {
      setServerUsers(await contactsFacade.searchUsers(normalizedKeyword));
    } catch {
      setServerError('搜索失败，请重试');
    } finally {
      setLoadingServer(false);
    }
  }, [contactsFacade, loadingServer, normalizedKeyword]);

  if (restoring) return <ContactSearchPageState label="正在恢复会话" />;
  if (!runtime) {
    return <ContactSearchPageState label="运行配置不可用" detail={startupError} />;
  }
  if (!snapshot.userID) return <Navigate to="/login" replace />;

  return (
    <main className="rn-contact-search-page">
      <section className="rn-contact-search-surface" aria-busy={loadingLocal || loadingServer}>
        <header className="rn-contact-search-header">
          <label className="rn-contact-search-box">
            <span className="sr-only">搜索联系人</span>
            <RNAssetIcon assetURL={searchIconURL} />
            <input
              autoFocus
              type="search"
              value={keyword}
              placeholder="搜索"
              autoCapitalize="none"
              autoComplete="off"
              onChange={event => {
                setKeyword(event.target.value);
                setMode('local');
                setServerError(null);
              }}
            />
            {keyword ? (
              <button type="button" aria-label="清除" onClick={() => {
                setKeyword('');
                setMode('local');
                setServerError(null);
              }}>
                <RNAssetIcon assetURL={clearIconURL} />
              </button>
            ) : null}
          </label>
          <Link to="/contacts" className="rn-contact-search-cancel">取消</Link>
        </header>

        {mode === 'local' ? (
          <section className="rn-contact-search-results" aria-label="本地联系人搜索结果">
            {!normalizedKeyword ? (
              <p className="rn-contact-search-hint">支持搜索联系人ID、昵称、手机号、邮箱</p>
            ) : (
              <>
                <button
                  type="button"
                  className="rn-contact-search-server-row"
                  onClick={() => void runServerSearch()}
                >
                  <span>去服务器搜索</span>
                  <RNAssetIcon assetURL={rightIconURL} />
                </button>
                {localError ? (
                  <ContactSearchError label={localError} onRetry={() => void loadContacts()} />
                ) : null}
                {loadingLocal && contacts.length === 0 ? (
                  <ContactSearchLoading label="正在加载联系人" />
                ) : localResults.length ? localResults.map(contact => (
                  <ContactSearchUserRow
                    key={contact.userID}
                    userID={contact.userID}
                    displayName={contact.displayName}
                    avatarURL={contact.avatarURL}
                    description={getContactSearchDescription(
                      toContactSearchDescriptionSource(contact),
                      normalizedKeyword,
                    )}
                    keyword={normalizedKeyword}
                  />
                )) : localError ? null : (
                  <p className="rn-contact-search-empty">去服务器进行搜索</p>
                )}
              </>
            )}
          </section>
        ) : (
          <section className="rn-contact-search-server" aria-label="服务器好友搜索结果">
            <div className="rn-contact-search-tabs" role="tablist">
              <span role="tab" aria-selected="true">好友</span>
            </div>
            {serverError ? (
              <ContactSearchError label={serverError} onRetry={() => void runServerSearch()} />
            ) : null}
            {loadingServer ? (
              <ContactSearchLoading label="正在搜索" />
            ) : serverUsers.length ? serverUsers.map(user => (
              <ContactSearchUserRow
                key={user.userID}
                userID={user.userID}
                displayName={user.displayName}
                avatarURL={user.avatarURL}
                description={getContactSearchDescription(user, normalizedKeyword)}
                keyword={normalizedKeyword}
              />
            )) : serverError ? null : (
              <p className="rn-contact-search-empty">未找到相关好友</p>
            )}
          </section>
        )}
      </section>
    </main>
  );
}

/** 单个联系人搜索结果行参数。 */
interface ContactSearchUserRowProps {
  readonly userID: string;
  readonly displayName: string;
  readonly avatarURL: string;
  readonly description: string;
  readonly keyword: string;
}

/** 渲染 RN 72px 用户搜索行并进入既有资料路由。 */
function ContactSearchUserRow({
  userID,
  displayName,
  avatarURL,
  description,
  keyword,
}: ContactSearchUserRowProps) {
  return (
    <Link className="rn-contact-search-user-row" to={buildContactProfileRoute(userID)}>
      <ContactProfileAvatar
        userID={userID}
        displayName={displayName}
        avatarURL={avatarURL}
        size="row"
      />
      <span className="rn-contact-search-user-body">
        <ContactSearchHighlightedText text={displayName} keyword={keyword} className="is-title" />
        {description ? (
          <ContactSearchHighlightedText text={description} keyword={keyword} className="is-description" />
        ) : null}
      </span>
    </Link>
  );
}

/** 搜索高亮文本参数。 */
interface ContactSearchHighlightedTextProps {
  readonly text: string;
  readonly keyword: string;
  readonly className: string;
}

/** 只通过文本节点渲染安全的关键词高亮。 */
function ContactSearchHighlightedText({
  text,
  keyword,
  className,
}: ContactSearchHighlightedTextProps) {
  return (
    <span className={`rn-contact-search-text ${className}`}>
      {splitContactSearchText(text, keyword).map((part, index) => (
        <span className={part.highlighted ? 'is-highlighted' : undefined} key={`${index}-${part.text}`}>
          {part.text}
        </span>
      ))}
    </span>
  );
}

/** 搜索错误行参数。 */
interface ContactSearchErrorProps {
  readonly label: string;
  readonly onRetry: () => void;
}

/** 显示真实失败并提供原 operation 重试。 */
function ContactSearchError({ label, onRetry }: ContactSearchErrorProps) {
  return <div className="rn-contact-search-error" role="alert"><span>{label}</span><button type="button" onClick={onRetry}>重试</button></div>;
}

/** 搜索加载状态参数。 */
interface ContactSearchLoadingProps {
  readonly label: string;
}

/** 渲染不改变列表数据的 RN 品牌色加载状态。 */
function ContactSearchLoading({ label }: ContactSearchLoadingProps) {
  return <div className="rn-contact-search-loading" aria-label={label}><span /></div>;
}

/** 搜索启动和配置状态参数。 */
interface ContactSearchPageStateProps {
  readonly label: string;
  readonly detail?: string | null;
}

/** 统一承载搜索页启动和配置错误。 */
function ContactSearchPageState({ label, detail }: ContactSearchPageStateProps) {
  return <main className="rn-contact-search-page-state"><strong>{label}</strong>{detail ? <span>{detail}</span> : null}</main>;
}
