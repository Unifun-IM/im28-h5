import { useCallback, useEffect, useRef } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';

import { useWebIMRuntime } from '../../runtime/index.js';
import { useChatShareModal } from '../share/ChatShareModalProvider.js';
import { loadGroupProfileSource } from './group-profile-source.js';
import { buildGroupProfileView } from './group-profile-view.js';

/** 旧群名片分享深链只恢复权威资料并桥接到全局弹窗。 */
export function GroupCardSharePage() {
  /** conversationID 来自稳定兼容路由。 */
  const { conversationID = '' } = useParams();
  /** navigate 在登记弹窗后返回真实群设置页面。 */
  const navigate = useNavigate();
  /** runtime 提供群资料 shared facade。 */
  const { runtime, snapshot, restoring } = useWebIMRuntime();
  /** shareModal 是选择与发送的唯一 owner。 */
  const shareModal = useChatShareModal();
  /** openedRef 防止 StrictMode 重放产生重复弹窗登记。 */
  const openedRef = useRef(false);
  /** settingsURL 是兼容路由退出后的真实页面。 */
  const settingsURL = `/conversations/${encodeURIComponent(conversationID)}/settings`;

  /** 恢复群资料后打开根级分享弹窗。 */
  const bridgeShare = useCallback(async (): Promise<void> => {
    if (!runtime || !snapshot.userID || !conversationID || openedRef.current) return;
    openedRef.current = true;
    try {
      /** source 和 view 复用群资料页的 canonical 身份校验。 */
      const source = await loadGroupProfileSource({ sync: runtime.getSync(), conversationID });
      const view = buildGroupProfileView(source.conversation, source.group);
      shareModal.openShare({ kind: 'group-card', groupID: view.groupID, displayName: view.name, avatarURL: view.avatarURL });
    } finally {
      navigate(settingsURL, { replace: true });
    }
  }, [conversationID, navigate, runtime, settingsURL, shareModal, snapshot.userID]);

  useEffect(() => { void bridgeShare(); }, [bridgeShare]);

  if (!restoring && !snapshot.userID) return <Navigate to="/login" replace />;
  return null;
}

export default GroupCardSharePage;
