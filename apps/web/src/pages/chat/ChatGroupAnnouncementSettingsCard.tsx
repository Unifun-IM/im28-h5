import { Link } from 'react-router-dom';

import arrowIconURL from '../../assets/rn/assets/icons/imm28/nav-arrow-right.regular.svg';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';
import type { ChatSettingsView } from './chat-settings-view.js';

/** 群公告入口只在上层 RN 同权限区域选择后展示。 */
export function ChatGroupAnnouncementSettingsCard({
  view,
}: {
  readonly view: ChatSettingsView;
}) {
  // announcementURL 使用当前真实会话 ID 构造只读公告子页。
  const announcementURL =
    `/conversations/${encodeURIComponent(view.conversationID)}/settings/announcement`;
  return (
    <div className="rn-chat-settings-card">
      <Link className="rn-chat-settings-row rn-chat-settings-stacked-row" to={announcementURL} aria-label="查看群公告">
        <span className="rn-chat-settings-row-copy">
          <strong>群公告</strong>
          <small>{view.announcement || '未设置'}</small>
        </span>
        <RNAssetIcon assetURL={arrowIconURL} />
      </Link>
    </div>
  );
}
