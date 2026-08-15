import { useCallback, useEffect, useState } from 'react';
import {
  buildIM28GroupQRCodePayload,
  buildIM28UserQRCodePayload,
  formatIMUserDisplayName,
  type GatewayUser,
  type WebIMSync,
} from '@im28/im-sdk/web';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';

import { ChatTargetPickerModal, type ChatTargetPickerItem } from '../../components/chat-target-picker/index.js';
import { useAppToast } from '../../components/interaction/index.js';
import { getRNAvatarGradient, getRNAvatarInitial } from '../../components/rn-avatar-view.js';
import { useWebIMRuntime } from '../../runtime/index.js';
import { loadGroupProfileSource } from '../chat/group-profile-source.js';
import { buildGroupProfileView } from '../chat/group-profile-view.js';
import { createBrowserQRCodeShareFile } from './browser-qr-image.js';
import { readQRCodeShareBackHref } from './qr-route.js';

/** 二维码应用内分享的可刷新来源类型。 */
export type QRCodeShareKind = 'user' | 'group';

/** 发送前只保留重建 PNG 所需公开字段和稳定身份。 */
interface QRCodeShareSource {
  readonly kind: QRCodeShareKind;
  readonly identity: string;
  readonly displayName: string;
  readonly payload: string;
}

/** 二维码兼容路由恢复来源后呈现统一单选好友弹窗。 */
export default function QRCodeSharePage({ kind }: { readonly kind: QRCodeShareKind }) {
  /** conversationID 仅在群二维码路由存在。 */
  const { conversationID = '' } = useParams();
  /** location 只恢复全局二维码弹窗登记的真实来源页。 */
  const location = useLocation();
  /** navigate 关闭弹窗后返回二维码展示页。 */
  const navigate = useNavigate();
  /** runtime 提供资料与媒体群发 shared facade。 */
  const { runtime, snapshot, restoring, startupError } = useWebIMRuntime();
  /** toast 承载二维码发送结果，来源加载错误仍由页面状态呈现。 */
  const { toast } = useAppToast();
  /** source 保存当前二维码可验证公开来源。 */
  const [source, setSource] = useState<QRCodeShareSource | null>(null);
  /** loading 标识二维码来源恢复轮次。 */
  const [loading, setLoading] = useState(false);
  /** sharing 阻止重复生成、上传和 batch-send。 */
  const [sharing, setSharing] = useState(false);
  /** shareCompleted 在部分成功后阻止重复批量发送。 */
  const [shareCompleted, setShareCompleted] = useState(false);
  /** error 显示真实读取、上传或逐目标发送失败。 */
  const [error, setError] = useState<string | null>(null);
  /** backHref 严格返回打开全局底部弹窗的真实页面。 */
  const backHref = readQRCodeShareBackHref(location.state, kind, conversationID);

  /** 从 shared profile 或群资料 owner 恢复二维码来源。 */
  const load = useCallback(async (): Promise<void> => {
    if (!runtime || !snapshot.userID || (kind === 'group' && !conversationID)) return;
    setLoading(true);
    setError(null);
    setShareCompleted(false);
    try {
      setSource(await loadQRCodeShareSource(runtime.getSync(), kind, conversationID));
    } catch (cause) {
      setError(cause instanceof Error && cause.message ? cause.message : '二维码分享数据加载失败');
    } finally {
      setLoading(false);
    }
  }, [conversationID, kind, runtime, snapshot.userID]);

  useEffect(() => { void load(); }, [load]);

  /** 一次生成和上传二维码，再由 shared facade 发送到唯一好友。 */
  async function shareQRCode(targets: readonly ChatTargetPickerItem[]): Promise<void> {
    /** target 必须是统一弹窗交付的唯一好友目标。 */
    const target = targets[0];
    if (!runtime || !source || sharing || !target || target.kind !== 'friend') return;
    setSharing(true);
    setError(null);
    try {
      /** file 仅在用户确认后生成，不写浏览器缓存。 */
      const file = await createBrowserQRCodeShareFile({
        kind: source.kind,
        identity: source.identity,
        payload: source.payload,
        avatar: {
          initial: getRNAvatarInitial(source.displayName, source.kind === 'group' ? '群' : '?'),
          backgroundColor: readQRCodeShareAvatarColor(getRNAvatarGradient(source.identity)),
        },
      });
      /** result 按目标保留 sent、failed 和 unknown，不信任顶层伪成功。 */
      const result = await runtime.getSync().messageBroadcast.sendImage({
        targets: [{ kind: 'friend', targetID: target.id }],
        source: file,
        name: file.name,
        mimeType: file.type,
        size: file.size,
        width: 320,
        height: 320,
      });
      if (result.successCount === 0) {
        setError(`二维码发送失败：${result.failedCount + result.unknownCount}个目标未成功`);
        return;
      }
      if (result.failedCount || result.unknownCount) {
        setShareCompleted(true);
        setError(`已发送到${result.successCount}个目标，${result.failedCount + result.unknownCount}个目标未成功`);
        return;
      }
      toast.success('二维码已发送');
      navigate(backHref, { replace: true });
    } catch (cause) {
      setError(cause instanceof Error && cause.message ? cause.message : '二维码发送失败');
    } finally {
      setSharing(false);
    }
  }

  if (restoring) return <QRCodeShareState label="正在恢复会话" />;
  if (!runtime) return <QRCodeShareState label="运行配置不可用" detail={startupError} />;
  if (!snapshot.userID) return <Navigate to="/login" replace />;
  return <main className="rn-qr-share-page" aria-busy={loading || sharing}><ChatTargetPickerModal open sync={runtime.getSync()} selectionMode="single" allowedKinds={['friend']} excludeUserIDs={[snapshot.userID]} actionLabel="分享" pending={sharing} confirmDisabled={loading || !source || shareCompleted} operationError={error} onClose={() => navigate(backHref, { replace: true })} onConfirm={targets => { void shareQRCode(targets); }} /></main>;
}

