/** Shared 群系统消息支持的稳定业务事件。 */
export type IMGroupSystemMessageKind = 'description' | 'send-frequency';
/** 跨端列表和气泡消费的群系统消息展示。 */
export interface IMGroupSystemMessagePresentation {
    readonly kind: IMGroupSystemMessageKind;
    readonly eventType: string;
    readonly text: string;
}
/** 从 canonical、Gateway 或 RN 兼容消息读取结构化群系统文案。 */
export declare function parseIMGroupSystemMessagePresentation(value: unknown, currentUserID?: string): IMGroupSystemMessagePresentation | null;
//# sourceMappingURL=group-system-message.d.ts.map