import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import { ChatTargetPickerModal, type ChatTargetPickerItem } from '../../components/chat-target-picker/index.js';
import { useAppToast } from '../../components/interaction/index.js';
import { getRNAvatarGradient, getRNAvatarInitial } from '../../components/rn-avatar-view.js';
import { useWebIMRuntime } from '../../runtime/index.js';
import { createBrowserQRCodeShareFile } from '../qr/browser-qr-image.js';

/** 全局分享源只保存发送名片或二维码所需的稳定公开字段。 */
export type ChatShareSource =
  | { readonly kind: 'user-card'; readonly userID: string; readonly displayName: string; readonly avatarURL: string }
  | { readonly kind: 'group-card'; readonly groupID: string; readonly displayName: string; readonly avatarURL: string }
  | { readonly kind: 'qr-code'; readonly qrKind: 'user' | 'group'; readonly identity: string; readonly displayName: string; readonly payload: string };

/** 页面只负责提交分享源，目标选择和真实发送由根级 owner 统一处理。 */
interface ChatShareModalActions {
  readonly openShare: (source: ChatShareSource) => void;
}

/** 空默认值让 Provider 漏装在运行时立即暴露。 */
const ChatShareModalContext = createContext<ChatShareModalActions | null>(null);

/** 全局持有分享对象选择、发送状态和好友/群聊统一目标规则。 */
export function ChatShareModalProvider({ children }: { readonly children: ReactNode }) {
  /** runtime 提供唯一 shared 消息群发 facade。 */
  const { runtime, snapshot } = useWebIMRuntime();
  /** toast 统一承载分享成功反馈。 */
  const { toast } = useAppToast();
  /** source 非空时打开全局目标选择底部弹窗。 */
  const [source, setSource] = useState<ChatShareSource | null>(null);
  /** sharing 阻止重复上传或发送。 */
  const [sharing, setSharing] = useState(false);
  /** error 交给统一 Toast feedback 展示真实失败。 */
  const [error, setError] = useState<string | null>(null);

  /** 打开新分享时清理上一轮瞬时状态。 */
  const openShare = useCallback((nextSource: ChatShareSource): void => {
    setError(null);
    setSource(nextSource);
  }, []);

  /** 未提交时允许关闭全局弹窗。 */
  const closeShare = useCallback((): void => {
    if (sharing) return;
    setSource(null);
    setError(null);
  }, [sharing]);

  /** 将统一选择目标映射为 SDK friend/group contract 后执行一次真实发送。 */
  const confirmShare = useCallback(async (targets: readonly ChatTargetPickerItem[]): Promise<void> => {
    /** target 是单选弹窗交付的唯一好友或群聊。 */
    const target = targets[0];
    if (!runtime || !source || !target || sharing) return;
    setSharing(true);
    setError(null);
    try {
      /** broadcastTarget 保留目标类型，禁止把群聊错误降级成好友发送。 */
      const broadcastTarget = { kind: target.kind, targetID: target.id } as const;
      if (source.kind === 'qr-code') {
        /** file 只在用户确认后生成，不通过 Router state 传递 Blob。 */
        const file = await createBrowserQRCodeShareFile({
          kind: source.qrKind,
          identity: source.identity,
          payload: source.payload,
          avatar: {
            initial: getRNAvatarInitial(source.displayName, source.qrKind === 'group' ? '群' : '?'),
            backgroundColor: readShareAvatarColor(getRNAvatarGradient(source.identity)),
          },
        });
        /** result 保留 SDK 对单目标发送的真实状态。 */
        const result = await runtime.getSync().messageBroadcast.sendImage({
          targets: [broadcastTarget],
          source: file,
          name: file.name,
          mimeType: file.type,
          size: file.size,
          width: 320,
          height: 320,
        });
        assertShareSucceeded(result, '二维码');
        toast.success('二维码已发送');
      } else {
        /** card 根据分享源生成 SDK 规范 user/group type108 body。 */
        const card = source.kind === 'user-card'
          ? { type: 'user' as const, userID: source.userID, nickname: source.displayName, avatarURL: source.avatarURL }
          : { type: 'group' as const, groupID: source.groupID, groupName: source.displayName, avatarURL: source.avatarURL };
        /** result 不使用顶层假成功，必须至少有一个真实成功目标。 */
        const result = await runtime.getSync().messageBroadcast.sendCard({ targets: [broadcastTarget], card });
        assertShareSucceeded(result, source.kind === 'user-card' ? '好友名片' : '群名片');
        toast.success(source.kind === 'user-card' ? '好友名片已发送' : '群名片已发送');
      }
      setSource(null);
    } catch (cause) {
      setError(readShareError(cause));
    } finally {
      setSharing(false);
    }
  }, [runtime, sharing, source, toast]);

  /** actions 保持稳定引用，避免入口页面随弹窗状态重渲染。 */
  const actions = useMemo<ChatShareModalActions>(() => ({ openShare }), [openShare]);
  /** excludeUserIDs 禁止把自己的账号作为好友目标，群聊仍可正常选择。 */
  const excludeUserIDs = snapshot.userID ? [snapshot.userID] : [];

  return (
    <ChatShareModalContext.Provider value={actions}>
      {children}
      <ChatTargetPickerModal
        open={Boolean(source)}
        sync={runtime?.getSync() ?? null}
        selectionMode="single"
        allowedKinds={['friend', 'group']}
        excludeUserIDs={excludeUserIDs}
        actionLabel="分享"
        pending={sharing}
        operationError={error}
        onClose={closeShare}
        onConfirm={targets => { void confirmShare(targets); }}
      />
    </ChatShareModalContext.Provider>
  );
}

/** 读取根级分享动作，禁止页面自行创建第二套选择和发送 owner。 */
export function useChatShareModal(): ChatShareModalActions {
  /** context 必须来自应用根 ChatShareModalProvider。 */
  const context = useContext(ChatShareModalContext);
  if (!context) throw new Error('useChatShareModal 必须在 ChatShareModalProvider 内使用');
  return context;
}

/** 单目标发送必须明确成功，failed/unknown 都按失败处理。 */
function assertShareSucceeded(
  result: { readonly successCount: number; readonly failedCount: number; readonly unknownCount: number },
  label: string,
): void {
  if (result.successCount > 0 && result.failedCount === 0 && result.unknownCount === 0) return;
  throw new Error(`${label}发送失败：${result.failedCount + result.unknownCount}个目标未成功`);
}

/** 从 RN 渐变 token 读取 Canvas 可用的首个稳定颜色。 */
function readShareAvatarColor(gradient: string): string {
  /** colorMatch 只接受本地 helper 生成的六位十六进制颜色。 */
  const colorMatch = gradient.match(/#[0-9A-Fa-f]{6}/);
  return colorMatch?.[0] ?? '#596EEB';
}

/** 将未知异常收敛为不泄露 transport 细节的分享提示。 */
function readShareError(cause: unknown): string {
  return cause instanceof Error && cause.message ? cause.message : '分享失败，请稍后重试';
}
