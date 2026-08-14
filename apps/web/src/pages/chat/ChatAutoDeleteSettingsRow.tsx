import { Link } from 'react-router-dom';

import arrowIconURL from '../../assets/rn/assets/icons/imm28/nav-arrow-right.regular.svg';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';
import { formatChatAutoDeleteValue } from './chat-auto-delete-view.js';

/** 自动删除入口支持单聊设置和群管理两种既有页面样式。 */
interface ChatAutoDeleteSettingsRowProps {
  readonly conversationID: string;
  readonly placement: 'chat-settings' | 'group-management';
  readonly autoDeleteSeconds: number | undefined;
}

/** 唯一构造自动删除入口文案、当前值和 React Router 子路由。 */
export function ChatAutoDeleteSettingsRow({
  conversationID,
  placement,
  autoDeleteSeconds,
}: ChatAutoDeleteSettingsRowProps) {
  /** autoDeleteURL 指向当前会话既有的唯一设置子路由。 */
  const autoDeleteURL =
    '/conversations/' + encodeURIComponent(conversationID) + '/settings/auto-delete';
  if (placement === 'group-management') {
    return (
      <section className="rn-group-management-card">
        <Link className="rn-group-management-link" to={autoDeleteURL}>
          <span>定时删除消息</span>
          <span>
            <small>{formatChatAutoDeleteValue(autoDeleteSeconds)}</small>
            <RNAssetIcon assetURL={arrowIconURL} />
          </span>
        </Link>
      </section>
    );
  }
  return (
    <div className="rn-chat-settings-card">
      <Link className="rn-chat-settings-row" to={autoDeleteURL}>
        <span>定时删除</span>
        <span className="rn-chat-settings-row-trailing">
          <span>{formatChatAutoDeleteValue(autoDeleteSeconds)}</span>
          <RNAssetIcon assetURL={arrowIconURL} />
        </span>
      </Link>
    </div>
  );
}
