/** 判断相册结果是否应等待用户与现有草稿一起提交。 */
export function shouldStageIMComposerMedia(draft, mediaCount) {
    return draft.trim().length > 0 && mediaCount === 1;
}
/** 对齐 RN 的媒体、文件、文本顺序并拒绝编辑态附件。 */
export function createIMComposerSubmissionPlan(input) {
    // text 与 RN 一致在提交边界裁剪两端空白。
    const text = input.text.trim();
    if (input.editing && (input.hasPendingMedia || input.hasPendingFile)) {
        throw new Error('编辑消息时不能同时发送附件');
    }
    if (!text && !input.hasPendingMedia && !input.hasPendingFile) {
        throw new Error('没有可发送的消息内容');
    }
    // steps 固定跨端可观测的消息发送顺序。
    const steps = [];
    if (input.hasPendingMedia)
        steps.push('media');
    if (input.hasPendingFile)
        steps.push('file');
    if (text)
        steps.push('text');
    return { text, steps };
}
//# sourceMappingURL=composer-submission.js.map