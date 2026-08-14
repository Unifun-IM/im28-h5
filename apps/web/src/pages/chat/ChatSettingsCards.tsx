import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';

import arrowIconURL from '../../assets/rn/assets/icons/imm28/nav-arrow-right.regular.svg';
import minusIconURL from '../../assets/rn/assets/icons/imm28/minus-circle.regular.svg';
import plusIconURL from '../../assets/rn/assets/icons/imm28/plus-circle.regular.svg';
import addMemberIconURL from '../../assets/rn/assets/icons/imm28/plus.regular.svg';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';
import {
  getRNAvatarGradient,
  getRNAvatarInitial,
} from '../../components/rn-avatar-view.js';
import type {
  ChatSettingsMemberView,
  ChatSettingsView,
} from './chat-settings-view.js';

/** 清空聊天记录入口保持 RN 设置卡片布局并要求二次确认。 */
export function ChatClearHistorySettingsCard({
  clearing,
  onOpen,
}: {
  readonly clearing: boolean;
  readonly onOpen: () => void;
}) {
  return (
    <div className="rn-chat-settings-card">
      <button
        className="rn-chat-settings-row rn-chat-settings-clear-row"
        type="button"
        disabled={clearing}
        onClick={onOpen}
      >
        <span>清空聊天记录</span>
        {clearing ? <span className="rn-chat-settings-row-trailing">清空中</span> : null}
      </button>
    </div>
  );
}

/** 单聊设置首卡复用真实对方资料 route 和搜索 owner。 */
export function SingleSettingsCard({ view }: { readonly view: ChatSettingsView }) {
  // profileURL 只携带稳定用户 ID，不在设置页读取资料。
  const profileURL = `/contacts/users/${encodeURIComponent(view.targetID)}`;
  // createGroupURL 绑定当前真实单聊会话，不从 history state 接受对端身份。
  const createGroupURL = `/conversations/${encodeURIComponent(view.conversationID)}/settings/create-group`;
  return (
    <div className="rn-chat-settings-card">
      <div className="rn-chat-settings-single-member">
        <Link to={profileURL} aria-label={`查看${view.title}的资料`}>
          <SettingsAvatar identity={view.targetID} name={view.title} avatarURL={view.avatarURL} size={40} />
        </Link>
        <Link className="rn-chat-settings-add-member" to={createGroupURL} aria-label="添加成员创建群聊">
          <RNAssetIcon assetURL={addMemberIconURL} />
        </Link>
      </div>
      <ChatSearchSettingsRow view={view} />
    </div>
  );
}

