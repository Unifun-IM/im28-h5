import { type GatewayHTTPClient, type Group } from '@im28/im-sdk/core';
import { type WebIMSyncContext } from './sync-context.js';
/** 群公告正文沿用 RN 既有 1000 字上限。 */
export declare const IM_GROUP_ANNOUNCEMENT_MAX_LENGTH = 1000;
/** 群公告发布使用稳定群、会话和正文身份。 */
export interface IMPublishGroupAnnouncementOptions {
    readonly groupID: string;
    readonly conversationID: string;
    readonly announcement: string;
}
/** 公告文本消息端口复用各端既有 shared message facade。 */
export interface IMGroupAnnouncementMessagePort<MessageResult> {
    readonly onGroupUpdated?: (group: Group) => void | Promise<void>;
    sendText(options: {
        readonly conversationID: string;
        readonly text: string;
    }): Promise<MessageResult>;
}
/** 公告发布结果显式携带已更新群和已发送消息。 */
export interface IMPublishGroupAnnouncementResult<MessageResult> {
    readonly group: Group;
    readonly message: MessageResult;
}
/** 公告版本已读状态禁止用缺省 true 伪造成功。 */
export interface IMGroupAnnouncementReadStatus {
    readonly announcementVersion: string;
    readonly announcementReadVersion: string;
    readonly isRead: boolean;
}
/** 发布公告时先持久化 Gateway 公告，再发送 RN 约定的公告文本消息。 */
export declare function publishIMGroupAnnouncement<MessageResult>(context: WebIMSyncContext, options: IMPublishGroupAnnouncementOptions, gatewayClient: GatewayHTTPClient, messagePort: IMGroupAnnouncementMessagePort<MessageResult>): Promise<IMPublishGroupAnnouncementResult<MessageResult>>;
/** 查询当前公告版本并按服务端布尔值更新本地已读快照。 */
export declare function getIMGroupAnnouncementReadStatus(context: WebIMSyncContext, groupID: string, gatewayClient: GatewayHTTPClient): Promise<IMGroupAnnouncementReadStatus>;
/** 标记用户实际看到的版本后再查询权威状态，避免旧版本清除新公告未读。 */
export declare function markIMGroupAnnouncementRead(context: WebIMSyncContext, groupID: string, announcementVersion: string, gatewayClient: GatewayHTTPClient): Promise<IMGroupAnnouncementReadStatus>;
/** 公告更新权限优先使用显式 capability，旧快照仅群主可编辑。 */
export declare function requireIMGroupAnnouncementUpdateAccess(context: WebIMSyncContext, groupID: string): Promise<Group>;
/** 判断当前账号是否具备公告编辑权限。 */
export declare function canUpdateIMGroupAnnouncement(payload: Record<string, unknown>): boolean;
/** 构造 RN 既有群公告文本消息正文。 */
export declare function buildIMGroupAnnouncementMessageText(announcement: string): string;
//# sourceMappingURL=group-announcement.d.ts.map