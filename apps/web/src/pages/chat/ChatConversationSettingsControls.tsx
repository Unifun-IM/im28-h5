import { useEffect, useState } from 'react';
import type {
  WebIMConversationSetting,
  WebIMConversationSync,
} from '@im28/im-sdk/web';

import './chat-settings-controls.css';

/** 会话设置开关只接收 shared facade 和已有缓存初值。 */
interface ChatConversationSettingsControlsProps {
  readonly conversationID: string;
  readonly sync: WebIMConversationSync;
  readonly initialMuted: boolean;
  readonly initialPinned: boolean;
}

/** 设置操作名称同时约束 pending 状态和 shared caller。 */
type ChatConversationSettingAction = 'mute' | 'pin';

/** RN 设置开关从真实 Gateway setting 恢复并 success-only 更新。 */
export function ChatConversationSettingsControls({
  conversationID,
  sync,
  initialMuted,
  initialPinned,
}: ChatConversationSettingsControlsProps) {
  /** setting 在远端读取前使用当前账号 SQLite 的已知状态。 */
  const [setting, setSetting] = useState<WebIMConversationSetting>(() => ({
    conversationID,
    isMuted: initialMuted,
    isPinned: initialPinned,
    pinnedAt: 0,
  }));
  /** loading 只覆盖 setting detail 读取，不伪装空设置。 */
  const [loading, setLoading] = useState(true);
  /** pending 保证同一时刻只提交一个会话设置 mutation。 */
  const [pending, setPending] = useState<ChatConversationSettingAction | null>(null);
  /** error 保留真实读取或保存失败。 */
  const [error, setError] = useState('');

  useEffect(() => {
    /** active 阻止 route 离开后的异步结果回写。 */
    let active = true;
    setSetting({
      conversationID,
      isMuted: initialMuted,
      isPinned: initialPinned,
      pinnedAt: 0,
    });
    setLoading(true);
    setError('');
    void sync.getSetting(conversationID).then(
      nextSetting => {
        if (active) setSetting(nextSetting);
      },
      cause => {
        if (active) setError(readSettingError(cause, '聊天设置刷新失败'));
      },
    ).finally(() => {
      if (active) setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [conversationID, initialMuted, initialPinned, sync]);

  /** 更新单项设置，只有 shared facade resolve 才替换页面状态。 */
  const updateSetting = async (
    action: ChatConversationSettingAction,
    checked: boolean,
  ) => {
    if (pending) return;
    setPending(action);
    setError('');
    try {
      /** nextSetting 来自 Gateway 成功后的当前账号 SQLite 收敛。 */
      const nextSetting = action === 'mute'
        ? await sync.setMuted(conversationID, checked)
        : await sync.setPinned(conversationID, checked);
      setSetting(current => ({ ...current, ...nextSetting }));
    } catch (cause) {
      setError(readSettingError(cause, '聊天设置保存失败'));
    } finally {
      setPending(null);
    }
  };

  return (
    <section className="rn-chat-settings-card rn-chat-settings-controls" aria-busy={loading || Boolean(pending)}>
      {error ? <p role="status">{error}</p> : null}
      <ChatSettingSwitch
        label="消息免打扰"
        checked={setting.isMuted}
        disabled={Boolean(pending)}
        divided
        onChange={() => void updateSetting('mute', !setting.isMuted)}
      />
      <ChatSettingSwitch
        label="置顶聊天"
        checked={setting.isPinned}
        disabled={Boolean(pending)}
        onChange={() => void updateSetting('pin', !setting.isPinned)}
      />
    </section>
  );
}

/** 单项开关保持 RN 60px 行高和稳定 50x30 控件。 */
function ChatSettingSwitch({
  label,
  checked,
  disabled,
  divided = false,
  onChange,
}: {
  readonly label: string;
  readonly checked: boolean;
  readonly disabled: boolean;
  readonly divided?: boolean;
  readonly onChange: () => void;
}) {
  return (
    <div className={`rn-chat-settings-switch-row${divided ? ' is-divided' : ''}`}>
      <span>{label}</span>
      <button
        type="button"
        role="switch"
        aria-label={label}
        aria-checked={checked}
        disabled={disabled}
        onClick={onChange}
      ><span /></button>
    </div>
  );
}

/** 未知异常映射为稳定中文提示且不泄露 runtime 细节。 */
function readSettingError(cause: unknown, fallback: string): string {
  return cause instanceof Error && cause.message ? cause.message : fallback;
}
