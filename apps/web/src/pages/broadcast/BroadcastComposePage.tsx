import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type {
  WebIMContact,
  WebIMJoinedGroup,
} from '@im28/im-sdk/web';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';

import closeIconURL from '../../assets/rn/assets/icons/imm28/xmark.dynamic.svg';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';
import { useWebIMRuntime } from '../../runtime/index.js';
import { validateChatAlbumSelection, validateChatFile } from '../chat/chat-attachment-selection.js';
import { readChatVideoMetadata } from '../chat/chat-video-metadata.js';
import { ChatVoiceInput } from '../chat/ChatVoiceInput.js';
import { useChatVoiceRecorder } from '../chat/useChatVoiceRecorder.js';
import { BroadcastMediaActions } from './BroadcastMediaActions.js';
import { BroadcastSentCardView, type BroadcastSentCard } from './BroadcastSentCard.js';
import { readBroadcastRouteState } from './broadcast-route.js';
import {
  resolveBroadcastDisplayTargets,
  type BroadcastDisplayTarget,
} from './broadcast-target-view.js';
import './broadcast-page.css';

/** 群发 compose 页只调用 shared messageBroadcast facade。 */
export function BroadcastComposePage() {
  /** navigate 管理退出和重新选择两个 SPA 动作。 */
  const navigate = useNavigate();
  /** location.state 只允许稳定目标身份。 */
  const location = useLocation();
  /** routeState 缺失时必须返回选择页，不能构造默认目标。 */
  const routeState = useMemo(() => readBroadcastRouteState(location.state), [location.state]);
  /** runtime 提供当前账号和 shared facade。 */
  const { runtime, snapshot, restoring, startupError } = useWebIMRuntime();
  /** sync 只在 runtime 完成配置后存在。 */
  const sync = useMemo(() => runtime?.getSync() ?? null, [runtime]);
  /** contacts 仅用于恢复目标展示。 */
  const [contacts, setContacts] = useState<readonly WebIMContact[]>([]);
  /** groups 仅用于恢复目标展示。 */
  const [groups, setGroups] = useState<readonly WebIMJoinedGroup[]>([]);
  /** draft 保存当前文本输入，不进入 Router。 */
  const [draft, setDraft] = useState('');
  /** cards 展示本页面真实完成的批次结果。 */
  const [cards, setCards] = useState<readonly BroadcastSentCard[]>([]);
  /** previewURLs 统一回收本地图片和视频 object URL。 */
  const previewURLs = useRef(new Set<string>());
  /** sending 阻止重复提交同一草稿。 */
  const [sending, setSending] = useState(false);
  /** error 显示顶层 Gateway 或恢复失败。 */
  const [error, setError] = useState<string | null>(null);
  /** voiceMode 在文本编辑和 RN 按住说话输入之间切换。 */
  const [voiceMode, setVoiceMode] = useState(false);

  /** sendAudio 将现有 recorder 产物交给 shared 群发 facade。 */
  const sendAudio = useCallback(async (file: File, durationSeconds: number): Promise<void> => {
    if (!sync || !routeState) throw new Error('群发运行时不可用');
    await sendMediaOperation(
      sending,
      setSending,
      setError,
      () => sync.messageBroadcast.sendAudio({ targets: routeState.targets, source: file, name: file.name, mimeType: file.type, size: file.size, durationSeconds }),
      result => ({ id: result.batchID, kind: 'audio', durationSeconds, result }),
      setCards,
    );
  }, [routeState, sending, sync]);
  /** voiceRecorder 复用聊天页唯一 MediaRecorder 生命周期 owner。 */
  const voiceRecorder = useChatVoiceRecorder({ disabled: sending || !sync, onSend: sendAudio, onError: setError });

  /** loadTargets 通过 facade 恢复真实昵称和头像，冷缓存仍可显示 ID。 */
  const loadTargets = useCallback(async (): Promise<void> => {
    if (!sync || !snapshot.userID || !routeState) return;
    try {
      /** cachedResults 优先恢复已有资料。 */
      const cachedResults = await Promise.allSettled([sync.contacts.listCached(), sync.groups.listCached()]);
      if (cachedResults[0].status === 'fulfilled') setContacts(cachedResults[0].value);
      if (cachedResults[1].status === 'fulfilled') setGroups(cachedResults[1].value);
      /** refreshedResults 不改变 route 中稳定选择身份。 */
      const [refreshedContacts, refreshedGroups] = await Promise.all([
        sync.contacts.list({ pageSize: 100 }),
        sync.groups.sync({ pageSize: 50 }),
      ]);
      setContacts(refreshedContacts);
      setGroups(refreshedGroups);
    } catch (cause) {
      setError(readBroadcastComposeError(cause, '群发目标资料刷新失败'));
    }
  }, [routeState, snapshot.userID, sync]);

  useEffect(() => { void loadTargets(); }, [loadTargets]);
  useEffect(() => () => {
    previewURLs.current.forEach(url => URL.revokeObjectURL(url));
    previewURLs.current.clear();
  }, []);

  /** targets 按选择顺序恢复页面展示。 */
  const targets = useMemo(
    () => routeState ? resolveBroadcastDisplayTargets(routeState.targets, contacts, groups) : [],
    [contacts, groups, routeState],
  );

  /** returnToSelect 携带同一稳定身份返回选择页。 */
  function returnToSelect(): void {
    if (!routeState) return;
    navigate('/broadcast/select', { state: routeState, replace: true });
  }

  /** sendText 调用一次 shared batch-send 并呈现逐目标真实结果。 */
  async function sendText(): Promise<void> {
    if (!sync || !routeState || !draft.trim() || sending) return;
    /** text 固定用户点击时的草稿，后续输入不影响本批次。 */
    const text = draft.trim();
    setSending(true);
    setError(null);
    try {
      /** result 顶层和逐目标状态都来自 shared owner。 */
      const result = await sync.messageBroadcast.sendText({
        targets: routeState.targets,
        text,
      });
      setCards(current => [...current, { id: result.batchID, kind: 'text', text, result }]);
      setDraft('');
    } catch (cause) {
      setError(readBroadcastComposeError(cause, '群发失败，请稍后重试'));
    } finally {
      setSending(false);
    }
  }

  /** sendImage 校验浏览器图片并调用共享单次上传群发能力。 */
  async function sendImage(file: File): Promise<void> {
    /** item 复用聊天相册的 MIME 与 10 MB 约束。 */
    const item = validateChatAlbumSelection([file])[0];
    if (!item || item.kind !== 'image' || !sync || !routeState) throw new Error('请选择支持的图片');
    await sendMedia(async () => sync.messageBroadcast.sendImage({ targets: routeState.targets, source: file, name: file.name, mimeType: file.type, size: file.size }), result => {
      /** previewURL 仅用于当前页面预览，不进入 SDK 或 SQLite。 */
      const previewURL = URL.createObjectURL(file);
      previewURLs.current.add(previewURL);
      return { id: result.batchID, kind: 'image', name: file.name, previewURL, result };
    });
  }

  /** sendVideo 先读取真实浏览器媒体元数据，再进入共享上传链。 */
  async function sendVideo(file: File): Promise<void> {
    /** item 复用聊天相册的视频 MIME 与 500 MB 约束。 */
    const item = validateChatAlbumSelection([file])[0];
    if (!item || item.kind !== 'video' || !sync || !routeState) throw new Error('请选择支持的视频');
    /** metadata 来自浏览器标准 video decoder。 */
    const metadata = await readChatVideoMetadata(file);
    await sendMedia(async () => sync.messageBroadcast.sendVideo({ targets: routeState.targets, source: file, name: file.name, mimeType: file.type, size: file.size, ...metadata }), result => {
      /** previewURL 只在发送得到结果后创建并登记回收。 */
      const previewURL = URL.createObjectURL(file);
      previewURLs.current.add(previewURL);
      return { id: result.batchID, kind: 'video', name: file.name, previewURL, result };
    });
  }

  /** sendFile 复用聊天文件 100 MB 约束和共享群发 facade。 */
  async function sendFile(file: File): Promise<void> {
    /** selected 保留浏览器原始 File 身份和精确字节数。 */
    const selected = validateChatFile(file);
    if (!sync || !routeState) throw new Error('群发运行时不可用');
    await sendMedia(
      () => sync.messageBroadcast.sendFile({ targets: routeState.targets, source: selected, name: selected.name, mimeType: selected.type || 'application/octet-stream', size: selected.size }),
      result => ({ id: result.batchID, kind: 'file', name: selected.name, size: selected.size, result }),
    );
  }

  /** sendMedia 统一媒体 sending、错误和结果卡片状态。 */
  async function sendMedia(
    operation: () => ReturnType<NonNullable<typeof sync>['messageBroadcast']['sendImage']>,
    createCard: (result: Awaited<ReturnType<typeof operation>>) => BroadcastSentCard,
  ): Promise<void> {
    return sendMediaOperation(sending, setSending, setError, operation, createCard, setCards);
  }

  if (restoring) return <BroadcastComposeState label="正在恢复会话" />;
  if (!runtime) return <BroadcastComposeState label="运行配置不可用" detail={startupError} />;
  if (!snapshot.userID) return <Navigate to="/login" replace />;
  if (!routeState) return <Navigate to="/broadcast/select" replace />;

  return (
    <main className="rn-broadcast-page rn-broadcast-compose-page" aria-busy={sending}>
      <section className="rn-broadcast-surface">
        <header className="rn-broadcast-compose-header">
          <button type="button" aria-label="退出群发消息" onClick={() => navigate(routeState.backHref)}><RNAssetIcon assetURL={closeIconURL} /><span>退出</span></button>
          <button type="button" className="rn-broadcast-target-stack" aria-label="重新选择消息目标" onClick={returnToSelect}>
            <BroadcastTargetStack targets={targets} />
          </button>
        </header>
        <section className="rn-broadcast-cards" aria-label="群发消息区域">
          {cards.map(card => <BroadcastSentCardView key={card.id} card={card} />)}
          {!cards.length ? <p className="rn-broadcast-compose-empty">向已选 {routeState.targets.length} 个目标发送消息</p> : null}
        </section>
        {error ? <p className="rn-broadcast-compose-error" role="alert">{error}</p> : null}
        <footer className="rn-broadcast-composer">
          <BroadcastMediaActions disabled={sending} onSelectImage={sendImage} onSelectVideo={sendVideo} onSelectFile={sendFile} onError={setError} />
          <div className="rn-broadcast-text-composer">
            <ChatVoiceInput voiceMode={voiceMode} disabled={sending} status={voiceRecorder.status} seconds={voiceRecorder.seconds} onToggleMode={() => setVoiceMode(current => !current)} onStart={voiceRecorder.start} onSend={voiceRecorder.send} onCancel={voiceRecorder.cancel}>
              <textarea value={draft} aria-label="群发消息输入框" placeholder="发送消息..." rows={1} onChange={event => setDraft(event.target.value)} />
            </ChatVoiceInput>
            {!voiceMode ? <button type="button" disabled={!draft.trim() || sending} onClick={() => { void sendText(); }}>{sending ? '发送中' : '发送'}</button> : null}
          </div>
        </footer>
      </section>
    </main>
  );
}

