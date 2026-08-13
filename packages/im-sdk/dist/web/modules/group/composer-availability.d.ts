/** 群聊输入区判定使用的平台中立成员角色。 */
export type IMGroupComposerRole = 'owner' | 'admin' | 'member';
/** 群聊输入区判定使用的平台中立群状态。 */
export type IMGroupComposerStatus = 'active' | 'banned' | 'dismissed' | 'muted' | 'unknown';
/** 群聊输入区共享规则所需的最小群与当前成员事实。 */
export interface IMGroupComposerAvailabilityInput {
    readonly status: IMGroupComposerStatus;
    readonly currentUserRole: IMGroupComposerRole;
    readonly muteAll?: boolean;
    readonly muteMember?: boolean;
    readonly userPermission?: unknown;
}
/** 群聊权限尚未从当前账号缓存恢复时禁止提前显示输入控件。 */
export declare const IM_GROUP_COMPOSER_RECOVERING_REASON = "\u6B63\u5728\u6062\u590D\u7FA4\u804A\u72B6\u6001";
/** 权威已加入群列表不再包含目标群时使用的 fail-closed 文案。 */
export declare const IM_GROUP_COMPOSER_MISSING_REASON = "\u7FA4\u804A\u4E0D\u5B58\u5728\u6216\u5DF2\u9000\u51FA\uFF0C\u65E0\u6CD5\u53D1\u6D88\u606F";
/** 无缓存且群权限读取失败时禁止以可发送状态伪装成功。 */
export declare const IM_GROUP_COMPOSER_UNRESOLVED_REASON = "\u7FA4\u804A\u72B6\u6001\u6682\u4E0D\u53EF\u7528\uFF0C\u65E0\u6CD5\u53D1\u6D88\u606F";
/** 按 RN 既有优先级从共享群快照计算输入区不可用原因。 */
export declare function resolveIMGroupComposerUnavailableReason(input: IMGroupComposerAvailabilityInput): string;
//# sourceMappingURL=composer-availability.d.ts.map