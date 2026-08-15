import { useState } from 'react';
import type { WebIMGroupMember, WebIMSync } from '@im28/im-sdk/web';
import { Link } from 'react-router-dom';

import arrowIconURL from '../../assets/rn/assets/icons/imm28/nav-arrow-right.regular.svg';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';
import { getSelfGroupNickname } from './chat-settings-view.js';
import type { ChatSettingsView } from './chat-settings-view.js';
import './chat-self-nickname-sheet.css';

/** 群资料设置卡只接收 shared facade、快照和页面反馈回调。 */
interface ChatGroupProfileSettingsCardProps {
  readonly view: ChatSettingsView;
  readonly currentUserID: string;
  readonly members: readonly WebIMGroupMember[];
  readonly sync: WebIMSync['groupMembers'];
  readonly onUpdated: (member: WebIMGroupMember) => void;
  readonly onError: (cause: unknown) => void;
  readonly onNotice: (message: string) => void;
  readonly onShareCard: () => void;
}

/** 呈现 RN 同顺序的本人昵称与群简介，并持有昵称编辑交互。 */
export function ChatGroupProfileSettingsCard({
  view,
  currentUserID,
  members,
  sync,
  onUpdated,
  onError,
  onNotice,
  onShareCard,
}: ChatGroupProfileSettingsCardProps) {
  // sheetOpen 控制 RN 同语义的当前成员昵称编辑层。
  const [sheetOpen, setSheetOpen] = useState(false);
  // draft 保留用户尚未提交的 24 字群昵称。
  const [draft, setDraft] = useState('');
  // saving 阻止重复提交真实群昵称 mutation。
  const [saving, setSaving] = useState(false);
  // selfNickname 只从 shared 成员快照和统一 resolver 读取。
  const selfNickname = getSelfGroupNickname(members, currentUserID);
  // introductionURL 使用当前真实会话 ID 构造可深链子页。
  const introductionURL =
    `/conversations/${encodeURIComponent(view.conversationID)}/settings/introduction`;

  /** 打开编辑层时从当前成员快照初始化草稿。 */
  function openSheet(): void {
    setDraft(selfNickname);
    setSheetOpen(true);
  }

  /** 显式保存后委托 shared SDK，并只转交成功 DTO。 */
  async function saveNickname(): Promise<void> {
    if (saving) return;
    /** nickname 对齐 RN 的 trim 和非空规则。 */
    const nickname = draft.trim();
    if (!nickname) {
      onError(new Error('我在本群的昵称不能为空'));
      return;
    }
    setSaving(true);
    try {
      /** updated 已经过 Gateway 成功和 SQLite 写回边界。 */
      const updated = await sync.updateSelfNickname(view.targetID, nickname);
      onUpdated(updated);
      setSheetOpen(false);
      onNotice('群昵称已保存');
    } catch (cause) {
      onError(cause);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="rn-chat-settings-card">
        <button className="rn-chat-settings-row rn-chat-settings-button-row" type="button" onClick={openSheet}>
          <span>我在本群的昵称</span>
          <span className="rn-chat-settings-row-trailing">
            <span>{selfNickname}</span>
            <RNAssetIcon assetURL={arrowIconURL} />
          </span>
        </button>
        <Link className="rn-chat-settings-row rn-chat-settings-stacked-row" to={introductionURL} aria-label="查看群简介">
          <span className="rn-chat-settings-row-copy">
            <strong>群简介</strong>
            <small>{view.introduction || '请输入群的内容介绍'}</small>
          </span>
          <RNAssetIcon assetURL={arrowIconURL} />
        </Link>
        <button className="rn-chat-settings-row rn-chat-settings-button-row" type="button" aria-label="分享群名片" onClick={onShareCard}>
          <span>分享群名片</span>
          <RNAssetIcon assetURL={arrowIconURL} />
        </button>
      </div>
      {sheetOpen ? (
        <ChatSelfNicknameSheet
          value={draft}
          saving={saving}
          onChange={setDraft}
          onCancel={() => { if (!saving) setSheetOpen(false); }}
          onConfirm={() => { void saveNickname(); }}
        />
      ) : null}
    </>
  );
}

/** 群昵称编辑层复刻 RN ConfirmModal 的标题、输入和双操作。 */
function ChatSelfNicknameSheet({
  value,
  saving,
  onChange,
  onCancel,
  onConfirm,
}: {
  readonly value: string;
  readonly saving: boolean;
  readonly onChange: (value: string) => void;
  readonly onCancel: () => void;
  readonly onConfirm: () => void;
}) {
  return (
    <div className="rn-chat-nickname-backdrop" role="presentation" onPointerDown={event => {
      if (!saving && event.target === event.currentTarget) onCancel();
    }}>
      <section className="rn-chat-nickname-sheet" role="dialog" aria-modal="true" aria-labelledby="chat-nickname-title">
        <h2 id="chat-nickname-title">我在本群的昵称</h2>
        <input aria-label="我在本群的昵称输入框" value={value} maxLength={24} autoCapitalize="none" autoCorrect="off" placeholder="请输入群昵称" disabled={saving} onChange={event => onChange(event.target.value)} />
        <div>
          <button type="button" disabled={saving} onClick={onCancel}>取消</button>
          <button type="button" disabled={saving} onClick={onConfirm}>{saving ? '保存中' : '保存'}</button>
        </div>
      </section>
    </div>
  );
}
