import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { ChatPage } from '../pages/chat/ChatPage.js';
import { ChatForwardCompatibilityRedirect } from '../pages/chat/ChatForwardCompatibilityRedirect.js';
import { CustomEmojiManagerPage } from '../pages/chat/CustomEmojiManagerPage.js';
import { ContactFriendApplicationPage } from '../pages/contacts/ContactFriendApplicationPage.js';
import { ContactProfilePage } from '../pages/contacts/ContactProfilePage.js';
import { ContactSearchPage } from '../pages/contacts/ContactSearchPage.js';
import { GroupApplicationsPage } from '../pages/contacts/GroupApplicationsPage.js';
import { JoinedGroupsPage } from '../pages/contacts/JoinedGroupsPage.js';
import { VerificationMessagesPage } from '../pages/contacts/VerificationMessagesPage.js';
import { CallDetailPage } from '../pages/calls/CallDetailPage.js';
import { AccountRegisterPage } from '../pages/login/AccountRegisterPage.js';
import { AuthCompleteProfilePage } from '../pages/login/AuthCompleteProfilePage.js';
import { AuthInvitePage } from '../pages/login/AuthInvitePage.js';
import { AuthOnboardingProvider } from '../pages/login/AuthOnboardingProvider.js';
import { AuthOnboardingProfileEditorPage } from '../pages/login/AuthOnboardingProfileEditorPage.js';
import { LoginPage } from '../pages/login/LoginPage.js';
import { MeBlacklistPage } from '../pages/me/MeBlacklistPage.js';
import { MeProfileEditorPage } from '../pages/me/MeProfileEditorPage.js';
import { MeProfilePage } from '../pages/me/MeProfilePage.js';
import { MeSettingsPage } from '../pages/me/MeSettingsPage.js';
import { MeDisplaySettingsPage } from '../pages/me/MeDisplaySettingsPage.js';
import { MeNotificationSettingsPage } from '../pages/me/MeNotificationSettingsPage.js';
import { MePermissionSettingsPage } from '../pages/me/MePermissionSettingsPage.js';
import { MeTermsPage } from '../pages/me/MeTermsPage.js';
import { MeSecurityCredentialPage } from '../pages/me/MeSecurityCredentialPage.js';
import { MeSecurityPage } from '../pages/me/MeSecurityPage.js';
import { NotFoundPage } from '../pages/not-found/NotFoundPage.js';
import { WebIMCallProvider, WebIMRuntimeProvider } from '../runtime/index.js';
import { PrimaryTabsLayout } from './PrimaryTabsLayout.js';
import { RouteMotionController } from '../components/interaction/index.js';

/** 好友名片选择页按动作路由加载，不进入通讯录和主路由首包。 */
const ContactCardSharePage = lazy(() => import('../pages/contacts/ContactCardSharePage.js'));
/** 共同群聊按资料子路由加载，不进入联系人主列表首包。 */
const ContactCommonGroupsPage = lazy(() => import('../pages/contacts/ContactCommonGroupsPage.js'));
/** 首页会话搜索按独立路由加载，保持主列表首包稳定。 */
const ConversationSearchPage = lazy(() => import('../pages/conversations/ConversationSearchPage.js'));
/** 归档会话按独立路由加载，保持主列表首包稳定。 */
const ArchivedConversationsPage = lazy(() => import('../pages/conversations/ArchivedConversationsPage.js'));
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
/** LiveKit 通话页按交互路由加载，避免浏览器媒体引擎进入主列表首包。 */
const ActiveCallPage = lazy(() => import('../pages/calls/ActiveCallPage.js'));
/** 发起群聊页按独立 SPA 路由加载，不进入会话与通讯录首包。 */
const CreateGroupPage = lazy(() => import('../pages/groups/CreateGroupPage.js'));
/** 查找群聊页按建群子路由加载，不进入首页或建群首包。 */
const GroupSearchPage = lazy(() => import('../pages/groups/GroupSearchPage.js'));
/** 群发目标选择页按独立 SPA 路由加载，不进入首页首包。 */
const BroadcastTargetSelectPage = lazy(() => import('../pages/broadcast/BroadcastTargetSelectPage.js'));
/** 群发 compose 页按独立 SPA 路由加载，不进入首页首包。 */
const BroadcastComposePage = lazy(() => import('../pages/broadcast/BroadcastComposePage.js'));
/** 扫码页按独立 SPA 路由加载，ZXing 不进入首页首包。 */
const QRCodeScanPage = lazy(() => import('../pages/qr/QRCodeScanPage.js'));
/** 群二维码申请页按识别结果路由加载。 */
const GroupQRCodeApplyPage = lazy(() => import('../pages/qr/GroupQRCodeApplyPage.js'));
/** 个人二维码页按动作路由加载，QR 生成器不进入个人中心首包。 */
const ProfileQRCodePage = lazy(() => import('../pages/qr/ProfileQRCodePage.js'));
/** 群二维码页按群资料动作路由加载，共用二维码生成器。 */
const GroupQRCodePage = lazy(() => import('../pages/qr/GroupQRCodePage.js'));
/** 二维码应用内分享页按确认动作路由加载，不进入展示页首包。 */
const QRCodeSharePage = lazy(() => import('../pages/qr/QRCodeSharePage.js'));

