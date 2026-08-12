/** 通过群聊页面添加好友时使用的来源码。 */
export declare const IM_FRIEND_SOURCE_TYPE_GROUP = "group";
/** 通过用户 ID 添加好友时使用的来源码。 */
export declare const IM_FRIEND_SOURCE_TYPE_USER_ID = "user_id";
/** 通过手机号添加好友时使用的来源码。 */
export declare const IM_FRIEND_SOURCE_TYPE_PHONE = "phone";
/** 通过邮箱添加好友时使用的来源码。 */
export declare const IM_FRIEND_SOURCE_TYPE_EMAIL = "email";
/** 按邮箱、手机号、其他搜索词推断好友申请来源码。 */
export declare function inferIMFriendSourceTypeFromKeyword(keyword: string): string;
/** 将 Gateway 来源码或历史自由文本转换为各端一致的可见文案。 */
export declare function formatIMFriendSourceType(sourceType: unknown, fallback?: string): string;
//# sourceMappingURL=friend-source.d.ts.map