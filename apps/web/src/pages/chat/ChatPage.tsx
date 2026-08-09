import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from 'react';
import type { Conversation, Message } from '@im28/im-sdk-web';
import { ArrowLeft, Send } from 'lucide-react';
import { Link, Navigate, useParams } from 'react-router-dom';

import { useWebIMRuntime } from '../../runtime/index.js';

/** 聊天页消费 cache/pull/send API，不接触 Gateway 或 Repository。 */
export function ChatPage() {
  // conversationID 由 React Router path param 管理。
  const { conversationID = '' } = useParams();
  // runtime context 提供 auth guard 和聚合 sync facade。
  const { runtime, snapshot, restoring } = useWebIMRuntime();
  // sync 与 runtime 生命周期一致。
  const sync = useMemo(() => runtime?.getSync() ?? null, [runtime]);
  // conversation 用于顶部身份展示。
  const [conversation, setConversation] = useState<Conversation | null>(null);
  // messages 保持 Repository newest-first 结果。
  const [messages, setMessages] = useState<readonly Message[]>([]);
  // draft 是当前输入框文本，不写入 token/session storage。
  const [draft, setDraft] = useState('');
  // loading 标记首次 cache 与 remote pull。
  const [loading, setLoading] = useState(true);
  // sending 防止重复提交同一 draft。
  const [sending, setSending] = useState(false);
  // error 显式展示 pull/send failure。
  const [error, setError] = useState<string | null>(null);
  // messageEnd 用于新消息后保持底部可见。
  const messageEnd = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sync || !snapshot.userID || !conversationID) {
      return;
    }
    // active 阻止路由切换后的旧请求回写。
    let active = true;
    void (async () => {
      try {
        // cachedConversations 确认页面目标属于当前账号 cache。
        const cachedConversations = await sync.conversations.listCached({
          limit: 500,
        });
        // target 是当前路由对应的会话。
        const target = cachedConversations.find(
          item => item.conversationID === conversationID,
        );
        if (!target) {
          throw new Error('会话不存在或尚未同步');
        }
        if (active) {
          setConversation(target);
        }
        // cachedMessages 先呈现 SQLite 历史。
        const cachedMessages = await sync.messages.getCachedHistory({
          conversationID,
          limit: 50,
        });
        if (active) {
          setMessages(cachedMessages);
        }
        // remoteMessages 从 seq 0 恢复当前首屏窗口。
        const remoteMessages = await sync.messages.pullHistory({
          conversationID,
          fromSeq: target.lastMsgSeq ?? '0',
          limit: 50,
        });
        if (active) {
          setMessages(remoteMessages);
        }
      } catch (cause) {
        if (active) {
          setError(readErrorMessage(cause));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    })();
    return () => {
      active = false;
    };
  }, [conversationID, snapshot.userID, sync]);

  // orderedMessages 转为聊天阅读所需 oldest-first 顺序。
  const orderedMessages = useMemo(() => [...messages].reverse(), [messages]);

  useEffect(() => {
    messageEnd.current?.scrollIntoView({ block: 'end' });
  }, [orderedMessages.length]);

  /** 发送文本并重新读取本地状态，失败消息也会呈现。 */
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!sync || !draft.trim() || sending) {
      return;
    }
    // text 在清空输入前保存本轮提交值。
    const text = draft;
    setDraft('');
    setSending(true);
    setError(null);
    try {
      await sync.messages.sendText({ conversationID, text });
    } catch (cause) {
      setError(readErrorMessage(cause));
    } finally {
      try {
        // cached 包含 sent 或 failed 的最终本地状态。
        const cached = await sync.messages.getCachedHistory({
          conversationID,
          limit: 50,
        });
        setMessages(cached);
      } catch (cause) {
        setError(readErrorMessage(cause));
      } finally {
        setSending(false);
      }
    }
  }

  if (restoring) {
    return <main className="page-state"><strong>正在恢复会话</strong></main>;
  }
  if (!runtime || !snapshot.userID) {
    return <Navigate to="/login" replace />;
  }

  // title 在资料缺失时回退 conversation ID。
  const title = conversation?.name?.trim() || conversation?.targetID || '会话';
  return (
    <main className="chat-page">
      <header className="chat-topbar">
        <Link className="icon-button" to="/conversations" aria-label="返回会话" title="返回会话">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1>{title}</h1>
          <p>{conversation?.type === 'group' ? '群聊' : '单聊'}</p>
        </div>
      </header>
      {error ? <p className="sync-warning" role="alert">{error}</p> : null}
      <section className="message-list" aria-label="消息记录">
        {loading ? <p className="message-empty">正在加载消息</p> : null}
        {!loading && !orderedMessages.length ? (
          <p className="message-empty">暂无消息</p>
        ) : null}
        {orderedMessages.map(message => (
          <MessageBubble key={message.clientMsgID} message={message} />
        ))}
        <div ref={messageEnd} />
      </section>
      <form className="message-composer" onSubmit={handleSubmit}>
        <input
          value={draft}
          onChange={event => setDraft(event.target.value)}
          placeholder="输入消息"
          aria-label="消息内容"
          disabled={sending}
        />
        <button
          className="send-button"
          type="submit"
          disabled={sending || !draft.trim()}
          aria-label="发送消息"
          title="发送消息"
        >
          <Send size={19} />
        </button>
      </form>
    </main>
  );
}

/** 单条消息按 direction 和 status 呈现。 */
function MessageBubble({ message }: { readonly message: Message }) {
  // text 从共享 mapper 保存的 structured body 中读取。
  const text = readMessageText(message.payload);
  return (
    <article className={`message-row message-row-${message.direction}`}>
      <div className={`message-bubble message-bubble-${message.direction}`}>
        <p>{text}</p>
        <footer>
          <time>{formatMessageTime(message.sendTime)}</time>
          {message.status === 'sending' ? <span>发送中</span> : null}
          {message.status === 'failed' ? <span className="message-failed">发送失败</span> : null}
        </footer>
      </div>
    </article>
  );
}

/** 从 Gateway text body 读取文本，未知消息显示类型占位。 */
function readMessageText(payload: unknown): string {
  if (!payload || typeof payload !== 'object') {
    return '[暂不支持的消息]';
  }
  // body 兼容 `{ text: { text } }` 与旧 `{ textElem }`。
  const body = payload as Record<string, unknown>;
  if (body.text && typeof body.text === 'object') {
    // textBody 只读取 string 文本字段。
    const textBody = body.text as Record<string, unknown>;
    if (typeof textBody.text === 'string') {
      return textBody.text;
    }
  }
  return '[暂不支持的消息]';
}

/** 使用用户当前 locale 呈现短消息时间。 */
function formatMessageTime(timestamp: number): string {
  if (!timestamp) {
    return '';
  }
  return new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  }).format(timestamp);
}

/** 将消息异常转换为不包含敏感数据的文本。 */
function readErrorMessage(cause: unknown): string {
  return cause instanceof Error && cause.message ? cause.message : '消息操作失败';
}
