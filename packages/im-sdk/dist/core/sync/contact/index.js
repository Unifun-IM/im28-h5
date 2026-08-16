/** 创建跨端黑名单 facade，并保留已发布的 Web 兼容名称。 */
export { createIMBlacklistSync, createWebIMBlacklistSync } from './blacklist-sync.js';
/** 创建不复制资料或黑名单 owner 的单聊关系组合 facade。 */
export { createIMDirectChatRelationshipSync } from './direct-chat-relationship-sync.js';
/** 判断 realtime 通知是否要求重新读取好友、验证与黑名单事实。 */
export { isIMRelationshipRealtimeEvent, isIMVerificationRealtimeEvent, } from './relationship-realtime.js';
/** 创建跨端通讯录读取 facade，并保留已发布的 Web 兼容名称。 */
export { createIMContactSync, createWebIMContactSync } from './contact-sync.js';
/** 创建 RN、Web、Desktop 共用的联系人写动作 facade。 */
export { createIMContactActionsSync } from './contact-actions.js';
/** 创建跨端好友申请 facade，并保留已发布的 Web 兼容名称。 */
export { createIMFriendApplicationSync, createWebIMFriendApplicationSync, } from './friend-application-sync.js';
/** 导出跨端统一的好友来源码、推断和展示规则。 */
export { formatIMFriendSourceType, IM_FRIEND_SOURCE_TYPE_EMAIL, IM_FRIEND_SOURCE_TYPE_GROUP, IM_FRIEND_SOURCE_TYPE_PHONE, IM_FRIEND_SOURCE_TYPE_USER_ID, inferIMFriendSourceTypeFromKeyword, } from './friend-source.js';
/** 创建联系人资料 facade，并保留已发布的 Web 兼容名称。 */
export { createIMPeerProfileSync, createWebIMPeerProfileSync } from './peer-profile-sync.js';
/** 导出 RN、Web、Desktop 共用的群成员名称优先级投影。 */
export { resolveIMGroupMemberDisplayName } from './sender-display-name.js';
//# sourceMappingURL=index.js.map