/** 从可刷新路由恢复个人或群二维码公开来源。 */
async function loadQRCodeShareSource(sync: WebIMSync, kind: QRCodeShareKind, conversationID: string): Promise<QRCodeShareSource> {
  if (kind === 'user') {
    /** profile 直接来自当前认证账号的 Gateway 详情。 */
    const profile: GatewayUser = await sync.profile.getCurrent();
    /** userID 必须由权威详情返回。 */
    const userID = profile.user_id?.trim() ?? '';
    if (!userID) throw new Error('二维码身份不可用');
    return {
      kind,
      identity: userID,
      displayName: profile.nickname?.trim() || formatIMUserDisplayName(userID),
      payload: buildIM28UserQRCodePayload(userID),
    };
  }
  /** groupSource 复用群资料页的会话与群 ID 双重校验。 */
  const groupSource = await loadGroupProfileSource({ sync, conversationID });
  /** groupView 统一群名、头像与 targetID 投影。 */
  const groupView = buildGroupProfileView(groupSource.conversation, groupSource.group);
  return { kind, identity: groupView.groupID, displayName: groupView.name, payload: buildIM28GroupQRCodePayload(groupView.groupID) };
}

/** 统一呈现二维码来源恢复状态。 */
function QRCodeShareState({ label, detail }: { readonly label: string; readonly detail?: string | null }) {
  return <main className="rn-contact-card-share-state"><strong>{label}</strong>{detail ? <span>{detail}</span> : null}</main>;
}

/** 从 RN 渐变 token 读取 Canvas 可用的首个稳定颜色。 */
function readQRCodeShareAvatarColor(gradient: string): string {
  /** colorMatch 只接受本地 helper 生成的六位十六进制颜色。 */
  const colorMatch = gradient.match(/#[0-9A-Fa-f]{6}/);
  return colorMatch?.[0] ?? '#596EEB';
}
