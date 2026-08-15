import { lazy, Suspense } from 'react';
import { Navigate, Route } from 'react-router-dom';

import { CallDetailPage } from '../pages/calls/CallDetailPage.js';
import { ContactFriendApplicationPage } from '../pages/contacts/ContactFriendApplicationPage.js';
import { ContactProfilePage } from '../pages/contacts/ContactProfilePage.js';
import { ContactSearchPage } from '../pages/contacts/ContactSearchPage.js';
import { GroupApplicationsPage } from '../pages/contacts/GroupApplicationsPage.js';
import { JoinedGroupsPage } from '../pages/contacts/JoinedGroupsPage.js';
import { VerificationMessagesPage } from '../pages/contacts/VerificationMessagesPage.js';
import { AccountRegisterPage } from '../pages/login/AccountRegisterPage.js';
import { AuthCompleteProfilePage } from '../pages/login/AuthCompleteProfilePage.js';
import { AuthInvitePage } from '../pages/login/AuthInvitePage.js';
import { AuthOnboardingProfileEditorPage } from '../pages/login/AuthOnboardingProfileEditorPage.js';
import { LoginPage } from '../pages/login/LoginPage.js';
import { MeBlacklistPage } from '../pages/me/MeBlacklistPage.js';
import { MeDisplaySettingsPage } from '../pages/me/MeDisplaySettingsPage.js';
import { MeNotificationSettingsPage } from '../pages/me/MeNotificationSettingsPage.js';
import { MePermissionSettingsPage } from '../pages/me/MePermissionSettingsPage.js';
import { MeProfileEditorPage } from '../pages/me/MeProfileEditorPage.js';
import { MeProfilePage } from '../pages/me/MeProfilePage.js';
import { MeSecurityCredentialPage } from '../pages/me/MeSecurityCredentialPage.js';
import { MeSecurityPage } from '../pages/me/MeSecurityPage.js';
import { MeSettingsPage } from '../pages/me/MeSettingsPage.js';
import { MeTermsPage } from '../pages/me/MeTermsPage.js';
import { PrimaryTabsLayout } from './PrimaryTabsLayout.js';

/** 好友名片选择页按动作路由加载，不进入通讯录和主路由首包。 */
const ContactCardSharePage = lazy(() => import('../pages/contacts/ContactCardSharePage.js'));
/** 共同群聊按资料子路由加载，不进入联系人主列表首包。 */
const ContactCommonGroupsPage = lazy(() => import('../pages/contacts/ContactCommonGroupsPage.js'));
/** 首页会话搜索按独立路由加载，保持主列表首包稳定。 */
const ConversationSearchPage = lazy(() => import('../pages/conversations/ConversationSearchPage.js'));
/** 归档会话按独立路由加载，保持主列表首包稳定。 */
const ArchivedConversationsPage = lazy(() => import('../pages/conversations/ArchivedConversationsPage.js'));
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
/** 二维码应用内分享页按确认动作路由加载，不进入展示页首包。 */
const QRCodeSharePage = lazy(() => import('../pages/qr/QRCodeSharePage.js'));

/** 输出登录、主 Tab、联系人、通话与个人中心路由，供唯一根路由树组合。 */
export function renderCoreRoutes() {
  return (
    <>
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
        <Route path="/conversations" element={<></>} />
        <Route path="/contacts" element={<></>} />
        <Route path="/calls" element={<></>} />
        <Route path="/me" element={<></>} />
      </Route>
      <Route path="/conversations/search" element={<Suspense fallback={<ConversationSearchRouteLoadingState />}><ConversationSearchPage /></Suspense>} />
      <Route path="/conversations/archived" element={<Suspense fallback={<ConversationArchiveRouteLoadingState />}><ArchivedConversationsPage /></Suspense>} />
      <Route path="/calls/active" element={<Suspense fallback={<CallRouteLoadingState />}><ActiveCallPage /></Suspense>} />
      <Route path="/calls/:callID" element={<CallDetailPage />} />
      <Route path="/contacts/verifications" element={<Navigate to="/contacts/verifications/friend" replace />} />
      <Route path="/contacts/verifications/:tab" element={<VerificationMessagesPage />} />
      <Route path="/contacts/friend-applications" element={<Navigate to="/contacts/verifications/friend" replace />} />
      <Route path="/contacts/group-applications" element={<Navigate to="/contacts/verifications/group" replace />} />
      <Route path="/contacts/group-applications/:groupID" element={<GroupApplicationsPage />} />
      <Route path="/contacts/groups" element={<JoinedGroupsPage />} />
      <Route path="/groups/create" element={<Suspense fallback={<ContactsRouteLoadingState />}><CreateGroupPage /></Suspense>} />
      <Route path="/groups/search" element={<Suspense fallback={<ContactsRouteLoadingState />}><GroupSearchPage /></Suspense>} />
      <Route path="/broadcast/select" element={<Suspense fallback={<ContactsRouteLoadingState />}><BroadcastTargetSelectPage /></Suspense>} />
      <Route path="/broadcast/compose" element={<Suspense fallback={<ContactsRouteLoadingState />}><BroadcastComposePage /></Suspense>} />
      <Route path="/scan" element={<Suspense fallback={<ContactsRouteLoadingState />}><QRCodeScanPage /></Suspense>} />
      <Route path="/groups/:groupID/apply" element={<Suspense fallback={<ContactsRouteLoadingState />}><GroupQRCodeApplyPage /></Suspense>} />
      <Route path="/me/qrcode" element={<Suspense fallback={<ContactsRouteLoadingState />}><ProfileQRCodePage /></Suspense>} />
      <Route path="/me/qrcode/share" element={<Suspense fallback={<ContactsRouteLoadingState />}><QRCodeSharePage kind="user" /></Suspense>} />
      <Route path="/contacts/search" element={<ContactSearchPage />} />
      <Route path="/contacts/users/:userID/share" element={<Suspense fallback={<ContactsRouteLoadingState />}><ContactCardSharePage /></Suspense>} />
      <Route path="/contacts/users/:userID" element={<ContactProfilePage />} />
      <Route path="/contacts/users/:userID/groups" element={<Suspense fallback={<ContactsRouteLoadingState />}><ContactCommonGroupsPage /></Suspense>} />
      <Route path="/contacts/users/:userID/add" element={<ContactFriendApplicationPage />} />
      <Route path="/me/settings" element={<MeSettingsPage />} />
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
    </>
  );
}

/** LiveKit route chunk 加载期间保持明确通话状态。 */
function CallRouteLoadingState() {
  return <main className="rn-calls-page-state" aria-busy="true"><strong>正在加载通话</strong></main>;
}

/** 首页会话搜索路由块下载期间保持明确状态。 */
function ConversationSearchRouteLoadingState() {
  return <main className="rn-conversation-search-state" aria-busy="true"><strong>正在加载搜索</strong></main>;
}

/** 归档会话路由块下载期间保持明确状态。 */
function ConversationArchiveRouteLoadingState() {
  return <main className="rn-conversation-page-state" aria-busy="true"><strong>正在加载归档会话</strong></main>;
}

/** 联系人路由块下载期间保持明确且可访问的页面状态。 */
function ContactsRouteLoadingState() {
  return <main className="rn-contacts-page-state" aria-busy="true"><strong>正在加载通讯录</strong></main>;
}