/** 群设置首卡展示真实群快照和现有成员 facade 的首屏结果。 */
export function GroupSettingsCard({
  view,
  members,
  onlineByID,
  showOnlineStatus,
}: {
  readonly view: ChatSettingsView;
  readonly members: readonly ChatSettingsMemberView[];
  readonly onlineByID: Readonly<Record<string, boolean>>;
  readonly showOnlineStatus: boolean;
}) {
  // visibleMemberCount 优先使用群事实，并在冷 cache 时回退已读成员数。
  const visibleMemberCount = view.memberCount || members.length;
  // membersURL 由当前真实会话 ID 构造独立 React Router 子页。
  const membersURL = `/conversations/${encodeURIComponent(view.conversationID)}/settings/members`;
  // inviteMembersURL 只在 shared capability 允许时公开好友选择入口。
  const inviteMembersURL = `/conversations/${encodeURIComponent(view.conversationID)}/settings/members/invite`;
  // removeMembersURL 只在 shared capability 允许时公开选择入口。
  const removeMembersURL = `/conversations/${encodeURIComponent(view.conversationID)}/settings/members/remove`;
  // profileURL 让群资料首行进入可刷新 React Router 子页。
  const profileURL = `/conversations/${encodeURIComponent(view.conversationID)}/settings/profile`;
  return (
    <div className="rn-chat-settings-card">
      <Link className="rn-chat-settings-group-info" to={profileURL} aria-label="编辑群资料">
        <SettingsAvatar identity={view.targetID} name={view.title} avatarURL={view.avatarURL} size={56} />
        <span className="rn-chat-settings-group-info-copy">
          <strong>{view.title}</strong>
          <small>群ID：{view.targetID}</small>
        </span>
        <RNAssetIcon assetURL={arrowIconURL} />
      </Link>
      <div className="rn-chat-settings-members">
        <Link className="rn-chat-settings-members-header" to={membersURL} aria-label="查看全部群成员">
          <h2>群成员（{visibleMemberCount}）</h2>
          <span>
            <span>全部</span>
            <RNAssetIcon assetURL={arrowIconURL} />
          </span>
        </Link>
        <div className="rn-chat-settings-member-grid">
          {members.map(member => (
            <Link
              key={member.userID}
              to={`/contacts/users/${encodeURIComponent(member.userID)}`}
              state={{
                backHref: `/conversations/${encodeURIComponent(view.conversationID)}/settings`,
                groupConversationID: view.conversationID,
              }}
              aria-label={`查看${member.name}的资料`}
            >
              <SettingsMemberAvatar
                member={member}
                online={Boolean(onlineByID[member.userID])}
                showOnlineStatus={showOnlineStatus}
              />
              <span>{member.name}</span>
            </Link>
          ))}
          {view.canInviteMembers ? (
            <Link className="rn-chat-settings-member-action" to={inviteMembersURL} aria-label="邀请群成员">
              <span className="rn-chat-settings-member-action-icon"><RNAssetIcon assetURL={plusIconURL} /></span>
              <span>邀请</span>
            </Link>
          ) : null}
          {view.canRemoveMembers ? (
            <Link className="rn-chat-settings-member-action" to={removeMembersURL} aria-label="移出群成员">
              <span className="rn-chat-settings-member-action-icon"><RNAssetIcon assetURL={minusIconURL} /></span>
              <span>移除</span>
            </Link>
          ) : null}
        </div>
      </div>
      <ChatSearchSettingsRow view={view} />
    </div>
  );
}

/** 群设置预览头像在圆形裁剪层外投影 RN 在线状态点。 */
function SettingsMemberAvatar({
  member,
  online,
  showOnlineStatus,
}: {
  readonly member: ChatSettingsMemberView;
  readonly online: boolean;
  readonly showOnlineStatus: boolean;
}) {
  return (
    <span className="rn-chat-settings-member-avatar">
      <SettingsAvatar
        identity={member.userID}
        name={member.name}
        avatarURL={member.avatarURL}
        size={40}
      />
      {showOnlineStatus && online ? (
        <span className="rn-chat-settings-member-online-border" aria-label="在线">
          <span />
        </span>
      ) : null}
    </span>
  );
}

/** 设置页的唯一聊天搜索入口继续进入既有分类搜索 route。 */
function ChatSearchSettingsRow({ view }: { readonly view: ChatSettingsView }) {
  // searchURL 复用已验收的搜索 owner。
  const searchURL = `/conversations/${encodeURIComponent(view.conversationID)}/search`;
  return (
    <Link className="rn-chat-settings-row" to={searchURL}>
      <span>{view.searchLabel}</span>
      <RNAssetIcon assetURL={arrowIconURL} />
    </Link>
  );
}

/** 设置页头像保持 RN 稳定 fallback 渐变和远端图片失败降级。 */
function SettingsAvatar({
  identity,
  name,
  avatarURL,
  size,
}: {
  readonly identity: string;
  readonly name: string;
  readonly avatarURL: string;
  readonly size: 40 | 56;
}) {
  // avatarStyle 固定宽高并使用 RN FNV-1a 渐变。
  const avatarStyle = {
    '--chat-settings-avatar-gradient': getRNAvatarGradient(identity),
    '--chat-settings-avatar-size': `${size}px`,
  } as CSSProperties;
  return (
    <span className="rn-chat-settings-avatar" style={avatarStyle}>
      <span>{getRNAvatarInitial(name, '?')}</span>
      {avatarURL ? <img src={avatarURL} alt="" onError={event => { event.currentTarget.hidden = true; }} /> : null}
    </span>
  );
}
