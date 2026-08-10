import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { ChatPage } from '../pages/chat/ChatPage.js';
import { ConversationsPage } from '../pages/conversations/ConversationsPage.js';
import { ContactsPage } from '../pages/contacts/ContactsPage.js';
import { ContactFriendApplicationPage } from '../pages/contacts/ContactFriendApplicationPage.js';
import { ContactProfilePage } from '../pages/contacts/ContactProfilePage.js';
import { ContactSearchPage } from '../pages/contacts/ContactSearchPage.js';
import { FriendApplicationsPage } from '../pages/contacts/FriendApplicationsPage.js';
import { GroupApplicationsPage } from '../pages/contacts/GroupApplicationsPage.js';
import { GroupVerificationPage } from '../pages/contacts/GroupVerificationPage.js';
import { JoinedGroupsPage } from '../pages/contacts/JoinedGroupsPage.js';
import { CallsPage } from '../pages/calls/CallsPage.js';
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
import { WebIMRuntimeProvider } from '../runtime/index.js';
import { PrimaryTabsLayout } from './PrimaryTabsLayout.js';

/** Web 应用根组件只负责装配浏览器路由，页面能力由对应 page owner 承担。 */
export function App() {
  return (
    <BrowserRouter>
      <WebIMRuntimeProvider>
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
            <Route path="/contacts" element={<ContactsPage />} />
            <Route path="/calls" element={<CallsPage />} />
            <Route path="/me" element={<MePage />} />
          </Route>
          <Route path="/me/settings" element={<MeSettingsPage />} />
          <Route path="/contacts/friend-applications" element={<FriendApplicationsPage />} />
          <Route path="/contacts/group-applications" element={<GroupVerificationPage />} />
          <Route path="/contacts/group-applications/:groupID" element={<GroupApplicationsPage />} />
          <Route path="/contacts/groups" element={<JoinedGroupsPage />} />
          <Route path="/contacts/search" element={<ContactSearchPage />} />
          <Route path="/contacts/users/:userID" element={<ContactProfilePage />} />
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
          <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AuthOnboardingProvider>
      </WebIMRuntimeProvider>
    </BrowserRouter>
  );
}