/** Web 应用根组件只负责装配浏览器路由，页面能力由对应 page owner 承担。 */
export function App() {
  return (
    <BrowserRouter>
      <WebIMRuntimeProvider>
        <WebIMCallProvider>
          <AuthOnboardingProvider>
          <RouteMotionController />
          <Routes>
          <Route path="/" element={<Navigate to="/conversations" replace />} />
          <Route path="/login" element={<Navigate to="/auth/phone" replace />} />
          <Route path="/auth/phone" element={<LoginPage mode="phone" />} />
          <Route path="/auth/email" element={<LoginPage mode="email" />} />
          <Route path="/auth/account" element={<LoginPage mode="account" />} />
          <Route path="/auth/register" element={<AccountRegisterPage />} />
          <Route path="/auth/invite" element={<AuthInvitePage />} />
          <Route path="/auth/complete-profile" element={<AuthCompleteProfilePage />} />
          <Route path="/auth/complete-profile/gender" element={<AuthOnboardingProfileEditorPage mode="gender" />} />
          <Route path="/auth/complete-profile/bio" element={<AuthOnboardingProfileEditorPage mode="bio" />} />
          <Route element={<PrimaryTabsLayout />}>
            <Route path="/conversations" />
            <Route path="/contacts" />
            <Route path="/calls" />
            <Route path="/me" />
          </Route>
          <Route
            path="/conversations/search"
            element={(
              <Suspense fallback={<ConversationSearchRouteLoadingState />}>
                <ConversationSearchPage />
              </Suspense>
            )}
          />
          <Route
            path="/conversations/archived"
            element={(
              <Suspense fallback={<ConversationArchiveRouteLoadingState />}>
                <ArchivedConversationsPage />
              </Suspense>
            )}
          />
          <Route path="/me/settings" element={<MeSettingsPage />} />
          <Route
            path="/calls/active"
            element={(
              <Suspense fallback={<CallRouteLoadingState />}>
                <ActiveCallPage />
              </Suspense>
            )}
          />
          <Route path="/calls/:callID" element={<CallDetailPage />} />
          <Route path="/contacts/verifications" element={<Navigate to="/contacts/verifications/friend" replace />} />
          <Route path="/contacts/verifications/:tab" element={<VerificationMessagesPage />} />
          <Route path="/contacts/friend-applications" element={<Navigate to="/contacts/verifications/friend" replace />} />
          <Route path="/contacts/group-applications" element={<Navigate to="/contacts/verifications/group" replace />} />
          <Route path="/contacts/group-applications/:groupID" element={<GroupApplicationsPage />} />
          <Route path="/contacts/groups" element={<JoinedGroupsPage />} />
          <Route
            path="/groups/create"
            element={(
              <Suspense fallback={<ContactsRouteLoadingState />}>
                <CreateGroupPage />
              </Suspense>
            )}
          />
          <Route
            path="/groups/search"
            element={(
              <Suspense fallback={<ContactsRouteLoadingState />}>
                <GroupSearchPage />
              </Suspense>
            )}
          />
          <Route
            path="/broadcast/select"
            element={(
              <Suspense fallback={<ContactsRouteLoadingState />}>
                <BroadcastTargetSelectPage />
              </Suspense>
            )}
          />
          <Route
            path="/broadcast/compose"
            element={(
              <Suspense fallback={<ContactsRouteLoadingState />}>
                <BroadcastComposePage />
              </Suspense>
            )}
          />
          <Route
            path="/scan"
            element={(
              <Suspense fallback={<ContactsRouteLoadingState />}>
                <QRCodeScanPage />
              </Suspense>
            )}
          />
          <Route
            path="/groups/:groupID/apply"
            element={(
              <Suspense fallback={<ContactsRouteLoadingState />}>
                <GroupQRCodeApplyPage />
              </Suspense>
            )}
          />
          <Route
            path="/me/qrcode"
            element={(
              <Suspense fallback={<ContactsRouteLoadingState />}>
                <ProfileQRCodePage />
              </Suspense>
            )}
          />
          <Route
            path="/me/qrcode/share"
            element={(
              <Suspense fallback={<ContactsRouteLoadingState />}>
                <QRCodeSharePage kind="user" />
              </Suspense>
            )}
          />
          <Route path="/contacts/search" element={<ContactSearchPage />} />
          <Route
            path="/contacts/users/:userID/share"
            element={(
              <Suspense fallback={<ContactsRouteLoadingState />}>
                <ContactCardSharePage />
              </Suspense>
            )}
          />
          <Route path="/contacts/users/:userID" element={<ContactProfilePage />} />
          <Route
            path="/contacts/users/:userID/groups"
            element={(
              <Suspense fallback={<ContactsRouteLoadingState />}>
                <ContactCommonGroupsPage />
              </Suspense>
            )}
          />
          <Route path="/contacts/users/:userID/add" element={<ContactFriendApplicationPage />} />
          <Route path="/me/settings/display" element={<MeDisplaySettingsPage />} />
          <Route path="/me/settings/notifications" element={<MeNotificationSettingsPage />} />
          <Route path="/me/settings/permissions" element={<MePermissionSettingsPage />} />
          <Route path="/me/settings/blacklist" element={<MeBlacklistPage />} />
          <Route path="/me/settings/terms" element={<MeTermsPage />} />
          <Route path="/me/security" element={<MeSecurityPage />} />
          <Route path="/me/security/account" element={<MeSecurityCredentialPage mode="account" />} />
          <Route path="/me/security/password" element={<MeSecurityCredentialPage mode="password" />} />
          <Route path="/me/profile" element={<MeProfilePage />} />
          <Route path="/me/profile/nickname" element={<MeProfileEditorPage mode="nickname" />} />
          <Route path="/me/profile/gender" element={<MeProfileEditorPage mode="gender" />} />
          <Route path="/me/profile/bio" element={<MeProfileEditorPage mode="bio" />} />
          <Route
            path="/conversations/:conversationID"
            element={<ChatPage />}
          />
          <Route
            path="/conversations/:conversationID/forward"
            element={<ChatForwardCompatibilityRedirect />}
          />
          <Route
            path="/conversations/:conversationID/emojis"
            element={<CustomEmojiManagerPage />}
          />
          <Route
            path="/conversations/:conversationID/search"
            element={(
              <Suspense fallback={<ChatSearchRouteLoadingState />}>
                <ChatMessageSearchPage />
              </Suspense>
            )}
          />
          <Route
            path="/conversations/:conversationID/settings"
            element={(
              <Suspense fallback={<ChatSettingsRouteLoadingState />}>
                <ChatSettingsPage />
              </Suspense>
            )}
          />
          <Route
            path="/conversations/:conversationID/settings/create-group"
            element={(
              <Suspense fallback={<ChatSettingsRouteLoadingState />}>
                <CreateGroupPage fromSingleSettings />
              </Suspense>
            )}
          />
          <Route
            path="/conversations/:conversationID/settings/profile"
            element={(
              <Suspense fallback={<ChatSettingsRouteLoadingState />}>
                <GroupProfilePage />
              </Suspense>
            )}
          />
          <Route
            path="/conversations/:conversationID/settings/qrcode"
            element={(
              <Suspense fallback={<ChatSettingsRouteLoadingState />}>
                <GroupQRCodePage />
              </Suspense>
            )}
          />
          <Route
            path="/conversations/:conversationID/settings/qrcode/share"
            element={(
              <Suspense fallback={<ChatSettingsRouteLoadingState />}>
                <QRCodeSharePage kind="group" />
              </Suspense>
            )}
          />
          <Route
            path="/conversations/:conversationID/settings/manage"
            element={(
              <Suspense fallback={<ChatSettingsRouteLoadingState />}>
                <GroupManagementPage />
              </Suspense>
            )}
          />
          <Route
            path="/conversations/:conversationID/settings/manage/mute"
            element={(
              <Suspense fallback={<ChatSettingsRouteLoadingState />}>
                <GroupMutePage />
              </Suspense>
            )}
          />
          <Route
            path="/conversations/:conversationID/settings/manage/admins"
            element={(
              <Suspense fallback={<ChatSettingsRouteLoadingState />}>
                <GroupAdminsPage />
              </Suspense>
            )}
          />
          <Route
            path="/conversations/:conversationID/settings/manage/admins/add"
            element={(
              <Suspense fallback={<ChatSettingsRouteLoadingState />}>
                <GroupAddAdminsPage />
              </Suspense>
            )}
          />
          <Route
            path="/conversations/:conversationID/settings/manage/owner-transfer"
            element={(
              <Suspense fallback={<ChatSettingsRouteLoadingState />}>
                <GroupOwnerTransferPage />
              </Suspense>
            )}
          />
          <Route
            path="/conversations/:conversationID/settings/manage/speech-frequency"
            element={(
              <Suspense fallback={<ChatSettingsRouteLoadingState />}>
                <GroupSpeechFrequencyPage />
              </Suspense>
            )}
          />
          <Route
            path="/conversations/:conversationID/settings/auto-delete"
            element={(
              <Suspense fallback={<ChatSettingsRouteLoadingState />}>
                <ChatAutoDeletePage />
              </Suspense>
            )}
          />
          <Route
            path="/conversations/:conversationID/settings/members"
            element={(
              <Suspense fallback={<ChatSettingsRouteLoadingState />}>
                <GroupMembersPage />
              </Suspense>
            )}
          />
          <Route
            path="/conversations/:conversationID/settings/members/invite"
            element={(
              <Suspense fallback={<ChatSettingsRouteLoadingState />}>
                <GroupInviteMembersPage />
              </Suspense>
            )}
          />
          <Route
            path="/conversations/:conversationID/settings/members/remove"
            element={(
              <Suspense fallback={<ChatSettingsRouteLoadingState />}>
                <GroupRemoveMembersPage />
              </Suspense>
            )}
          />
          <Route
            path="/conversations/:conversationID/settings/introduction"
            element={(
              <Suspense fallback={<ChatSettingsRouteLoadingState />}>
                <GroupIntroductionPage />
              </Suspense>
            )}
          />
          <Route
            path="/conversations/:conversationID/settings/announcement"
            element={(
              <Suspense fallback={<ChatSettingsRouteLoadingState />}>
                <GroupAnnouncementPage />
              </Suspense>
            )}
          />
          <Route
            path="/conversations/:conversationID/settings/share-group-card"
            element={(
              <Suspense fallback={<ChatSettingsRouteLoadingState />}>
                <GroupCardSharePage />
              </Suspense>
            )}
          />
          <Route path="*" element={<NotFoundPage />} />
          </Routes>
          </AuthOnboardingProvider>
        </WebIMCallProvider>
      </WebIMRuntimeProvider>
    </BrowserRouter>
  );
}

