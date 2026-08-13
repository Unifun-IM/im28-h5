/** 单聊关系判定可接受的服务端好友关系事实。 */
export type IMDirectChatPeerRelationship = 'self' | 'friend' | 'stranger';
/** 单聊聊天页最终消费的关系状态。 */
export type IMDirectChatRelationshipStatus = 'recovering' | 'unresolved' | 'friend' | 'stranger' | 'blocked-by-me';
/** 单聊关系投影所需的最小真实事实。 */
export interface IMDirectChatRelationshipInput {
    readonly relationship: IMDirectChatPeerRelationship;
    readonly blockedByMe: boolean;
}
/** 单聊页面共享的输入区与消息列表底部投影。 */
export interface IMDirectChatRelationshipPresentation {
    readonly status: IMDirectChatRelationshipStatus;
    readonly composerUnavailableReason: string;
    readonly noticeText: string;
    readonly noticeActionLabel: string;
}
/** RN 当前黑名单输入区文案，保持跨端单一维护。 */
export declare const IM_DIRECT_CHAT_BLOCKED_BY_ME_REASON = "\u4F60\u5DF2\u5C06\u5BF9\u65B9\u52A0\u5165\u9ED1\u540D\u5355,\u4F60\u4EEC\u65E0\u6CD5\u6536\u5230\u5BF9\u65B9\u7684\u6D88\u606F";
/** RN 当前陌生人关系提示，语义是好友关系不成立而非反向黑名单。 */
export declare const IM_DIRECT_CHAT_STRANGER_NOTICE = "\u4F60\u8FD8\u4E0D\u662F\u5BF9\u65B9\u597D\u53CB\uFF0C\u8BF7\u5148\u53D1\u9001\u670B\u53CB\u9A8C\u8BC1\u8BF7\u6C42\uFF0C\u5BF9\u65B9\u9A8C\u8BC1\u901A\u8FC7\u540E\uFF0C\u624D\u80FD\u804A\u5929\u3002";
/** RN 当前陌生人关系动作标签。 */
export declare const IM_DIRECT_CHAT_STRANGER_ACTION_LABEL = "\u7533\u8BF7\u6DFB\u52A0\u670B\u53CB";
/** 单聊关系首轮真实读取完成前的输入区提示。 */
export declare const IM_DIRECT_CHAT_RELATIONSHIP_RECOVERING_REASON = "\u6B63\u5728\u6062\u590D\u8054\u7CFB\u4EBA\u5173\u7CFB";
/** 单聊关系无可用事实时的保守输入区提示。 */
export declare const IM_DIRECT_CHAT_RELATIONSHIP_UNRESOLVED_REASON = "\u8054\u7CFB\u4EBA\u5173\u7CFB\u6682\u4E0D\u53EF\u7528\uFF0C\u65E0\u6CD5\u53D1\u6D88\u606F";
/** 单聊关系读取中的 fail-closed 页面投影。 */
export declare const IM_DIRECT_CHAT_RELATIONSHIP_RECOVERING_PRESENTATION: IMDirectChatRelationshipPresentation;
/** 单聊关系读取失败且无旧事实时的 fail-closed 页面投影。 */
export declare const IM_DIRECT_CHAT_RELATIONSHIP_UNRESOLVED_PRESENTATION: IMDirectChatRelationshipPresentation;
/** 按 RN 优先级将我方黑名单与好友关系投影为聊天页状态。 */
export declare function resolveIMDirectChatRelationshipPresentation(input: IMDirectChatRelationshipInput): IMDirectChatRelationshipPresentation;
/** 识别 Gateway/OpenIM 返回的好友关系失效发送错误。 */
export declare function isIMFriendRelationshipSendError(cause: unknown): boolean;
//# sourceMappingURL=direct-chat-relationship.d.ts.map