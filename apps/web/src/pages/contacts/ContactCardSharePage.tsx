import { useEffect, useMemo } from 'react';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';

import { useChatShareModal } from '../share/ChatShareModalProvider.js';
import { readContactCardShareLocationState } from './contact-action-view.js';

/** 旧名片分享深链只桥接到全局弹窗，不再拥有独立页面 UI。 */
export function ContactCardSharePage() {
  /** routeUserID 标识旧路由希望分享的好友。 */
  const { userID: routeUserID = '' } = useParams();
  /** location 只读取经过白名单校验的公开名片字段。 */
  const location = useLocation();
  /** navigate 在登记全局弹窗后立即移除伪页面。 */
  const navigate = useNavigate();
  /** shareModal 是目标选择和发送的唯一 owner。 */
  const shareModal = useChatShareModal();
  /** shareState 严格校验 URL 与旧 history state。 */
  const shareState = useMemo(
    () => readContactCardShareLocationState(location.state, routeUserID),
    [location.state, routeUserID],
  );

  useEffect(() => {
    if (!shareState) return;
    shareModal.openShare({
      kind: 'user-card',
      userID: shareState.card.userID,
      displayName: shareState.card.displayName,
      avatarURL: shareState.card.avatarURL,
    });
    navigate(`/contacts/users/${encodeURIComponent(routeUserID)}`, { replace: true });
  }, [navigate, routeUserID, shareModal, shareState]);

  return shareState ? null : <Navigate to={`/contacts/users/${encodeURIComponent(routeUserID)}`} replace />;
}

export default ContactCardSharePage;
