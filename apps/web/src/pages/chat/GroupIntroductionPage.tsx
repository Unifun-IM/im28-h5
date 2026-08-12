import { useEffect, useMemo, useState } from 'react';
import type { WebIMJoinedGroup } from '@im28/im-sdk/web';
import { Link, Navigate, useParams } from 'react-router-dom';

import backIconURL from '../../assets/rn/assets/icons/imm28/nav-arrow-left.regular.svg';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';
import { useWebIMRuntime } from '../../runtime/index.js';
import './group-introduction-page.css';

/** 群简介页状态只保存可证明的群资料和读取过程。 */
interface GroupIntroductionPageState {
  readonly group: WebIMJoinedGroup | null;
  readonly loading: boolean;
  readonly error: string | null;
}

/** RN 群简介页的 H5 只读实现，数据只来自 shared sync facade。 */
export function GroupIntroductionPage() {
  // conversationID 由稳定 React Router 路径提供。
  const { conversationID = '' } = useParams();
  // runtime context 提供认证快照和当前账号唯一 sync facade。
  const { runtime, snapshot, restoring, startupError } = useWebIMRuntime();
  // sync 生命周期跟随认证 runtime，页面不创建 Gateway 或 Repository。
  const sync = useMemo(() => runtime?.getSync() ?? null, [runtime]);
  // state 覆盖 cache-first 恢复、远端刷新和显式失败状态。
  const [state, setState] = useState<GroupIntroductionPageState>({
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
        // cachedGroups 让刷新页面时先恢复本地群简介。
        const cachedGroups = await sync.groups.listCached();
        // cachedGroup 只接受与当前会话目标完全匹配的群资料。
        const cachedGroup = cachedGroups.find(item => item.groupID === groupID) ?? null;
        if (active) {
          setState({ group: cachedGroup, loading: true, error: null });
        }
        // refreshedGroups 通过唯一 group facade 刷新真实群资料。
        const refreshedGroups = await sync.groups.sync({ pageSize: 100 });
        // refreshedGroup 是本次远端同步后可验证的最终群资料。
        const refreshedGroup = refreshedGroups.find(item => item.groupID === groupID) ?? null;
        if (!refreshedGroup) throw new Error('群资料不存在或尚未同步');
        if (active) {
          setState({ group: refreshedGroup, loading: false, error: null });
        }
      } catch (cause) {
        if (!active) return;
        setState(current => ({
          ...current,
          loading: false,
          error: readGroupIntroductionError(cause),
        }));
      }
    })();
    return () => {
      active = false;
    };
  }, [conversationID, snapshot.userID, sync]);

  if (restoring) return <GroupIntroductionPageState label="正在恢复群简介" />;
  if (!runtime) {
    return <GroupIntroductionPageState label="运行配置不可用" detail={startupError} />;
  }
  if (!snapshot.userID) return <Navigate to="/login" replace />;
  // settingsURL 始终返回当前会话的群设置 route。
  const settingsURL = `/conversations/${encodeURIComponent(conversationID)}/settings`;
  // introduction 保持 RN 规则：空简介在详情页显示明确缺省值。
  const introduction = state.group?.introduction.trim() || '暂无群简介';

  return (
    <main className="rn-group-introduction-page">
      <section className="rn-group-introduction-surface" aria-busy={state.loading}>
        <header className="rn-group-introduction-header">
          <Link to={settingsURL} aria-label="返回群设置">
            <RNAssetIcon assetURL={backIconURL} />
          </Link>
          <h1>群简介</h1>
          <span />
        </header>
        <div className="rn-group-introduction-content">
          {state.error ? (
            <p className="rn-group-introduction-error" role="status">{state.error}</p>
          ) : null}
          {state.group ? (
            <p className="rn-group-introduction-copy">{introduction}</p>
          ) : state.loading ? (
            <p className="rn-group-introduction-state">正在加载群简介</p>
          ) : null}
        </div>
        {state.group ? (
          <p className="rn-group-introduction-footer">仅群主及群管理员可编辑</p>
        ) : null}
      </section>
    </main>
  );
}

/** 群简介读取异常统一映射为可见中文文案。 */
function readGroupIntroductionError(cause: unknown): string {
  return cause instanceof Error && cause.message ? cause.message : '群简介加载失败';
}

/** 认证恢复与运行配置失败使用稳定页面状态，避免空白 route。 */
function GroupIntroductionPageState({
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

export default GroupIntroductionPage;
