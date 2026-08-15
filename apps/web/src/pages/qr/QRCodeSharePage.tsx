import { useCallback, useEffect, useRef } from 'react';
import { buildIM28GroupQRCodePayload, buildIM28UserQRCodePayload, formatIMUserDisplayName } from '@im28/im-sdk/web';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';

import { useWebIMRuntime } from '../../runtime/index.js';
import { loadGroupProfileSource } from '../chat/group-profile-source.js';
import { buildGroupProfileView } from '../chat/group-profile-view.js';
import { useChatShareModal } from '../share/ChatShareModalProvider.js';
import { readQRCodeShareBackHref } from './qr-route.js';

/** 二维码兼容路由允许的稳定来源类型。 */
export type QRCodeShareKind = 'user' | 'group';

/** 旧二维码分享深链只恢复公开来源并桥接到全局弹窗。 */
export default function QRCodeSharePage({ kind }: { readonly kind: QRCodeShareKind }) {
  /** conversationID 仅在群二维码兼容路由存在。 */
  const { conversationID = '' } = useParams();
  /** location 只恢复原入口的受控返回地址。 */
  const location = useLocation();
  /** navigate 在登记弹窗后移除伪页面。 */
  const navigate = useNavigate();
  /** runtime 提供当前资料和群资料 shared facade。 */
  const { runtime, snapshot, restoring } = useWebIMRuntime();
  /** shareModal 是二维码目标选择和发送的唯一 owner。 */
  const shareModal = useChatShareModal();
  /** openedRef 防止 StrictMode 重放重复登记。 */
  const openedRef = useRef(false);
  /** backHref 严格返回旧路由登记的站内入口。 */
  const backHref = readQRCodeShareBackHref(location.state, kind, conversationID);

  /** 恢复二维码公开来源后打开根级分享弹窗。 */
  const bridgeShare = useCallback(async (): Promise<void> => {
    if (!runtime || !snapshot.userID || openedRef.current || (kind === 'group' && !conversationID)) return;
    openedRef.current = true;
    try {
      if (kind === 'user') {
        /** profile 只来自当前账号 shared profile facade。 */
        const profile = await runtime.getSync().profile.getCurrent();
        /** userID 必须来自权威资料。 */
        const userID = profile.user_id?.trim() ?? '';
        if (!userID) return;
        shareModal.openShare({
          kind: 'qr-code',
          qrKind: 'user',
          identity: userID,
          displayName: profile.nickname?.trim() || formatIMUserDisplayName(userID),
          payload: buildIM28UserQRCodePayload(userID),
        });
      } else {
        /** source 和 view 复用群资料页的 canonical 身份校验。 */
        const source = await loadGroupProfileSource({ sync: runtime.getSync(), conversationID });
        const view = buildGroupProfileView(source.conversation, source.group);
        shareModal.openShare({
          kind: 'qr-code',
          qrKind: 'group',
          identity: view.groupID,
          displayName: view.name,
          payload: buildIM28GroupQRCodePayload(view.groupID),
        });
      }
    } finally {
      navigate(backHref, { replace: true });
    }
  }, [backHref, conversationID, kind, navigate, runtime, shareModal, snapshot.userID]);

  useEffect(() => { void bridgeShare(); }, [bridgeShare]);

  if (!restoring && !snapshot.userID) return <Navigate to="/login" replace />;
  return null;
}
