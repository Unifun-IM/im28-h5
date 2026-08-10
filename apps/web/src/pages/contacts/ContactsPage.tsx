import { useCallback, useEffect, useMemo, useState } from 'react';
import type { WebIMContact } from '@im28/im-sdk/web';
import { Link, Navigate } from 'react-router-dom';

import bellIconURL from '../../assets/rn/assets/icons/imm28/bell.solid.svg';
import groupsIconURL from '../../assets/rn/assets/icons/imm28/contact-groups.svg';
import searchIconURL from '../../assets/rn/assets/icons/imm28/search.regular.svg';
import starIconURL from '../../assets/rn/assets/icons/imm28/star.solid.svg';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';
import { useWebIMRuntime } from '../../runtime/index.js';
import { ContactRow } from './ContactRow.js';
import {
  STARRED_CONTACT_INDEX,
  buildContactListEntries,
  getContactIndexes,
  getContactSectionID,
} from './contact-list-view.js';
import './contacts-page.css';

/** RN 通讯录核心页通过 Web SDK facade 读取真实 Gateway 好友列表。 */
export function ContactsPage() {
  // runtime context 是页面唯一允许消费的 SDK owner。
  const { runtime, snapshot, restoring, startupError } = useWebIMRuntime();
  // contacts facade 不向页面暴露 Gateway client 或 token。
  const contactsFacade = useMemo(() => runtime?.getSync().contacts ?? null, [runtime]);
  // contacts 保存已完成分页和归一化的好友记录。
  const [contacts, setContacts] = useState<readonly WebIMContact[]>([]);
  // loading 控制首次加载和刷新状态。
  const [loading, setLoading] = useState(false);
  // error 显示真实 SDK/Gateway 失败，不降级为空列表成功。
  const [error, setError] = useState<string | null>(null);

  /** 调用唯一 contacts facade 拉取完整好友列表。 */
  const loadContacts = useCallback(async () => {
    if (!contactsFacade || !snapshot.userID) return;
    setLoading(true);
    setError(null);
    try {
      setContacts(await contactsFacade.list());
    } catch {
      setError('加载失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, [contactsFacade, snapshot.userID]);

  useEffect(() => {
    void loadContacts();
  }, [loadContacts]);

  // entries 聚合星标和普通联系人分组，搜索由独立 RN 全屏路由负责。
  const entries = useMemo(
    () => buildContactListEntries(contacts, ''),
    [contacts],
  );
  // indexes 只展示当前结果实际存在的分组。
  const indexes = useMemo(() => getContactIndexes(entries), [entries]);

  if (restoring) return <ContactsPageState label="正在恢复会话" />;
  if (!runtime) {
    return <ContactsPageState label="运行配置不可用" detail={startupError} />;
  }
  if (!snapshot.userID) return <Navigate to="/login" replace />;

  return (
    <main className="rn-contacts-page">
      <section className="rn-contacts-surface" aria-busy={loading}>
        <header className="rn-contacts-header">
          <div className="rn-contacts-header-top">
            <span aria-hidden="true" />
            <h1>通讯录({contacts.length})</h1>
            <span aria-hidden="true" />
          </div>
          <Link className="rn-contacts-search" to="/contacts/search" aria-label="搜索好友或账号ID">
            <RNAssetIcon assetURL={searchIconURL} />
            <span className="rn-contacts-search-placeholder">搜索好友/账号ID</span>
          </Link>
        </header>

        {error ? (
          <div className="rn-contacts-error" role="alert">
            <span>{error}</span>
            <button type="button" onClick={() => void loadContacts()}>重试</button>
          </div>
        ) : null}

        <section className="rn-contacts-list" aria-label="联系人列表">
          <Link className="rn-contact-shortcut" to="/contacts/friend-applications">
            <span><RNAssetIcon assetURL={bellIconURL} /></span>
            <strong>好友验证</strong>
          </Link>
          <Link className="rn-contact-shortcut is-group" to="/contacts/group-applications">
            <span><RNAssetIcon assetURL={groupsIconURL} /></span>
            <strong>群聊验证</strong>
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
            ) : <ContactRow key={entry.key} contact={entry.contact} />)
          ) : (
            <p className="rn-contacts-empty">当前暂无好友</p>
          )}
        </section>

        {indexes.length ? (
          <nav className="rn-contact-index" aria-label="通讯录索引">
            {indexes.map(index => (
              <button
                type="button"
                key={index}
                aria-label={`跳转到${index === STARRED_CONTACT_INDEX ? '星标好友' : index}`}
                onClick={() => document.getElementById(getContactSectionID(index))?.scrollIntoView({ block: 'start' })}
              >
                {index === STARRED_CONTACT_INDEX ? <RNAssetIcon assetURL={starIconURL} /> : index}
              </button>
            ))}
          </nav>
        ) : null}
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
