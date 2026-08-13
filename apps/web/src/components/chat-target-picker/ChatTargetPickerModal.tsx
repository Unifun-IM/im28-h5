import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import type { WebIMSync } from '@im28/im-sdk/web';

import clearIconURL from '../../assets/rn/assets/icons/imm28/xmark-circle.solid.svg';
import closeIconURL from '../../assets/rn/assets/icons/imm28/xmark.regular.svg';
import searchIconURL from '../../assets/rn/assets/icons/imm28/search.regular.svg';
import { InteractionModal } from '../interaction/index.js';
import { RNAssetIcon } from '../RNAssetIcon.js';
import { getRNAvatarGradient, getRNAvatarInitial } from '../rn-avatar-view.js';
import {
  loadChatForwardTargets,
  readChatForwardTargets,
  type ChatForwardTargetSource,
} from '../../pages/chat/forward-target-source.js';
import {
  toggleAllVisibleChatTargets,
  toggleChatTargetSelection,
  type ChatTargetPickerItem,
  type ChatTargetPickerSelectionMode,
} from './chat-target-picker-selection.js';
import './chat-target-picker.css';

/** 通用好友/群聊选择弹窗参数不持有具体业务 mutation。 */
export interface ChatTargetPickerModalProps {
  readonly open: boolean;
  readonly sync: WebIMSync | null;
  readonly selectionMode?: ChatTargetPickerSelectionMode;
  readonly allowedKinds?: readonly ('friend' | 'group')[];
  readonly excludeUserIDs?: readonly string[];
  readonly maxSelected?: number;
  readonly initialSelectedKeys?: readonly string[];
  readonly actionLabel: string;
  readonly pending?: boolean;
  readonly confirmDisabled?: boolean;
  readonly operationError?: string | null;
  readonly onClose: () => void;
  readonly onConfirm: (targets: readonly ChatTargetPickerItem[]) => void;
}

/** 好友和群聊 tab 使用稳定展示顺序。 */
const TARGET_TABS = [
  { kind: 'friend' as const, label: '好友' },
  { kind: 'group' as const, label: '群聊' },
];

