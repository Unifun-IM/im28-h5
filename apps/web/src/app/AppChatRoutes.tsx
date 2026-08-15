import { lazy, Suspense } from 'react';
import { Navigate, Route, useParams } from 'react-router-dom';

import { ChatForwardCompatibilityRedirect } from '../pages/chat/ChatForwardCompatibilityRedirect.js';
import { ChatPage } from '../pages/chat/ChatPage.js';
import { CustomEmojiManagerPage } from '../pages/chat/CustomEmojiManagerPage.js';

/** 聊天记录搜索按详情子路由加载，不增加会话列表首包。 */
const ChatMessageSearchPage = lazy(() => import('../pages/chat/ChatMessageSearchPage.js'));
/** 聊天设置按详情子路由加载，保持会话列表首包不变。 */
const ChatSettingsPage = lazy(() => import('../pages/chat/ChatSettingsPage.js'));
/** 群成员页按群设置子路由加载，避免拼音词典进入聊天首包。 */
const GroupMembersPage = lazy(() => import('../pages/chat/GroupMembersPage.js'));
/** 群成员移除选择页按危险操作子路由加载。 */
const GroupRemoveMembersPage = lazy(() => import('../pages/chat/GroupRemoveMembersPage.js'));
/** 群成员邀请选择页按群设置动作子路由加载。 */
const GroupInviteMembersPage = lazy(() => import('../pages/chat/GroupInviteMembersPage.js'));
/** 群简介只读页按群设置子路由加载，保持聊天主包稳定。 */
const GroupIntroductionPage = lazy(() => import('../pages/chat/GroupIntroductionPage.js'));
/** 群公告只读页按群设置子路由加载，保持聊天主包稳定。 */
const GroupAnnouncementPage = lazy(() => import('../pages/chat/GroupAnnouncementPage.js'));
/** 群名片好友选择页按设置动作路由加载。 */
const GroupCardSharePage = lazy(() => import('../pages/chat/GroupCardSharePage.js'));
/** 群资料页按群设置子路由加载，只开放已收敛的群昵称 mutation。 */
const GroupProfilePage = lazy(() => import('../pages/chat/GroupProfilePage.js'));
/** 群管理首页按 capability 子路由加载。 */
const GroupManagementPage = lazy(() => import('../pages/chat/GroupManagementPage.js'));
/** 群管理员列表按独立管理子路由加载。 */
const GroupAdminsPage = lazy(() => import('../pages/chat/GroupAdminsPage.js'));
/** 添加管理员选择按独立管理动作路由加载。 */
const GroupAddAdminsPage = lazy(() => import('../pages/chat/GroupAddAdminsPage.js'));
/** 群主转让选择按独立管理动作路由加载。 */
const GroupOwnerTransferPage = lazy(() => import('../pages/chat/GroupOwnerTransferPage.js'));
/** 群禁言页按群管理子路由加载，不进入聊天首包。 */
const GroupMutePage = lazy(() => import('../pages/chat/GroupMutePage.js'));
/** 发言频率页按群管理子路由加载，不进入聊天首包。 */
const GroupSpeechFrequencyPage = lazy(() => import('../pages/chat/GroupSpeechFrequencyPage.js'));
/** 定时删除选择页按设置子路由加载。 */
const ChatAutoDeletePage = lazy(() => import('../pages/chat/ChatAutoDeletePage.js'));
/** 发起群聊页按单聊设置动作加载，不进入聊天首包。 */
const CreateGroupPage = lazy(() => import('../pages/groups/CreateGroupPage.js'));
/** 二维码应用内分享页按确认动作路由加载，不进入展示页首包。 */
const QRCodeSharePage = lazy(() => import('../pages/qr/QRCodeSharePage.js'));

