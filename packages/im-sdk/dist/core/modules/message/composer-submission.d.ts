/** Composer 一次提交允许执行的跨端消息步骤。 */
export type IMComposerSubmissionStep = 'media' | 'file' | 'text';
/** 构建跨端 Composer 提交顺序所需的最小事实。 */
export interface IMComposerSubmissionInput {
    readonly text: string;
    readonly hasPendingMedia: boolean;
    readonly hasPendingFile: boolean;
    readonly editing: boolean;
}
/** 固定一次 Composer 提交的裁剪文本和串行步骤。 */
export interface IMComposerSubmissionPlan {
    readonly text: string;
    readonly steps: readonly IMComposerSubmissionStep[];
}
/** 判断相册结果是否应等待用户与现有草稿一起提交。 */
export declare function shouldStageIMComposerMedia(draft: string, mediaCount: number): boolean;
/** 对齐 RN 的媒体、文件、文本顺序并拒绝编辑态附件。 */
export declare function createIMComposerSubmissionPlan(input: IMComposerSubmissionInput): IMComposerSubmissionPlan;
//# sourceMappingURL=composer-submission.d.ts.map