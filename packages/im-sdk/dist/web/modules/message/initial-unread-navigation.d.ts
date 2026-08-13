import type { Message } from '../../core/types.js';
/** 初始未读导航向各端暴露的稳定消息身份。 */
export interface IMInitialUnreadNavigation {
    readonly unreadMessageIDs: readonly string[];
    readonly firstUnreadMessageID?: string;
    readonly lastReadMessageID?: string;
}
/** 按从旧到新的消息顺序计算跨端一致的初始未读边界。 */
export declare function getIMInitialUnreadNavigation(messages: readonly Message[], lastReadSeq: string | undefined): IMInitialUnreadNavigation;
/** 返回当前可见身份中严格越过已读边界的最高 incoming 消息序列。 */
export declare function getIMVisibleUnreadReadSeq(messages: readonly Message[], readSeq: string | undefined, visibleMessageIDs: ReadonlySet<string>): string | undefined;
//# sourceMappingURL=initial-unread-navigation.d.ts.map