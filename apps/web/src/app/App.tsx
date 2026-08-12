import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { ChatPage } from '../pages/chat/ChatPage.js';
import { CustomEmojiManagerPage } from '../pages/chat/CustomEmojiManagerPage.js';
import { ChatForwardTargetPage } from '../pages/chat/ChatForwardTargetPage.js';
import { ConversationsPage } from '../pages/conversations/ConversationsPage.js';
import { ContactFriendApplicationPage } from '../pages/contacts/ContactFriendApplicationPage.js';
import { ContactProfilePage } from '../pages/contacts/ContactProfilePage.js';
import { ContactSearchPage } from '../pages/contacts/ContactSearchPage.js';
import { GroupApplicationsPage } from '../pages/contacts/GroupApplicationsPage.js';
import { JoinedGroupsPage } from '../pages/contacts/JoinedGroupsPage.js';
import { VerificationMessagesPage } from '../pages/contacts/VerificationMessagesPage.js';
import { CallsPage } from '../pages/calls/CallsPage.js';
import { CallDetailPage } from '../pages/calls/CallDetailPage.js';
import { AccountRegisterPage } from '../pages/login/AccountRegisterPage.js';
import { AuthCompleteProfilePage } from '../pages/login/AuthCompleteProfilePage.js';
import { AuthInvitePage } from '../pages/login/AuthInvitePage.js';
import { AuthOnboardingProvider } from '../pages/login/AuthOnboardingProvider.js';
import { AuthOnboardingProfileEditorPage } from '../pages/login/AuthOnboardingProfileEditorPage.js';
import { LoginPage } from '../pages/login/LoginPage.js';
import { MePage } from '../pages/me/MePage.js';
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

/** 联系人主页面按 React Router 路由加载，避免拼音词典进入其他页面首包。 */
const ContactsPage = lazy(() => import('../pages/contacts/ContactsPage.js'));
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
/** 群简介只读页按群设置子路由加载，保持聊天主包稳定。 */
const GroupIntroductionPage = lazy(() => import('../pages/chat/GroupIntroductionPage.js'));
/** 群公告只读页按群设置子路由加载，保持聊天主包稳定。 */
const GroupAnnouncementPage = lazy(() => import('../pages/chat/GroupAnnouncementPage.js'));
/** 定时删除选择页按设置子路由加载。 */
const ChatAutoDeletePage = lazy(() => import('../pages/chat/ChatAutoDeletePage.js'));
/** LiveKit 通话页按交互路由加载，避免浏览器媒体引擎进入主列表首包。 */
const ActiveCallPage = lazy(() => import('../pages/calls/ActiveCallPage.js'));

/** Web 应用根组件只负责装配浏览器路由，页面能力由对应 page owner 承担。 */
export function App() {
  return (
    <BrowserRouter>
      <WebIMRuntimeProvider>
        <WebIMCallProvider>
          <AuthOnboardingProvider>
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
            <Route path="/conversations" element={<ConversationsPage />} />
            <Route
              path="/contacts"
              element={(
                <Suspense fallback={<ContactsRouteLoadingState />}>
                  <ContactsPage />
                </Suspense>
              )}
            />
            <Route path="/calls" element={<CallsPage />} />
            <Route path="/me" element={<MePage />} />
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
            path="/conversations/:conversationID/forward"
            element={<ChatForwardTargetPage />}
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
