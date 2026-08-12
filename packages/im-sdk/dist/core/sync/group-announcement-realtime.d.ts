import { type Group, type Message } from '@im28/im-sdk/core';
import type { WebIMSyncContext } from './sync-context.js';
/** type1519 群公告事件的稳定资料补丁。 */
export interface IMGroupAnnouncementRealtimePatch {
    readonly groupID: string;
    readonly announcement: string;
    readonly announcementVersion: string;
    readonly operatorUserID: string;
}
/** 从 canonical type1519 消息解析公告正文、版本和操作者。 */
export declare function parseIMGroupAnnouncementRealtime(message: Message): IMGroupAnnouncementRealtimePatch | null;
/** 顺序应用 type1519 公告补丁并返回实际更新的群快照。 */
export declare function applyIMGroupAnnouncementRealtime(context: WebIMSyncContext, messages: readonly Message[]): Promise<readonly Group[]>;
//# sourceMappingURL=group-announcement-realtime.d.ts.map