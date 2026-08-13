import { Navigate, useLocation, useParams } from 'react-router-dom';

import {
  createChatForwardCompatibilityDestination,
} from './chat-forward-route.js';

/** 已删除的转发目标页只负责回到同一聊天主路由。 */
export function ChatForwardCompatibilityRedirect() {
  // conversationID 是旧深链唯一可恢复的页面身份。
  const { conversationID = '' } = useParams();
  // location 只读取旧 SPA state，不读取查询参数或消息正文。
  const location = useLocation();
  // destination 统一执行路径编码、旧 state 校验和来源会话匹配。
  const destination = createChatForwardCompatibilityDestination(
    conversationID,
    location.state,
  );
  return <Navigate to={destination.pathname} replace state={destination.state} />;
}
