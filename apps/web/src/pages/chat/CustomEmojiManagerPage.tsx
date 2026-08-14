import { Fragment, useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import type { CustomEmoji } from '@im28/im-sdk/web';
import { Link, Navigate, useParams } from 'react-router-dom';

import backIconURL from '../../assets/rn/assets/icons/imm28/nav-arrow-left.regular.svg';
import checkIconURL from '../../assets/rn/assets/icons/imm28/check.regular.svg';
import plusIconURL from '../../assets/rn/assets/icons/imm28/plus.regular.svg';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';
import { PageNavbar } from '../../components/navigation/PageNavbar.js';
import { useAppToast } from '../../components/interaction/index.js';
import { useWebIMRuntime } from '../../runtime/index.js';
import {
  buildCustomEmojiUploadInputs,
  CUSTOM_EMOJI_FILE_ACCEPT,
  CUSTOM_EMOJI_LIBRARY_LIMIT,
  CUSTOM_EMOJI_PICK_LIMIT,
  toggleCustomEmojiSelection,
} from './custom-emoji-manager-view.js';
import {
  applyChatCustomEmojiOrder,
  getChatCustomEmojiMoveTarget,
  reorderChatCustomEmojis,
  saveChatCustomEmojiOrder,
} from './chat-custom-emoji-order.js';
import { CustomEmojiReorderTray } from './CustomEmojiReorderTray.js';
import './custom-emoji-manager-page.css';
import './custom-emoji-reorder.css';

/** 管理页三态与 RN 预览、整理、移动职责一致。 */
type CustomEmojiManagerMode = 'view' | 'organize' | 'move';

/** RN 自定义表情管理页只在明确交互后执行 create/delete mutation。 */
export function CustomEmojiManagerPage() {
  // conversationID 保留管理页返回当前聊天的 SPA 上下文。
  const { conversationID = '' } = useParams();
  // runtime context 提供唯一认证 SDK facade。
  const { runtime, snapshot, restoring, startupError } = useWebIMRuntime();
  // toast 是添加、删除和排序结果的唯一瞬时反馈 owner。
  const { toast } = useAppToast();
  // emojis 始终来自当前账号共享 SQLite 或远端完整列表。
  const [emojis, setEmojis] = useState<readonly CustomEmoji[]>([]);
  // mode 控制 RN 预览、整理和移动三种互斥交互。
  const [mode, setMode] = useState<CustomEmojiManagerMode>('view');
  // selectedIDs 按点击顺序提供编号和删除请求体。
  const [selectedIDs, setSelectedIDs] = useState<readonly string[]>([]);
  // loading 覆盖 cache-first 初始化。
  const [loading, setLoading] = useState(true);
  // mutating 锁定上传与删除重复提交。
  const [mutating, setMutating] = useState(false);
  // loadError 只展示 cache-first 初始化失败，不承载操作结果。
  const [loadError, setLoadError] = useState<string | null>(null);
  // previewURL 控制当前正式远端图片预览。
  const [previewURL, setPreviewURL] = useState('');
  // deleteSheetVisible 要求危险操作二次确认。
  const [deleteSheetVisible, setDeleteSheetVisible] = useState(false);
  // fileInputRef 由 RN 加号格触发浏览器图片选择器。
  const fileInputRef = useRef<HTMLInputElement>(null);
  // gridRef 提供 Pointer 坐标到五列插入索引的唯一几何 owner。
  const gridRef = useRef<HTMLDivElement>(null);
  // moveTargetIndex 是排除选中组后的本地插入位置。
  const [moveTargetIndex, setMoveTargetIndex] = useState<number | null>(null);
  // selectedEmojis 严格按绿色编号顺序生成拖动叠层。
  const selectedEmojis = useMemo(
    () => selectedIDs.flatMap(emojiID => {
      // emoji 只从当前 SDK 成员快照恢复。
      const emoji = emojis.find(item => item.emojiID === emojiID);
      return emoji ? [emoji] : [];
    }),
    [emojis, selectedIDs],
  );
  // visibleEmojis 在移动阶段剔除选中组，为占位腾出位置。
  const visibleEmojis = useMemo(() => {
    if (mode !== 'move') return emojis;
    // selectedSet 避免每个表情反复线性扫描。
    const selectedSet = new Set(selectedIDs);
    return emojis.filter(emoji => !selectedSet.has(emoji.emojiID));
  }, [emojis, mode, selectedIDs]);

  /** 应用并持久化 browser-local stable-ID 顺序。 */
  const commitOrderedSnapshot = useCallback((snapshot: readonly CustomEmoji[]) => {
    // ordered 先应用仍有效的本地 preference，再追加远端新成员。
    const ordered = applyChatCustomEmojiOrder(snapshot);
    saveChatCustomEmojiOrder(ordered.map(emoji => emoji.emojiID));
    setEmojis(ordered);
    return ordered;
  }, []);

  /** 先展示 SQLite，再用完整远端列表收敛。 */
  const loadEmojis = useCallback(async (): Promise<void> => {
    if (!runtime || !snapshot.userID) return;
    // facade 是页面唯一自定义表情数据入口。
    const facade = runtime.getSync().customEmojis;
    setLoading(true);
    setLoadError(null);
    try {
      commitOrderedSnapshot(await facade.listCached());
      commitOrderedSnapshot(await facade.sync());
    } catch (cause) {
      setLoadError(readCustomEmojiManagerError(cause, '自定义表情加载失败'));
    } finally {
      setLoading(false);
    }
  }, [commitOrderedSnapshot, runtime, snapshot.userID]);

  useEffect(() => { void loadEmojis(); }, [loadEmojis]);

  /** 完整校验浏览器选择结果后交给 SDK 上传/create 主链。 */
  async function handleFileSelection(event: ChangeEvent<HTMLInputElement>) {
    // files 立即复制并清空 input，允许失败后重新选择同一批文件。
    const files = Array.from(event.currentTarget.files ?? []);
    event.currentTarget.value = '';
    if (!runtime || mutating || !files.length) return;
    setMutating(true);
    try {
      // inputs 保留 File 为 opaque source，不在页面构造 OSS 请求。
      const inputs = buildCustomEmojiUploadInputs(
        files.map(file => ({
          source: file,
          name: file.name,
          type: file.type,
          size: file.size,
        })),
        emojis.length,
      );
      commitOrderedSnapshot(await runtime.getSync().customEmojis.create(inputs));
      toast.success('添加成功');
    } catch (cause) {
      toast.error(readCustomEmojiManagerError(cause, '添加自定义表情失败'));
    } finally {
      setMutating(false);
    }
  }

  /** 仅在二次确认后调用真实 batch-delete。 */
  async function confirmDelete() {
    if (!runtime || mutating || !selectedIDs.length) return;
    setDeleteSheetVisible(false);
    setMutating(true);
    try {
      commitOrderedSnapshot(await runtime.getSync().customEmojis.delete(selectedIDs));
      setSelectedIDs([]);
      setMode('view');
      toast.success('删除成功');
    } catch (cause) {
      toast.error(readCustomEmojiManagerError(cause, '删除自定义表情失败'));
    } finally {
      setMutating(false);
    }
  }

  /** 把拖动指针映射为剔除选中组后的五列插入位置。 */
  function handleMovePointer(clientX: number, clientY: number) {
    // rect 来自管理页唯一 grid，不依赖 viewport 宽度猜测。
    const rect = gridRef.current?.getBoundingClientRect();
    if (!rect) return;
    setMoveTargetIndex(
      getChatCustomEmojiMoveTarget(clientX, clientY, rect, visibleEmojis.length),
    );
  }

  /** Pointer 释放后只提交 stable-ID preference，不调用 Gateway。 */
  function commitLocalMove() {
    if (moveTargetIndex === null || !selectedEmojis.length) return;
    // reordered 保持未选项相对顺序和选择编号顺序。
    const reordered = reorderChatCustomEmojis(emojis, selectedIDs, moveTargetIndex);
    saveChatCustomEmojiOrder(reordered.map(emoji => emoji.emojiID));
    setEmojis(reordered);
    setSelectedIDs([]);
    setMoveTargetIndex(null);
    setMode('organize');
    toast.success('排序成功');
  }

  if (restoring) return <CustomEmojiManagerState label="正在恢复自定义表情" />;
  if (!runtime) return <CustomEmojiManagerState label="运行配置不可用" detail={startupError} />;
  if (!snapshot.userID) return <Navigate to="/login" replace />;
  // backHref 使用编码后的真实 conversation ID 返回聊天页。
  const backHref = `/conversations/${encodeURIComponent(conversationID)}`;
  // remaining 决定文件选择器本次最大数量提示。
  const remaining = Math.max(0, CUSTOM_EMOJI_LIBRARY_LIMIT - emojis.length);

  return (
    <main className="rn-custom-emoji-manager-page" aria-busy={loading || mutating}>
      <section className="rn-custom-emoji-manager-surface">
        <PageNavbar className="rn-custom-emoji-manager-header">
          <Link to={backHref} aria-label="返回聊天"><RNAssetIcon assetURL={backIconURL} /></Link>
          <h1>我的表情</h1>
          <button type="button" disabled={mutating || !emojis.length || mode === 'move'} onClick={() => { setMode(current => current === 'view' ? 'organize' : 'view'); setSelectedIDs([]); }}>
            {mode === 'view' ? '整理' : '取消'}
          </button>
        </PageNavbar>
        {loadError ? <p className="rn-custom-emoji-manager-feedback is-error" role="status">{loadError}</p> : null}
        <div className="rn-custom-emoji-manager-grid" role="list" aria-label="自定义表情" ref={gridRef}>
          {mode === 'view' ? (
            <button className="rn-custom-emoji-manager-add" type="button" role="listitem" disabled={mutating || !remaining} aria-label="添加自定义表情" onClick={() => fileInputRef.current?.click()}>
              <RNAssetIcon assetURL={plusIconURL} />
            </button>
          ) : null}
          {visibleEmojis.map((emoji, index) => {
            // selectedOrder 与 RN 绿色编号语义一致。
            const selectedOrder = selectedIDs.indexOf(emoji.emojiID) + 1;
            return (
              <Fragment key={emoji.emojiID}>
                {mode === 'move' && moveTargetIndex === index ? <span className="rn-custom-emoji-manager-placeholder" role="presentation" /> : null}
                <button className={`rn-custom-emoji-manager-cell${selectedOrder ? ' is-selected' : ''}`} type="button" role={mode === 'organize' ? 'checkbox' : 'listitem'} aria-label={mode === 'organize' ? '选择自定义表情' : '预览自定义表情'} aria-checked={mode === 'organize' ? Boolean(selectedOrder) : undefined} disabled={mutating || mode === 'move'} onClick={() => mode === 'organize' ? setSelectedIDs(current => toggleCustomEmojiSelection(current, emoji.emojiID)) : setPreviewURL(emoji.url)}>
                  <img src={emoji.url} alt="" draggable="false" />
                  {mode === 'organize' ? <span>{selectedOrder || <RNAssetIcon assetURL={checkIconURL} />}</span> : null}
                </button>
              </Fragment>
            );
          })}
          {mode === 'move' && moveTargetIndex === visibleEmojis.length ? <span className="rn-custom-emoji-manager-placeholder" role="presentation" /> : null}
        </div>
        {!loading && !emojis.length ? <p className="rn-custom-emoji-manager-empty">暂无自定义表情</p> : null}
        {loading ? <p className="rn-custom-emoji-manager-loading">正在同步</p> : null}
        {mode === 'organize' ? (
          <footer className="rn-custom-emoji-manager-footer">
            <button type="button" disabled={!selectedIDs.length || mutating} onClick={() => { setMode('move'); setMoveTargetIndex(null); }}>移动</button>
            <button type="button" disabled={!selectedIDs.length || mutating} onClick={() => setDeleteSheetVisible(true)}>{`删除(${selectedIDs.length})`}</button>
          </footer>
        ) : null}
        <input ref={fileInputRef} hidden type="file" multiple accept={CUSTOM_EMOJI_FILE_ACCEPT} disabled={mutating} aria-label={`选择自定义表情，最多${Math.min(CUSTOM_EMOJI_PICK_LIMIT, remaining)}张`} onChange={event => void handleFileSelection(event)} />
      </section>
      {previewURL ? <div className="rn-custom-emoji-manager-preview" role="dialog" aria-modal="true" aria-label="预览自定义表情" onClick={() => setPreviewURL('')}><img src={previewURL} alt="自定义表情预览" /></div> : null}
      {deleteSheetVisible ? <DeleteCustomEmojiSheet mutating={mutating} onCancel={() => setDeleteSheetVisible(false)} onConfirm={() => void confirmDelete()} /> : null}
      {mode === 'move' ? <CustomEmojiReorderTray emojis={selectedEmojis} onMove={handleMovePointer} onDrop={commitLocalMove} onCancel={() => { setMode('organize'); setMoveTargetIndex(null); }} /> : null}
    </main>
  );
}

/** 删除确认层参数。 */
interface DeleteCustomEmojiSheetProps {
  readonly mutating: boolean;
  readonly onCancel: () => void;
  readonly onConfirm: () => void;
}

/** 复刻 RN 删除不可恢复的底部二次确认层。 */
function DeleteCustomEmojiSheet({ mutating, onCancel, onConfirm }: DeleteCustomEmojiSheetProps) {
  return <div className="rn-custom-emoji-manager-sheet-backdrop" role="presentation" onClick={onCancel}>
    <section className="rn-custom-emoji-manager-sheet" role="alertdialog" aria-modal="true" aria-labelledby="delete-custom-emoji-title" onClick={event => event.stopPropagation()}>
      <p id="delete-custom-emoji-title">删除的表情包无法恢复</p>
      <button className="is-danger" type="button" disabled={mutating} onClick={onConfirm}>删除</button>
      <button type="button" disabled={mutating} onClick={onCancel}>取消</button>
    </section>
  </div>;
}

/** 将 SDK/Gateway 异常转换为不泄漏凭据的文案。 */
function readCustomEmojiManagerError(cause: unknown, fallback: string): string {
  return cause instanceof Error && cause.message ? cause.message : fallback;
}

/** 统一承载管理页启动失败。 */
function CustomEmojiManagerState({ label, detail }: { readonly label: string; readonly detail?: string | null }) {
  return <main className="rn-custom-emoji-manager-state"><strong>{label}</strong>{detail ? <span>{detail}</span> : null}</main>;
}