/** 以二维码分享样式统一所有聊天目标选择交互。 */
export function ChatTargetPickerModal({
  open,
  sync,
  selectionMode = 'single',
  allowedKinds = ['friend', 'group'],
  excludeUserIDs = [],
  maxSelected = 50,
  initialSelectedKeys = [],
  actionLabel,
  pending = false,
  confirmDisabled = false,
  operationError = null,
  onClose,
  onConfirm,
}: ChatTargetPickerModalProps) {
  /** firstKind 保证受限为好友时不出现空群聊首屏。 */
  const firstKind = allowedKinds[0] ?? 'friend';
  /** activeKind 只决定当前列表投影。 */
  const [activeKind, setActiveKind] = useState<'friend' | 'group'>(firstKind);
  /** keyword 只在浏览器本地筛选当前标签。 */
  const [keyword, setKeyword] = useState('');
  /** source 保存 cache-first 后的 shared facade 快照。 */
  const [source, setSource] = useState<ChatForwardTargetSource>({ recent: [], contacts: [], groups: [] });
  /** selected 按首次选择顺序保留跨标签目标。 */
  const [selected, setSelected] = useState<ReadonlyMap<string, ChatTargetPickerItem>>(new Map());
  /** loading 只表示当前弹窗目标加载轮次。 */
  const [loading, setLoading] = useState(false);
  /** loadError 呈现真实缓存或 Gateway 读取失败。 */
  const [loadError, setLoadError] = useState<string | null>(null);
  /** initializedRef 防止 cache 与 remote 两次回写覆盖用户当前选择。 */
  const initializedRef = useRef(false);

  /** 每次打开重置瞬时选择并执行统一 cache-first 加载。 */
  const loadTargets = useCallback(async (): Promise<void> => {
    if (!open || !sync) return;
    setLoading(true);
    setLoadError(null);
    try {
      setSource(await loadChatForwardTargets({ sync, includeRecent: false, onCached: setSource }));
    } catch (cause) {
      setLoadError(cause instanceof Error && cause.message ? cause.message : '加载分享对象失败');
    } finally {
      setLoading(false);
    }
  }, [open, sync]);

  useEffect(() => {
    if (!open) return;
    setActiveKind(firstKind);
    setKeyword('');
    setSelected(new Map());
    initializedRef.current = false;
    void loadTargets();
  }, [firstKind, loadTargets, open]);

  /** excludedIDs 对排除本人或名片主人执行稳定集合查询。 */
  const excludedIDs = useMemo(() => new Set(excludeUserIDs), [excludeUserIDs]);
  /** targets 将页面旧 target DTO 统一投影为弹窗中性字段。 */
  const targets = useMemo<readonly ChatTargetPickerItem[]>(() =>
    readChatForwardTargets(source, activeKind)
      .filter(target => !excludedIDs.has(target.id))
      .map(target => ({
        key: target.key,
        kind: target.kind === 'group' ? 'group' : 'friend',
        id: target.id,
        title: target.title,
        description: target.description,
        avatarURL: target.avatarURL,
      })), [activeKind, excludedIDs, source]);
  /** allTargets 为跨标签初始选择恢复提供完整目标快照。 */
  const allTargets = useMemo<readonly ChatTargetPickerItem[]>(() =>
    allowedKinds.flatMap(kind => readChatForwardTargets(source, kind)
      .filter(target => !excludedIDs.has(target.id))
      .map(target => ({
        key: target.key,
        kind,
        id: target.id,
        title: target.title,
        description: target.description,
        avatarURL: target.avatarURL,
      }))), [allowedKinds, excludedIDs, source]);
  useEffect(() => {
    if (!open || initializedRef.current || !allTargets.length) return;
    /** initialKeys 只接受当前真实 facade 快照内存在的目标。 */
    const initialKeys = new Set(initialSelectedKeys);
    setSelected(new Map(allTargets
      .filter(target => initialKeys.has(target.key))
      .slice(0, selectionMode === 'single' ? 1 : maxSelected)
      .map(target => [target.key, target])));
    initializedRef.current = true;
  }, [allTargets, initialSelectedKeys, maxSelected, open, selectionMode]);
  /** visibleTargets 复用稳定名称和 ID 搜索规则。 */
  const visibleTargets = useMemo(() => filterChatTargetPickerItems(targets, keyword), [keyword, targets]);
  /** selectedTargets 保持跨标签首次选择顺序。 */
  const selectedTargets = useMemo(() => [...selected.values()], [selected]);
  /** allSelected 只反映当前过滤结果。 */
  const allSelected = visibleTargets.length > 0 && visibleTargets.every(target => selected.has(target.key));
  /** visibleTabs 只显示当前业务允许的目标类型。 */
  const visibleTabs = TARGET_TABS.filter(tab => allowedKinds.includes(tab.kind));

  /** 关闭前阻止正在提交的真实 mutation 被重复触发。 */
  function requestClose(): void {
    if (!pending) onClose();
  }

  /** 切换单个目标并对超限给出组件内可见反馈。 */
  function toggleTarget(target: ChatTargetPickerItem): void {
    setSelected(current => toggleChatTargetSelection({
      current,
      target,
      mode: selectionMode,
      maxSelected,
    }));
  }

  /** ALL 只在多选模式作用于当前搜索结果。 */
  function toggleAll(): void {
    setSelected(current => toggleAllVisibleChatTargets(current, visibleTargets, maxSelected));
  }

  return (
    <InteractionModal open={open} ariaLabel="选择分享对象" className="rn-chat-target-picker-modal" closeOnBackdrop={false} onRequestClose={requestClose}>
      <section className="rn-chat-target-picker-sheet im-modal-sheet" aria-busy={loading || pending}>
        <header className="rn-chat-target-picker-header">
          <button type="button" aria-label="关闭选择分享对象" disabled={pending} onClick={requestClose}><RNAssetIcon assetURL={closeIconURL} /></button>
          <h2>{`已选中(${selected.size})`}</h2>
          <span aria-hidden="true" />
        </header>
        <label className="rn-chat-target-picker-search">
          <RNAssetIcon assetURL={searchIconURL} />
          <span className="sr-only">搜索好友或群聊</span>
          <input type="search" value={keyword} placeholder="搜索" disabled={pending} onChange={event => setKeyword(event.target.value)} />
          {keyword ? <button type="button" aria-label="清除搜索" disabled={pending} onClick={() => setKeyword('')}><RNAssetIcon assetURL={clearIconURL} /></button> : null}
        </label>
        {visibleTabs.length > 1 ? (
          <nav className="rn-chat-target-picker-tabs" aria-label="分享对象类型">
            {visibleTabs.map(tab => <button key={tab.kind} type="button" className={activeKind === tab.kind ? 'is-active' : ''} disabled={pending} onClick={() => setActiveKind(tab.kind)}>{tab.label}</button>)}
          </nav>
        ) : null}
        {loadError || operationError ? <p className="rn-chat-target-picker-error" role="alert">{operationError || loadError}</p> : null}
        <section className="rn-chat-target-picker-grid" aria-label="可选择的好友和群聊">
          {selectionMode === 'multiple' && visibleTargets.length ? <TargetTile target={null} title="ALL" selected={allSelected} disabled={pending} onToggle={toggleAll} /> : null}
          {visibleTargets.map(target => <TargetTile key={target.key} target={target} title={target.title} selected={selected.has(target.key)} disabled={pending} onToggle={() => toggleTarget(target)} />)}
          {loading && targets.length === 0 ? <p>正在加载</p> : null}
          {!loading && visibleTargets.length === 0 ? <p>{keyword.trim() ? '未找到相关对象' : activeKind === 'group' ? '暂无群聊' : '暂无好友'}</p> : null}
        </section>
        <footer className="rn-chat-target-picker-footer"><button type="button" disabled={!selected.size || pending || confirmDisabled} onClick={() => onConfirm(selectedTargets)}>{pending ? '发送中' : actionLabel}</button></footer>
      </section>
    </InteractionModal>
  );
}