/** compose header 用最多三个真实目标头像提示当前批次。 */
function BroadcastTargetStack({ targets }: { readonly targets: readonly BroadcastDisplayTarget[] }) {
  /** shown 限制 header 宽度，剩余数量用计数表示。 */
  const shown = targets.slice(0, 3);
  /** extra 是未直接展示头像的目标数。 */
  const extra = targets.length - shown.length;
  return (
    <span className="rn-broadcast-stack">
      {shown.map(target => <span key={target.key} className="rn-broadcast-stack-avatar">{target.avatarURL ? <img src={target.avatarURL} alt="" /> : <span>{target.title.slice(0, 1)}</span>}</span>)}
      {extra > 0 ? <span className="rn-broadcast-stack-extra">+{extra}</span> : null}
    </span>
  );
}

/** 群发 compose 启动状态参数。 */
interface BroadcastComposeStateProps {
  readonly label: string;
  readonly detail?: string | null;
}

/** 统一承载 compose runtime 恢复和配置失败。 */
function BroadcastComposeState({ label, detail }: BroadcastComposeStateProps) {
  return <main className="rn-broadcast-state"><strong>{label}</strong>{detail ? <span>{detail}</span> : null}</main>;
}

/** 将未知异常转换为不含凭据的 compose 文案。 */
function readBroadcastComposeError(cause: unknown, fallback: string): string {
  return cause instanceof Error && cause.message ? cause.message : fallback;
}

/** 在页面外统一媒体 sending、异常和结果卡片状态，供录音 callback 稳定复用。 */
async function sendMediaOperation(
  sending: boolean,
  setSending: (value: boolean) => void,
  setError: (value: string | null) => void,
  operation: () => Promise<BroadcastSentCard['result']>,
  createCard: (result: BroadcastSentCard['result']) => BroadcastSentCard,
  setCards: (updater: (current: readonly BroadcastSentCard[]) => readonly BroadcastSentCard[]) => void,
): Promise<void> {
  if (sending) return;
  setSending(true);
  setError(null);
  try {
    /** result 保存 Gateway 的逐目标事实。 */
    const result = await operation();
    setCards(current => [...current, createCard(result)]);
  } catch (cause) {
    setError(readBroadcastComposeError(cause, '附件群发失败，请稍后重试'));
    throw cause;
  } finally {
    setSending(false);
  }
}

export default BroadcastComposePage;
