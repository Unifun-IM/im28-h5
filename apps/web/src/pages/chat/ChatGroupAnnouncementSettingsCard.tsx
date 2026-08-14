import { Link } from 'react-router-dom';

import arrowIconURL from '../../assets/rn/assets/icons/imm28/nav-arrow-right.regular.svg';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';
import type { ChatSettingsView } from './chat-settings-view.js';

/** 群公告与群管理按 RN 权限投影归入同一设置卡片。 */
export function ChatGroupAnnouncementSettingsCard({
  view,
  showAnnouncement,
  showManage,
}: {
  readonly view: ChatSettingsView;
  readonly showAnnouncement: boolean;
  readonly showManage: boolean;
}) {
  // announcementURL 使用当前真实会话 ID 构造只读公告子页。
  const announcementURL =
    `/conversations/${encodeURIComponent(view.conversationID)}/settings/announcement`;
  // manageURL 使用当前真实会话 ID 构造群管理子页。
  const manageURL =
    `/conversations/${encodeURIComponent(view.conversationID)}/settings/manage`;
  return (
    <div className="rn-chat-settings-card">
      {showAnnouncement ? (
        <Link className="rn-chat-settings-row rn-chat-settings-stacked-row" to={announcementURL} aria-label="查看群公告">
          <span className="rn-chat-settings-row-copy">
            <strong>群公告</strong>
            <small>{view.announcement || '未设置'}</small>
          </span>
          <RNAssetIcon assetURL={arrowIconURL} />
        </Link>
      ) : null}
      {showManage ? (
        <Link className="rn-chat-settings-row" to={manageURL} aria-label="打开群管理">
          <span>群管理</span>
          <RNAssetIcon assetURL={arrowIconURL} />
        </Link>
      ) : null}
    </div>
  );
}