/** 输出聊天、聊天设置与群管理路由，供唯一根路由树组合。 */
export function renderChatRoutes() {
  return (
    <>
      <Route path="/conversations/:conversationID" element={<ChatPage />} />
      <Route path="/conversations/:conversationID/forward" element={<ChatForwardCompatibilityRedirect />} />
      <Route path="/conversations/:conversationID/emojis" element={<CustomEmojiManagerPage />} />
      <Route path="/conversations/:conversationID/search" element={<Suspense fallback={<ChatSearchRouteLoadingState />}><ChatMessageSearchPage /></Suspense>} />
      <Route path="/conversations/:conversationID/settings" element={<Suspense fallback={<ChatSettingsRouteLoadingState />}><ChatSettingsPage /></Suspense>} />
      <Route path="/conversations/:conversationID/settings/create-group" element={<Suspense fallback={<ChatSettingsRouteLoadingState />}><CreateGroupPage fromSingleSettings /></Suspense>} />
      <Route path="/conversations/:conversationID/settings/profile" element={<Suspense fallback={<ChatSettingsRouteLoadingState />}><GroupProfilePage /></Suspense>} />
      <Route path="/conversations/:conversationID/settings/qrcode" element={<GroupQRCodeCompatibilityRedirect />} />
      <Route path="/conversations/:conversationID/settings/qrcode/share" element={<Suspense fallback={<ChatSettingsRouteLoadingState />}><QRCodeSharePage kind="group" /></Suspense>} />
      <Route path="/conversations/:conversationID/settings/manage" element={<Suspense fallback={<ChatSettingsRouteLoadingState />}><GroupManagementPage /></Suspense>} />
      <Route path="/conversations/:conversationID/settings/manage/mute" element={<Suspense fallback={<ChatSettingsRouteLoadingState />}><GroupMutePage /></Suspense>} />
      <Route path="/conversations/:conversationID/settings/manage/admins" element={<Suspense fallback={<ChatSettingsRouteLoadingState />}><GroupAdminsPage /></Suspense>} />
      <Route path="/conversations/:conversationID/settings/manage/admins/add" element={<Suspense fallback={<ChatSettingsRouteLoadingState />}><GroupAddAdminsPage /></Suspense>} />
      <Route path="/conversations/:conversationID/settings/manage/owner-transfer" element={<Suspense fallback={<ChatSettingsRouteLoadingState />}><GroupOwnerTransferPage /></Suspense>} />
      <Route path="/conversations/:conversationID/settings/manage/speech-frequency" element={<Suspense fallback={<ChatSettingsRouteLoadingState />}><GroupSpeechFrequencyPage /></Suspense>} />
      <Route path="/conversations/:conversationID/settings/auto-delete" element={<Suspense fallback={<ChatSettingsRouteLoadingState />}><ChatAutoDeletePage /></Suspense>} />
      <Route path="/conversations/:conversationID/settings/members" element={<Suspense fallback={<ChatSettingsRouteLoadingState />}><GroupMembersPage /></Suspense>} />
      <Route
        path="/conversations/:conversationID/settings/members/invite"
        element={<><Suspense fallback={<ChatSettingsRouteLoadingState />}><ChatSettingsPage /></Suspense><Suspense fallback={null}><GroupInviteMembersPage /></Suspense></>}
      />
      <Route
        path="/conversations/:conversationID/settings/members/remove"
        element={<><Suspense fallback={<ChatSettingsRouteLoadingState />}><ChatSettingsPage /></Suspense><Suspense fallback={null}><GroupRemoveMembersPage /></Suspense></>}
      />
      <Route path="/conversations/:conversationID/settings/introduction" element={<Suspense fallback={<ChatSettingsRouteLoadingState />}><GroupIntroductionPage /></Suspense>} />
      <Route path="/conversations/:conversationID/settings/announcement" element={<Suspense fallback={<ChatSettingsRouteLoadingState />}><GroupAnnouncementPage /></Suspense>} />
      <Route path="/conversations/:conversationID/settings/share-group-card" element={<Suspense fallback={<ChatSettingsRouteLoadingState />}><GroupCardSharePage /></Suspense>} />
    </>
  );
}

/** 旧群二维码收藏地址只回到真实群资料页，不再装配伪装弹窗页面。 */
function GroupQRCodeCompatibilityRedirect() {
  /** conversationID 用于重建当前群资料的稳定 SPA 路径。 */
  const { conversationID = '' } = useParams();
  /** profileHref 对路由身份编码，拒绝将参数拼进查询或状态。 */
  const profileHref = `/conversations/${encodeURIComponent(conversationID)}/settings/profile`;
  return <Navigate to={profileHref} replace />;
}

/** 聊天搜索路由块下载期间保持明确且可访问的页面状态。 */
function ChatSearchRouteLoadingState() {
  return <main className="rn-chat-page-state" aria-busy="true"><strong>正在加载聊天记录搜索</strong></main>;
}

/** 聊天设置路由块下载期间保持明确且可访问的页面状态。 */
function ChatSettingsRouteLoadingState() {
  return <main className="rn-chat-page-state" aria-busy="true"><strong>正在加载聊天设置</strong></main>;
}
