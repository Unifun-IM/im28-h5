import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type {
  Conversation,
  WebIMGroupMember,
  WebIMJoinedGroup,
  WebIMRuntime,
} from '@im28/im-sdk/web';

/** 聊天设置数据 owner 只接收当前账号和稳定会话身份。 */
interface UseChatSettingsDataOptions {
  readonly runtime: WebIMRuntime | null;
  readonly userID: string | null;
  readonly conversationID: string;
}

/** 聊天设置页面消费的共享快照和最小本地更新动作。 */
interface ChatSettingsDataBinding {
  readonly sync: ReturnType<WebIMRuntime['getSync']> | null;
  readonly conversation: Conversation | null;
  readonly group: WebIMJoinedGroup | null;
  readonly members: readonly WebIMGroupMember[];
  readonly loading: boolean;
  readonly error: string | null;
  readonly replaceConversation: (conversation: Conversation) => void;
  readonly replaceMember: (member: WebIMGroupMember) => void;
  readonly clearError: () => void;
  readonly showError: (message: string) => void;
}

/** 承载聊天设置会话、群资料和成员的 cache-first 完整同步。 */
export function useChatSettingsData({
  runtime,
  userID,
  conversationID,
}: UseChatSettingsDataOptions): ChatSettingsDataBinding {
  // sync 生命周期绑定当前认证 runtime，不在页面创建 Gateway 或 Repository。
  const sync = useMemo(() => runtime?.getSync() ?? null, [runtime]);
  // conversation 保存当前账号缓存中已确认的目标会话。
  const [conversation, setConversation] = useState<Conversation | null>(null);
  // group 保存匹配当前群目标的 shared joined-group 快照。
  const [group, setGroup] = useState<WebIMJoinedGroup | null>(null);
  // members 保存 shared group-member facade 返回的稳定顺序。
  const [members, setMembers] = useState<readonly WebIMGroupMember[]>([]);
  // loading 覆盖首次 cache 读取和必要的远端刷新。
  const [loading, setLoading] = useState(true);
  // error 保留真实读取失败，不用空设置页伪装成功。
  const [error, setError] = useState<string | null>(null);
  // loadIDRef 阻止离开或快速切换路由后的旧请求回写。
  const loadIDRef = useRef(0);

  useEffect(() => {
    if (!sync || !userID || !conversationID) return;
    // loadID 标识本次 cache-first 请求链。
    const loadID = loadIDRef.current + 1;
    loadIDRef.current = loadID;
    setLoading(true);
    setError(null);
    setConversation(null);
    setGroup(null);
    setMembers([]);
    void (async () => {
      try {
        // conversations 先读当前账号 SQLite，缺失时才执行 canonical full sync。
        let conversations = await sync.conversations.listCached({ limit: 500 });
        // target 必须属于当前账号的真实会话缓存。
        let target = conversations.find(item => item.conversationID === conversationID);
        if (!target) {
          conversations = await sync.conversations.sync({ pageSize: 100 });
          target = conversations.find(item => item.conversationID === conversationID);
        }
        if (!target) throw new Error('会话不存在或尚未同步');
        if (loadIDRef.current !== loadID) return;
        setConversation(target);
        if (target.type !== 'group') return;
        // groupID 只来自共享 Conversation targetID。
        const groupID = target.targetID.trim();
        if (!groupID) throw new Error('群聊身份不可用');
        // cachedGroups 和 cachedMembers 让页面先恢复本地资料。
        const [cachedGroups, cachedMembers] = await Promise.all([
          sync.groups.listCached(),
          sync.groupMembers.listCached(groupID),
        ]);
        if (loadIDRef.current !== loadID) return;
        setGroup(cachedGroups.find(item => item.groupID === groupID) ?? null);
        setMembers(cachedMembers);
        // refreshedGroups 通过唯一 group facade 刷新群事实。
        const refreshedGroups = await sync.groups.sync({ pageSize: 100 });
        // refreshedMembers 在群 cache 完成后读取同一群成员主链。
        const refreshedMembers = await sync.groupMembers.sync(groupID, { pageSize: 100 });
        if (loadIDRef.current !== loadID) return;
        setGroup(refreshedGroups.find(item => item.groupID === groupID) ?? null);
        setMembers(refreshedMembers);
      } catch (cause) {
        if (loadIDRef.current === loadID) setError(readChatSettingsError(cause));
      } finally {
        if (loadIDRef.current === loadID) setLoading(false);
      }
    })();
    return () => {
      if (loadIDRef.current === loadID) loadIDRef.current += 1;
    };
  }, [conversationID, sync, userID]);

  /** 用 shared mutation 返回的 canonical 会话替换当前页面快照。 */
  const replaceConversation = useCallback((next: Conversation): void => {
    setConversation(next);
  }, []);

  /** 群资料编辑后只替换同身份成员，保留 shared 稳定顺序。 */
  const replaceMember = useCallback((updated: WebIMGroupMember): void => {
    setMembers(current => current.map(member => (
      member.userID === updated.userID ? updated : member
    )));
  }, []);

  /** 清除已经呈现的页面级同步错误。 */
  const clearError = useCallback((): void => setError(null), []);

  /** 呈现远端已完成但本地未收敛等不可 toast 后消失的状态。 */
  const showError = useCallback((message: string): void => setError(message), []);

  return {
    sync,
    conversation,
    group,
    members,
    loading,
    error,
    replaceConversation,
    replaceMember,
    clearError,
    showError,
  };
}

/** 聊天设置异常统一映射为可见中文文案。 */
export function readChatSettingsError(cause: unknown): string {
  return cause instanceof Error && cause.message ? cause.message : '聊天设置加载失败';
}
