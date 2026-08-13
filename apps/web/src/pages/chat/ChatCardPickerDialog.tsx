import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import type { Conversation, IMMessageCard, WebIMSync } from '@im28/im-sdk/web';

import clearIconURL from '../../assets/rn/assets/icons/imm28/xmark-circle.solid.svg';
import searchIconURL from '../../assets/rn/assets/icons/imm28/search.regular.svg';
import checkIconURL from '../../assets/rn/assets/icons/imm28/check-circle.solid.svg';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';
import { InteractionModal } from '../../components/interaction/index.js';
import { getRNAvatarGradient, getRNAvatarInitial } from '../../components/rn-avatar-view.js';
import {
  loadChatForwardTargets,
  readChatForwardTargets,
  type ChatForwardTargetSource,
} from './forward-target-source.js';
import {
  filterChatForwardTargets,
  type ChatForwardTarget,
} from './forward-target-view.js';
import '../contacts/contact-card-share.css';
import './chat-card-picker.css';

/** 名片选择器只在用户和群聊两类真实缓存之间切换。 */
type ChatCardPickerTab = 'friend' | 'group';

/** 名片弹层接收聊天页的唯一 sync owner 和发送回执。 */
interface ChatCardPickerDialogProps {
  readonly visible: boolean;
  readonly sync: WebIMSync | null;
  readonly conversation: Conversation | null;
  readonly currentUserID: string;
  readonly sending: boolean;
  readonly operationError: string | null;
  readonly onClose: () => void;
  readonly onSend: (card: IMMessageCard) => Promise<boolean>;
}

/** 对齐 RN 名片选择器的用户、群聊、搜索、单选和显式发送流程。 */
export function ChatCardPickerDialog({
  visible,
  sync,
  conversation,
  currentUserID,
  sending,
  operationError,
  onClose,
  onSend,
}: ChatCardPickerDialogProps) {
  /** source 保存当前认证账号的好友和群 cache-first 快照。 */
  const [source, setSource] = useState<ChatForwardTargetSource>({ recent: [], contacts: [], groups: [] });
  /** activeTab 保持 RN 用户、群聊顺序。 */
  const [activeTab, setActiveTab] = useState<ChatCardPickerTab>('friend');
  /** keyword 只在当前 tab 执行本地筛选。 */
  const [keyword, setKeyword] = useState('');
  /** selectedKey 只保存当前快照内目标的稳定键。 */
  const [selectedKey, setSelectedKey] = useState('');
  /** loading 标识 cache-first 后的刷新轮次。 */
  const [loading, setLoading] = useState(false);
  /** error 只显示真实读取失败，不制造空列表成功态。 */
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible || !sync || !currentUserID) return;
    /** active 阻止弹层关闭后的异步状态回写。 */
    let active = true;
    setActiveTab('friend');
    setKeyword('');
    setSelectedKey('');
    setSource({ recent: [], contacts: [], groups: [] });
    setError(null);
    setLoading(true);
    void loadChatForwardTargets({
      sync,
      includeRecent: false,
      onCached: cached => { if (active) setSource(cached); },
    }).then(refreshed => {
      if (active) setSource(refreshed);
    }).catch(cause => {
      if (active) setError(readCardPickerError(cause));
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [currentUserID, sync, visible]);

  /** targets 沿用共享目标投影并按 RN 规则排除本人和单聊对端。 */
  const targets = useMemo(() => readChatForwardTargets(source, activeTab)
    .filter(target => target.id !== currentUserID)
    .filter(target => !(
      activeTab === 'friend' &&
      conversation?.type === 'single' &&
      target.id === conversation.targetID
    )), [activeTab, conversation, currentUserID, source]);
  /** visibleTargets 保持 facade 原始顺序并应用当前关键字。 */
  const visibleTargets = useMemo(
    () => filterChatForwardTargets(targets, keyword),
    [keyword, targets],
  );
  /** selectedTarget 只从当前真实快照解析，切 tab 后不会沿用旧选择。 */
  const selectedTarget = useMemo(
    () => targets.find(target => target.key === selectedKey) ?? null,
    [selectedKey, targets],
  );

  /** 用户显式确认后构造平台中立名片，成功时才关闭弹层。 */
  async function sendSelectedCard(): Promise<void> {
    if (!selectedTarget || sending) return;
    /** card 只包含 SDK contract 允许的稳定身份和展示快照。 */
    const card = toIMMessageCard(selectedTarget);
    if (await onSend(card)) onClose();
  }

  return (
    <InteractionModal open={visible} ariaLabel="选择名片" className="rn-chat-card-picker-modal" onRequestClose={() => { if (!sending) onClose(); }}>
      <section className="im-modal-sheet rn-chat-card-picker-sheet" aria-busy={loading || sending}>
        <header><button type="button" disabled={sending} onClick={onClose}>关闭</button><h2>选择名片</h2><span /></header>
        <label className="rn-contact-card-share-search">
          <RNAssetIcon assetURL={searchIconURL} /><span className="sr-only">搜索名片</span>
          <input type="search" value={keyword} placeholder="搜索" onChange={event => setKeyword(event.target.value)} />
          {keyword ? <button type="button" aria-label="清除搜索" onClick={() => setKeyword('')}><RNAssetIcon assetURL={clearIconURL} /></button> : null}
        </label>
        <nav aria-label="名片类型">
          <button type="button" className={activeTab === 'friend' ? 'is-active' : ''} onClick={() => { setActiveTab('friend'); setSelectedKey(''); }}>用户</button>
          <button type="button" className={activeTab === 'group' ? 'is-active' : ''} onClick={() => { setActiveTab('group'); setSelectedKey(''); }}>群聊</button>
        </nav>
        {error || operationError ? <p className="rn-contact-card-share-error" role="alert">{error || operationError}</p> : null}
        <section className="rn-contact-card-share-grid" aria-label="选择名片对象">
          {visibleTargets.map(target => <ChatCardTarget key={target.key} target={target} selected={selectedKey === target.key} disabled={sending} onSelect={() => setSelectedKey(selectedKey === target.key ? '' : target.key)} />)}
          {loading && targets.length === 0 ? <p>{activeTab === 'group' ? '正在加载群聊' : '正在加载好友'}</p> : null}
          {!loading && visibleTargets.length === 0 ? <p>{keyword.trim() ? '未找到相关名片' : `暂无${activeTab === 'group' ? '群聊' : '好友'}`}</p> : null}
        </section>
        <footer className="rn-contact-card-share-footer"><button type="button" disabled={!selectedTarget || sending} onClick={() => void sendSelectedCard()}>{sending ? '正在发送' : '发送'}</button></footer>
      </section>
    </InteractionModal>
  );
}

