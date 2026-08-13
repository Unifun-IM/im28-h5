import { useEffect, useMemo, useRef, useState } from 'react';
import type {
  Conversation,
  ConversationAutoDeleteSeconds,
  WebIMJoinedGroup,
} from '@im28/im-sdk/web';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';

import backIconURL from '../../assets/rn/assets/icons/imm28/nav-arrow-left.regular.svg';
import checkIconURL from '../../assets/rn/assets/icons/imm28/check.regular.svg';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';
import { PageNavbar } from '../../components/navigation/PageNavbar.js';
import { useWebIMRuntime } from '../../runtime/index.js';
import {
  CHAT_AUTO_DELETE_OPTIONS,
  canManageChatAutoDelete,
  normalizeChatAutoDeleteSelection,
} from './chat-auto-delete-view.js';
import './chat-auto-delete-page.css';

/** RN 单聊/群聊共用的自动删除选择页。 */
export function ChatAutoDeletePage() {
  /** conversationID 来自唯一 React Router path。 */
  const { conversationID = '' } = useParams();
  /** navigate 仅在 Gateway 成功后返回设置页。 */
  const navigate = useNavigate();
  /** runtime context 提供认证状态和唯一 shared sync。 */
  const { runtime, snapshot, restoring, startupError } = useWebIMRuntime();
  /** sync 跟随认证 runtime 生命周期。 */
  const sync = useMemo(() => runtime?.getSync() ?? null, [runtime]);
  /** conversation 保存当前账号真实缓存目标。 */
  const [conversation, setConversation] = useState<Conversation | null>(null);
  /** group 保存群权限判断所需的 shared 快照。 */
  const [group, setGroup] = useState<WebIMJoinedGroup | null>(null);
  /** selectedSeconds 是用户尚未确认的 RN 选项。 */
  const [selectedSeconds, setSelectedSeconds] =
    useState<ConversationAutoDeleteSeconds | null>(null);
  /** loading 覆盖目标、权限与权威详情读取。 */
  const [loading, setLoading] = useState(true);
  /** saving 防止重复提交。 */
  const [saving, setSaving] = useState(false);
  /** error 显示真实权限、读取或保存失败。 */
  const [error, setError] = useState('');
  /** userTouched 阻止迟到的权威读取覆盖用户选择。 */
  const userTouched = useRef(false);

  useEffect(() => {
    if (!sync || !snapshot.userID || !conversationID) return;
    /** active 阻止离开路由后的异步回写。 */
    let active = true;
    setLoading(true);
    setError('');
    setConversation(null);
    setGroup(null);
    userTouched.current = false;
    void (async () => {
      try {
        /** conversations 优先读取当前账号 SQLite。 */
        let conversations = await sync.conversations.listCached({ limit: 500 });
        /** target 必须属于当前账号真实缓存。 */
        let target = conversations.find(item => item.conversationID === conversationID);
        if (!target) {
          conversations = await sync.conversations.sync({ pageSize: 100 });
          target = conversations.find(item => item.conversationID === conversationID);
        }
        if (!target) throw new Error('会话不存在或尚未同步');
        /** targetGroup 只在群聊中读取 shared joined-group 权限。 */
        let targetGroup: WebIMJoinedGroup | null = null;
        if (target.type === 'group') {
          /** groups 先恢复缓存，缺失时再全量刷新。 */
          let groups = await sync.groups.listCached();
          targetGroup = groups.find(item => item.groupID === target?.targetID) ?? null;
          if (!targetGroup) {
            groups = await sync.groups.sync({ pageSize: 100 });
            targetGroup = groups.find(item => item.groupID === target?.targetID) ?? null;
          }
        }
        if (!canManageChatAutoDelete(target, targetGroup)) {
          throw new Error('当前账号无权修改该群的定时删除设置');
        }
        /** setting 来自 Gateway 权威详情并已由 SDK 写入 schema v11。 */
        const setting = await sync.conversations.getAutoDelete(conversationID);
        if (active) {
          setConversation(target);
          setGroup(targetGroup);
          if (!userTouched.current) {
            setSelectedSeconds(
              normalizeChatAutoDeleteSelection(setting.autoDeleteSeconds),
            );
          }
        }
      } catch (cause) {
        if (active) setError(readAutoDeleteError(cause, '定时删除设置加载失败'));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [conversationID, snapshot.userID, sync]);

  /** 显式确认后调用 shared success-only mutation。 */
  async function confirmAutoDelete() {
    if (!sync || !conversation || selectedSeconds === null || saving) return;
    setSaving(true);
    setError('');
    try {
      await sync.conversations.setAutoDelete(
        conversation.conversationID,
        selectedSeconds,
      );
      navigate(
        '/conversations/' + encodeURIComponent(conversation.conversationID) + '/settings',
        { replace: true },
      );
    } catch (cause) {
      setError(readAutoDeleteError(cause, '定时删除设置保存失败'));
    } finally {
      setSaving(false);
    }
  }

  if (restoring) return <AutoDeletePageState label="正在恢复定时删除设置" />;
  if (!runtime) return <AutoDeletePageState label="运行配置不可用" detail={startupError} />;
  if (!snapshot.userID) return <Navigate to="/login" replace />;
  /** settingsURL 是返回当前会话设置页的稳定目标。 */
  const settingsURL =
    '/conversations/' + encodeURIComponent(conversationID) + '/settings';
  /** authorized 保护渲染阶段不暴露群成员操作表单。 */
  const authorized = conversation
    ? canManageChatAutoDelete(conversation, group)
    : false;

  return (
    <main className="rn-chat-auto-delete-page">
      <section className="rn-chat-auto-delete-surface" aria-busy={loading || saving}>
        <PageNavbar className="rn-chat-auto-delete-header">
          <Link to={settingsURL} aria-label="返回聊天设置">
            <RNAssetIcon assetURL={backIconURL} />
          </Link>
          <h1>定时删除</h1>
          <button
            type="button"
            disabled={!authorized || selectedSeconds === null || saving || loading}
            onClick={() => void confirmAutoDelete()}
          >
            {saving ? '保存中' : '确定'}
          </button>
        </PageNavbar>
        <div className="rn-chat-auto-delete-content">
          {error ? <p className="rn-chat-auto-delete-error" role="status">{error}</p> : null}
          {authorized ? (
            <div className="rn-chat-auto-delete-card">
              {CHAT_AUTO_DELETE_OPTIONS.map((option, index) => {
                /** selected 表示当前草稿选择。 */
                const selected = option.seconds === selectedSeconds;
                return (
                  <button
                    key={option.seconds}
                    type="button"
                    className={index < CHAT_AUTO_DELETE_OPTIONS.length - 1 ? 'is-divided' : ''}
                    aria-pressed={selected}
                    disabled={saving}
                    onClick={() => {
                      userTouched.current = true;
                      setSelectedSeconds(option.seconds);
                    }}
                  >
                    <span>{option.label}</span>
                    {selected ? <RNAssetIcon assetURL={checkIconURL} /> : null}
                  </button>
                );
              })}
            </div>
          ) : loading ? <p className="rn-chat-auto-delete-state">正在加载定时删除设置</p> : null}
        </div>
      </section>
    </main>
  );
}

/** 未知异常映射为稳定可见文案。 */
function readAutoDeleteError(cause: unknown, fallback: string): string {
  return cause instanceof Error && cause.message ? cause.message : fallback;
}

/** 认证恢复和配置失败使用稳定页面状态。 */
function AutoDeletePageState({
  label,
  detail = '',
}: {
  readonly label: string;
  readonly detail?: string | null;
}) {
  return <main className="rn-chat-page-state"><strong>{label}</strong>{detail ? <span>{detail}</span> : null}</main>;
}

export default ChatAutoDeletePage;