/** 按目标名称、描述和身份筛选中性弹窗条目。 */
function filterChatTargetPickerItems(
  targets: readonly ChatTargetPickerItem[],
  keyword: string,
): readonly ChatTargetPickerItem[] {
  /** query 只影响当前 UI 投影，不改变 shared facade 顺序。 */
  const query = keyword.trim().toLocaleLowerCase();
  if (!query) return targets;
  return targets.filter(target =>
    `${target.title}\n${target.description}\n${target.id}`
      .toLocaleLowerCase()
      .includes(query),
  );
}

/** 五列目标单元格统一头像、选中标记和 ALL 入口。 */
function TargetTile({ target, title, selected, disabled, onToggle }: {
  readonly target: ChatTargetPickerItem | null;
  readonly title: string;
  readonly selected: boolean;
  readonly disabled: boolean;
  readonly onToggle: () => void;
}) {
  /** identity 为真实目标或 ALL 生成稳定头像背景。 */
  const identity = target?.id ?? 'chat-target-all';
  /** avatarStyle 注入既有 RN 头像渐变。 */
  const avatarStyle = { '--chat-target-avatar-gradient': getRNAvatarGradient(identity) } as CSSProperties;
  return <button type="button" className="rn-chat-target-picker-tile" aria-pressed={selected} disabled={disabled} onClick={onToggle}><span className="rn-chat-target-picker-avatar" style={avatarStyle}><span>{target ? getRNAvatarInitial(title) : 'ALL'}</span>{target?.avatarURL ? <img src={target.avatarURL} alt="" onError={event => { event.currentTarget.hidden = true; }} /> : null}{selected ? <em>✓</em> : null}</span><strong>{title}</strong></button>;
}