/** 名片网格项复用 RN 圆形头像和单选编号样式。 */
function ChatCardTarget({ target, selected, disabled, onSelect }: { readonly target: ChatForwardTarget; readonly selected: boolean; readonly disabled: boolean; readonly onSelect: () => void }) {
  /** avatarStyle 使用稳定目标 ID 生成 RN fallback 渐变。 */
  const avatarStyle = { '--contact-card-target-gradient': getRNAvatarGradient(target.id) } as CSSProperties;
  return <button type="button" className={selected ? 'is-selected' : undefined} aria-pressed={selected} disabled={disabled} onClick={onSelect}><span className="rn-contact-card-share-avatar" style={avatarStyle}><span>{getRNAvatarInitial(target.title)}</span>{target.avatarURL ? <img src={target.avatarURL} alt="" onError={event => { event.currentTarget.hidden = true; }} /> : null}{selected ? <span className="rn-contact-card-share-check"><RNAssetIcon assetURL={checkIconURL} /></span> : null}</span><strong>{target.title}</strong></button>;
}

/** 将好友或群目标映射为 SDK 平台中立 type108 contract。 */
export function toIMMessageCard(target: ChatForwardTarget): IMMessageCard {
  if (target.kind === 'friend') {
    return { type: 'user', userID: target.id, nickname: target.title, avatarURL: target.avatarURL };
  }
  if (target.kind === 'group') {
    return { type: 'group', groupID: target.id, groupName: target.title, avatarURL: target.avatarURL };
  }
  throw new Error('名片目标类型不可用');
}

/** 将未知读取异常转换为不泄露本地数据的页面文案。 */
function readCardPickerError(cause: unknown): string {
  return cause instanceof Error && cause.message ? cause.message : '名片列表加载失败';
}