/** LiveKit route chunk 加载期间保持明确通话状态。 */
function CallRouteLoadingState() {
  return <main className="rn-calls-page-state" aria-busy="true"><strong>正在加载通话</strong></main>;
}

/** 首页会话搜索路由块下载期间保持明确状态。 */
function ConversationSearchRouteLoadingState() {
  return (
    <main className="rn-conversation-search-state" aria-busy="true">
      <strong>正在加载搜索</strong>
    </main>
  );
}

/** 归档会话路由块下载期间保持明确状态。 */
function ConversationArchiveRouteLoadingState() {
  return (
    <main className="rn-conversation-page-state" aria-busy="true">
      <strong>正在加载归档会话</strong>
    </main>
  );
}

/** 联系人路由块下载期间保持明确且可访问的页面状态。 */
function ContactsRouteLoadingState() {
  return (
    <main className="rn-contacts-page-state" aria-busy="true">
      <strong>正在加载通讯录</strong>
    </main>
  );
}

/** 聊天搜索路由块下载期间保持明确且可访问的页面状态。 */
function ChatSearchRouteLoadingState() {
  return (
    <main className="rn-chat-page-state" aria-busy="true">
      <strong>正在加载聊天记录搜索</strong>
    </main>
  );
}

/** 聊天设置路由块下载期间保持明确且可访问的页面状态。 */
function ChatSettingsRouteLoadingState() {
  return (
    <main className="rn-chat-page-state" aria-busy="true">
      <strong>正在加载聊天设置</strong>
    </main>
  );
}
