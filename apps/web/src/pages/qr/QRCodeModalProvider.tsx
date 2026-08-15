import { createContext, lazy, Suspense, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { buildIM28GroupQRCodePayload, buildIM28UserQRCodePayload, formatIMUserDisplayName } from '@im28/im-sdk/web';
import { useLocation, useNavigate } from 'react-router-dom';

import { InteractionModal } from '../../components/interaction/index.js';
import { useWebIMRuntime } from '../../runtime/index.js';
import { loadGroupProfileSource } from '../chat/group-profile-source.js';
import { buildGroupProfileView } from '../chat/group-profile-view.js';
import { useChatShareModal } from '../share/ChatShareModalProvider.js';

/** 二维码展示组件保持路由级懒加载，避免 QR 生成器进入应用首包。 */
const QRCodeDisplay = lazy(() => import('./QRCodeDisplay.js').then(module => ({ default: module.QRCodeDisplay })));

/** 全局二维码弹窗只公开当前用户和已加入群两个稳定入口。 */
interface QRCodeModalActions {
  readonly openUserQRCode: () => void;
  readonly openGroupQRCode: (conversationID: string) => void;
}

/** 弹窗请求保存稳定身份和打开时的页面，不把业务资料塞入路由状态。 */
type QRCodeModalTarget =
  | { readonly kind: 'user'; readonly originPath: string }
  | { readonly kind: 'group'; readonly conversationID: string; readonly originPath: string };

/** 弹窗内容只保存统一展示组件需要的公开资料。 */
interface QRCodeModalContent {
  readonly kind: 'user' | 'group';
  readonly identity: string;
  readonly displayName: string;
  readonly avatarURL: string;
  readonly payload: string;
  readonly idLabel: string;
  readonly hint: string;
}

/** 空默认值让错误使用在运行期明确失败。 */
const QRCodeModalContext = createContext<QRCodeModalActions | null>(null);

/** 在应用根层统一持有二维码底部弹窗、资料恢复和后续动作导航。 */
export function QRCodeModalProvider({ children }: { readonly children: ReactNode }) {
  /** runtime 提供当前账号资料、会话和群缓存的唯一入口。 */
  const { runtime, snapshot } = useWebIMRuntime();
  /** location 用于冻结打开弹窗时的真实背景页面。 */
  const location = useLocation();
  /** navigate 仅在用户明确选择扫码或分享后切换 SPA 页面。 */
  const navigate = useNavigate();
  /** shareModal 将二维码分享目标选择提升到应用根级 owner。 */
  const shareModal = useChatShareModal();
  /** target 控制当前全局弹窗请求。 */
  const [target, setTarget] = useState<QRCodeModalTarget | null>(null);
  /** content 保存从 shared owner 恢复并验证后的展示资料。 */
  const [content, setContent] = useState<QRCodeModalContent | null>(null);
  /** loading 标记当前资料恢复轮次。 */
  const [loading, setLoading] = useState(false);
  /** error 保留真实资料恢复失败，不生成二维码假数据。 */
  const [error, setError] = useState<string | null>(null);

  /** 打开个人二维码时只记录当前页面，不创建新的二维码页面路由。 */
  const openUserQRCode = useCallback((): void => {
    setTarget({ kind: 'user', originPath: location.pathname });
  }, [location.pathname]);

  /** 打开群二维码时只接收稳定会话 ID，群身份继续由 shared cache 校验。 */
  const openGroupQRCode = useCallback((conversationID: string): void => {
    /** normalizedConversationID 拒绝空白路由身份。 */
    const normalizedConversationID = conversationID.trim();
    if (!normalizedConversationID) return;
    setTarget({ kind: 'group', conversationID: normalizedConversationID, originPath: location.pathname });
  }, [location.pathname]);

  /** 从当前认证 runtime 恢复个人或群二维码内容。 */
  const loadContent = useCallback(async (): Promise<void> => {
    if (!target || !runtime || !snapshot.userID) return;
    setLoading(true);
    setContent(null);
    setError(null);
    try {
      if (target.kind === 'user') {
        /** profile 必须来自当前账号的 shared profile facade。 */
        const profile = await runtime.getSync().profile.getCurrent();
        /** userID 只接受权威资料中的稳定身份。 */
        const userID = profile.user_id?.trim() ?? '';
        if (!userID) throw new Error('二维码身份不可用');
        setContent({
          kind: 'user',
          identity: userID,
          displayName: profile.nickname?.trim() || formatIMUserDisplayName(userID),
          avatarURL: profile.avatar_url?.trim() ?? '',
          payload: buildIM28UserQRCodePayload(userID),
          idLabel: 'ID',
          hint: '使用28 APP 扫描此二维码，加好友',
        });
        return;
      }
      /** source 复用群资料页的会话、群 ID 与缓存刷新校验。 */
      const source = await loadGroupProfileSource({ sync: runtime.getSync(), conversationID: target.conversationID });
      /** view 统一群名、头像和稳定群身份投影。 */
      const view = buildGroupProfileView(source.conversation, source.group);
      setContent({
        kind: 'group',
        identity: view.groupID,
        displayName: view.name,
        avatarURL: view.avatarURL,
        payload: buildIM28GroupQRCodePayload(view.groupID),
        idLabel: '群ID',
        hint: '使用28 APP 扫描此二维码，加入群聊',
      });
    } catch (cause) {
      setError(readQRCodeModalError(cause));
    } finally {
      setLoading(false);
    }
  }, [runtime, snapshot.userID, target]);

  useEffect(() => { void loadContent(); }, [loadContent]);

  /** 关闭只清理弹窗内存态，背景页面和历史栈保持不变。 */
  const closeQRCode = useCallback((): void => {
    setTarget(null);
    setContent(null);
    setError(null);
  }, []);

  /** 扫码动作关闭弹窗后进入正式扫码页；扫码页内再次点击只关闭弹窗。 */
  const openScanner = useCallback((): void => {
    if (!target) return;
    /** originPath 是打开弹窗时冻结的受控站内路径。 */
    const originPath = target.originPath;
    closeQRCode();
    if (originPath === '/scan') return;
    navigate('/scan', { state: { backHref: originPath } });
  }, [closeQRCode, navigate, target]);

  /** 分享动作直接打开全局好友/群聊目标弹窗，不再创建伪装页面。 */
  const openShare = useCallback((): void => {
    if (!content) return;
    shareModal.openShare({
      kind: 'qr-code',
      qrKind: content.kind,
      identity: content.identity,
      displayName: content.displayName,
      payload: content.payload,
    });
    closeQRCode();
  }, [closeQRCode, content, shareModal]);

  /** actions 保持稳定引用，避免入口页面因 Provider 状态变化重渲染。 */
  const actions = useMemo<QRCodeModalActions>(() => ({ openUserQRCode, openGroupQRCode }), [openGroupQRCode, openUserQRCode]);

  return (
    <QRCodeModalContext.Provider value={actions}>
      {children}
      {target && content ? (
        <Suspense fallback={<QRCodeModalState label="正在生成二维码" onClose={closeQRCode} />}>
          <QRCodeDisplay {...content} closeLabel="关闭二维码" sourceError={error} onClose={closeQRCode} onScan={openScanner} onShare={openShare} />
        </Suspense>
      ) : target ? loading ? (
        <QRCodeModalState label="正在加载二维码" detail={error} onClose={closeQRCode} />
      ) : (
        <QRCodeModalState label="二维码加载失败" detail={error} retry={loadContent} onClose={closeQRCode} />
      ) : null}
    </QRCodeModalContext.Provider>
  );
}

/** 读取全局二维码弹窗动作，禁止页面自行装配第二个展示 owner。 */
export function useQRCodeModal(): QRCodeModalActions {
  /** context 必须来自应用根 QRCodeModalProvider。 */
  const context = useContext(QRCodeModalContext);
  if (!context) throw new Error('useQRCodeModal 必须在 QRCodeModalProvider 内使用');
  return context;
}

/** 加载和失败也使用同一底部弹窗，不回退成全屏状态页面。 */
function QRCodeModalState({ label, detail, retry, onClose }: { readonly label: string; readonly detail?: string | null; readonly retry?: () => void; readonly onClose: () => void }) {
  return (
    <InteractionModal open ariaLabel="二维码" className="rn-qr-display-modal" placement="bottom" onRequestClose={onClose}>
      <section className="rn-qr-display-surface rn-qr-display-state im-modal-sheet">
        <button type="button" aria-label="关闭二维码" onClick={onClose}>×</button>
        <strong>{label}</strong>
        {detail ? <span>{detail}</span> : null}
        {retry ? <button type="button" onClick={retry}>重试</button> : null}
      </section>
    </InteractionModal>
  );
}

/** 将未知异常收敛为不暴露账号凭据的二维码提示。 */
function readQRCodeModalError(cause: unknown): string {
  return cause instanceof Error && cause.message ? cause.message : '二维码加载失败';
}
