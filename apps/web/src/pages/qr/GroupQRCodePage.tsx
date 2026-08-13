import { useCallback, useEffect, useState } from 'react';
import { buildIM28GroupQRCodePayload } from '@im28/im-sdk/web';
import { Navigate, useNavigate, useParams } from 'react-router-dom';

import { loadGroupProfileSource, type GroupProfileSource } from '../chat/group-profile-source.js';
import { buildGroupProfileView } from '../chat/group-profile-view.js';
import { useWebIMRuntime } from '../../runtime/index.js';
import { QRCodeDisplay } from './QRCodeDisplay.js';

/** RN 群二维码页只消费 shared 群快照和群二维码 payload。 */
export default function GroupQRCodePage() {
  /** conversationID 来自可刷新 React Router path。 */
  const { conversationID = '' } = useParams();
  /** navigate 只处理群资料、扫码页之间的 SPA 路由。 */
  const navigate = useNavigate();
  /** runtime 提供当前账号会话和群资料 facade。 */
  const { runtime, snapshot, restoring, startupError } = useWebIMRuntime();
  /** source 保存经过会话与群 ID 双重匹配的资料。 */
  const [source, setSource] = useState<GroupProfileSource | null>(null);
  /** loading 标记 cache-first 和权威刷新过程。 */
  const [loading, setLoading] = useState(false);
  /** error 显示真实会话或群资料读取失败。 */
  const [error, setError] = useState<string | null>(null);
  /** backURL 固定返回当前群资料页。 */
  const backURL = `/conversations/${encodeURIComponent(conversationID)}/settings/profile`;
  /** qrCodeURL 仅用于扫码页的严格返回来源。 */
  const qrCodeURL = `/conversations/${encodeURIComponent(conversationID)}/settings/qrcode`;

  /** 复用群资料页的 cache-first source owner。 */
  const load = useCallback(async (): Promise<void> => {
    if (!runtime || !snapshot.userID || !conversationID) return;
    setLoading(true);
    setError(null);
    try {
      setSource(await loadGroupProfileSource({
        sync: runtime.getSync(),
        conversationID,
        onCached: setSource,
      }));
    } catch (cause) {
      setError(readGroupQRCodeError(cause));
    } finally {
      setLoading(false);
    }
  }, [conversationID, runtime, snapshot.userID]);

  useEffect(() => { void load(); }, [load]);

  if (restoring) return <GroupQRCodeState label="正在恢复群二维码" />;
  if (!runtime) return <GroupQRCodeState label="运行配置不可用" detail={startupError} />;
  if (!snapshot.userID) return <Navigate to="/login" replace />;
  if (loading && !source) return <GroupQRCodeState label="正在加载群二维码" />;
  if (!source) return <GroupQRCodeState label="群二维码加载失败" detail={error} />;
  /** view 严格验证群会话 target 与 shared 群快照。 */
  const view = buildGroupProfileView(source.conversation, source.group);
  return <QRCodeDisplay kind="group" identity={view.groupID} displayName={view.name} avatarURL={view.avatarURL} payload={buildIM28GroupQRCodePayload(view.groupID)} idLabel="群ID" hint="使用28 APP 扫描此二维码，加入群聊" closeLabel="返回群资料" sourceError={error} onClose={() => navigate(backURL)} onScan={() => navigate('/scan', { state: { backHref: qrCodeURL } })} onShare={() => navigate(`${qrCodeURL}/share`)} />;
}

/** 群二维码认证恢复与真实读取失败状态。 */
function GroupQRCodeState({ label, detail = '' }: { readonly label: string; readonly detail?: string | null }) {
  return <main className="rn-qr-state"><strong>{label}</strong>{detail ? <span>{detail}</span> : null}</main>;
}

/** 将未知异常收敛为群二维码页面文案。 */
function readGroupQRCodeError(cause: unknown): string {
  return cause instanceof Error && cause.message ? cause.message : '群二维码加载失败';
}
