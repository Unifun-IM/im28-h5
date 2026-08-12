import { useEffect, useMemo, useState } from 'react';
import type { WebIMJoinedGroup, WebIMJoinedGroupSync } from '@im28/im-sdk/web';
import { Link, Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';

import backIconURL from '../../assets/rn/assets/icons/imm28/nav-arrow-left.regular.svg';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';
import { useWebIMRuntime } from '../../runtime/index.js';

/** 群文本详情页的字段与 RN 文案配置。 */
interface GroupTextDetailPageProps {
  readonly title: string;
  readonly emptyText: string;
  readonly loadingText: string;
  readonly fallbackError: string;
  readonly footerText?: string;
  readonly selectText: (group: WebIMJoinedGroup) => string;
  readonly editor?: GroupTextDetailEditor;
}

/** 可选编辑器只注入字段文案和 shared facade mutation。 */
interface GroupTextDetailEditor {
  readonly maxLength: number;
  readonly placeholder: string;
  readonly successText: string;
  readonly confirmTitle?: string;
  readonly confirmText?: string;
  readonly canEdit: (group: WebIMJoinedGroup) => boolean;
  readonly normalize: (value: string) => string;
  readonly update: (
    groups: WebIMJoinedGroupSync,
    groupID: string,
    value: string,
    conversationID: string,
  ) => Promise<WebIMJoinedGroup>;
}

/** 群文本详情页只保存可证明的群资料和读取过程。 */
interface GroupTextDetailPageState {
  readonly group: WebIMJoinedGroup | null;
  readonly loading: boolean;
  readonly error: string | null;
}

/** 群简介与群公告共用的 cache-first 只读详情 owner。 */
export function GroupTextDetailPage({
  title,
  emptyText,
  loadingText,
  fallbackError,
  footerText = '',
  selectText,
  editor,
}: GroupTextDetailPageProps) {
  // conversationID 由稳定 React Router 路径提供。
  const { conversationID = '' } = useParams();
  // navigate 复用 React Router history 完成取消和未修改返回。
  const navigate = useNavigate();
  // searchParams 只允许公告横幅声明只读查看态，不携带业务数据。
  const [searchParams] = useSearchParams();
  // forceReadOnly 保证从聊天公告横幅进入时不直接编辑。
  const forceReadOnly = searchParams.get('mode') === 'view';
  // runtime context 提供认证快照和当前账号唯一 sync facade。
  const { runtime, snapshot, restoring, startupError } = useWebIMRuntime();
  // sync 生命周期跟随认证 runtime，页面不创建 Gateway 或 Repository。
  const sync = useMemo(() => runtime?.getSync() ?? null, [runtime]);
  // state 覆盖 cache-first 恢复、远端刷新和显式失败状态。
  const [state, setState] = useState<GroupTextDetailPageState>({
    group: null,
    loading: true,
    error: null,
  });
  // draft 只保存当前群字段的浏览器表单值。
  const [draft, setDraft] = useState('');
  // saving 禁止重复提交同一 Gateway mutation。
  const [saving, setSaving] = useState(false);
  // notice 只在真实 shared mutation 成功后展示。
  const [notice, setNotice] = useState('');
  // confirmOpen 仅用于公告发布等需要显式二次确认的 mutation。
  const [confirmOpen, setConfirmOpen] = useState(false);
  // pendingValue 冻结确认层打开时已完成校验的表单值。
  const [pendingValue, setPendingValue] = useState('');

  useEffect(() => {
    if (!sync || !snapshot.userID || !conversationID) return;
    // active 阻止离开 route 后异步读取结果回写。
    let active = true;
    setState({ group: null, loading: true, error: null });
    void (async () => {
      try {
        // conversations 先读取当前账号 SQLite，缺失时才执行 canonical full sync。
        let conversations = await sync.conversations.listCached({ limit: 500 });
        // conversation 必须属于当前账号，禁止用 route ID 伪造群身份。
        let conversation = conversations.find(item => item.conversationID === conversationID);
        if (!conversation) {
          conversations = await sync.conversations.sync({ pageSize: 100 });
          conversation = conversations.find(item => item.conversationID === conversationID);
        }
        if (!conversation) throw new Error('会话不存在或尚未同步');
        if (conversation.type !== 'group') throw new Error('当前会话不是群聊');
        // groupID 只使用 shared Conversation 规范化后的目标身份。
        const groupID = conversation.targetID.trim();
        if (!groupID) throw new Error('群聊身份不可用');
        // cachedGroups 让刷新页面时先恢复本地群资料。
        const cachedGroups = await sync.groups.listCached();
        // cachedGroup 只接受与当前会话目标完全匹配的群资料。
        const cachedGroup = cachedGroups.find(item => item.groupID === groupID) ?? null;
        if (active) {
          setState({ group: cachedGroup, loading: true, error: null });
          if (cachedGroup) setDraft(selectText(cachedGroup));
        }
        // refreshedGroups 通过唯一 group facade 刷新真实群资料。
        const refreshedGroups = await sync.groups.sync({ pageSize: 100 });
        // refreshedGroup 是本次远端同步后可验证的最终群资料。
        const refreshedGroup = refreshedGroups.find(item => item.groupID === groupID) ?? null;
        if (!refreshedGroup) throw new Error('群资料不存在或尚未同步');
        if (active) {
          setState({ group: refreshedGroup, loading: false, error: null });
          setDraft(selectText(refreshedGroup));
        }
      } catch (cause) {
        if (!active) return;
        setState(current => ({
          ...current,
          loading: false,
          error: readGroupTextDetailError(cause, fallbackError),
        }));
      }
    })();
    return () => {
      active = false;
    };
  }, [conversationID, fallbackError, selectText, snapshot.userID, sync]);

  if (restoring) return <GroupTextDetailPageStatus label={loadingText} />;
  if (!runtime) {
    return <GroupTextDetailPageStatus label="运行配置不可用" detail={startupError} />;
  }
  if (!snapshot.userID) return <Navigate to="/login" replace />;
  // settingsURL 始终返回当前会话的群设置 route。
  const settingsURL = `/conversations/${encodeURIComponent(conversationID)}/settings`;
  // canEdit 对齐 RN 当前 owner/admin 群资料权限并要求显式 mutation 配置。
  const canEdit = Boolean(
    editor &&
    !forceReadOnly &&
    state.group &&
    editor.canEdit(state.group),
  );
  // content 保持各 RN 详情页的字段和空值规则。
  const content = state.group ? selectText(state.group).trim() || emptyText : emptyText;

  /** 保存前执行页面级输入约束，最终权限和状态仍由 SDK 校验。 */
  const submit = async (confirmed = false) => {
    if (!editor || !sync || !state.group || !canEdit || saving || state.loading) return;
    // normalized 对齐 shared SDK 的非空 trim 与长度合同。
    let normalized = '';
    try {
      normalized = editor.normalize(draft);
    } catch (cause) {
      setState(current => ({
        ...current,
        error: readGroupTextDetailError(cause, fallbackError),
      }));
      return;
    }
    if (normalized === selectText(state.group).trim()) {
      navigate(settingsURL);
      return;
    }
    if (editor.confirmTitle && !confirmed) {
      setPendingValue(normalized);
      setConfirmOpen(true);
      return;
    }
    // submittedValue 在确认态使用已经冻结的校验结果。
    const submittedValue = confirmed ? pendingValue : normalized;
    setSaving(true);
    setNotice('');
    setState(current => ({ ...current, error: null }));
    try {
      // updated 必须来自 shared facade 的 Gateway + SQLite 成功结果。
      const updated = await editor.update(
        sync.groups,
        state.group.groupID,
        submittedValue,
        conversationID,
      );
      setState({ group: updated, loading: false, error: null });
      setDraft(selectText(updated));
      setNotice(editor.successText);
      setConfirmOpen(false);
      setPendingValue('');
    } catch (cause) {
      setState(current => ({
        ...current,
        error: readGroupTextDetailError(cause, fallbackError),
      }));
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="rn-group-text-detail-page">
      <section className="rn-group-text-detail-surface" aria-busy={state.loading}>
        <header className="rn-group-text-detail-header">
          <Link to={settingsURL} aria-label={canEdit ? `取消编辑${title}` : '返回群设置'}>
            <RNAssetIcon assetURL={backIconURL} />
          </Link>
          <h1>{title}</h1>
          {canEdit ? (
            <button
              type="button"
              className="rn-group-text-detail-done"
              disabled={saving || state.loading}
              onClick={() => void submit()}
            >
              {saving ? '保存中' : '完成'}
            </button>
          ) : <span />}
        </header>
        <div className="rn-group-text-detail-content">
          {state.error ? (
            <p className="rn-group-text-detail-error" role="status">{state.error}</p>
          ) : null}
          {notice ? (
            <p className="rn-group-text-detail-notice" role="status">{notice}</p>
          ) : null}
          {state.group ? (
            canEdit && editor ? (
              <textarea
                autoFocus
                className="rn-group-text-detail-input"
                value={draft}
                maxLength={editor.maxLength}
                placeholder={editor.placeholder}
                disabled={saving}
                aria-label={`编辑${title}`}
                onChange={event => setDraft(event.currentTarget.value)}
              />
            ) : (
              <p className="rn-group-text-detail-copy">{content}</p>
            )
          ) : state.loading ? (
            <p className="rn-group-text-detail-state">{loadingText}</p>
          ) : null}
        </div>
        {state.group && footerText && !canEdit ? (
          <p className="rn-group-text-detail-footer">{footerText}</p>
        ) : null}
        {confirmOpen && editor ? (
          <div
            className="rn-group-text-confirm-backdrop"
            role="presentation"
            onClick={() => { if (!saving) setConfirmOpen(false); }}
          >
            <section
              className="rn-group-text-confirm"
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="group-text-confirm-title"
              onClick={event => event.stopPropagation()}
            >
              <h2 id="group-text-confirm-title">{editor.confirmTitle}</h2>
              <p>{editor.confirmText}</p>
              <div>
                <button type="button" disabled={saving} onClick={() => setConfirmOpen(false)}>取消</button>
                <button type="button" disabled={saving} onClick={() => void submit(true)}>
                  {saving ? '发布中' : '确定'}
                </button>
              </div>
            </section>
          </div>
        ) : null}
      </section>
    </main>
  );
}

/** 群文本读取异常统一保留真实错误或字段专属缺省文案。 */
function readGroupTextDetailError(cause: unknown, fallbackError: string): string {
  return cause instanceof Error && cause.message ? cause.message : fallbackError;
}

/** 认证恢复与运行配置失败使用稳定页面状态，避免空白 route。 */
function GroupTextDetailPageStatus({
  label,
  detail = '',
}: {
  readonly label: string;
  readonly detail?: string | null;
}) {
  return (
    <main className="rn-chat-page-state">
      <strong>{label}</strong>
      {detail ? <span>{detail}</span> : null}
    </main>
  );
}
