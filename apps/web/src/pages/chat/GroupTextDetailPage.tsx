import { useEffect, useMemo, useState } from 'react';
import type { WebIMJoinedGroup } from '@im28/im-sdk/web';
import { Link, Navigate, useParams } from 'react-router-dom';

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
}: GroupTextDetailPageProps) {
  // conversationID 由稳定 React Router 路径提供。
  const { conversationID = '' } = useParams();
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
        if (active) setState({ group: cachedGroup, loading: true, error: null });
        // refreshedGroups 通过唯一 group facade 刷新真实群资料。
        const refreshedGroups = await sync.groups.sync({ pageSize: 100 });
        // refreshedGroup 是本次远端同步后可验证的最终群资料。
        const refreshedGroup = refreshedGroups.find(item => item.groupID === groupID) ?? null;
        if (!refreshedGroup) throw new Error('群资料不存在或尚未同步');
        if (active) setState({ group: refreshedGroup, loading: false, error: null });
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
  }, [conversationID, fallbackError, snapshot.userID, sync]);

  if (restoring) return <GroupTextDetailPageStatus label={loadingText} />;
  if (!runtime) {
    return <GroupTextDetailPageStatus label="运行配置不可用" detail={startupError} />;
  }
  if (!snapshot.userID) return <Navigate to="/login" replace />;
  // settingsURL 始终返回当前会话的群设置 route。
  const settingsURL = `/conversations/${encodeURIComponent(conversationID)}/settings`;
  // content 保持各 RN 详情页的字段和空值规则。
  const content = state.group ? selectText(state.group).trim() || emptyText : emptyText;

  return (
    <main className="rn-group-text-detail-page">
      <section className="rn-group-text-detail-surface" aria-busy={state.loading}>
        <header className="rn-group-text-detail-header">
          <Link to={settingsURL} aria-label="返回群设置">
            <RNAssetIcon assetURL={backIconURL} />
          </Link>
          <h1>{title}</h1>
          <span />
        </header>
        <div className="rn-group-text-detail-content">
          {state.error ? (
            <p className="rn-group-text-detail-error" role="status">{state.error}</p>
          ) : null}
          {state.group ? (
            <p className="rn-group-text-detail-copy">{content}</p>
          ) : state.loading ? (
            <p className="rn-group-text-detail-state">{loadingText}</p>
          ) : null}
        </div>
        {state.group && footerText ? (
          <p className="rn-group-text-detail-footer">{footerText}</p>
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
