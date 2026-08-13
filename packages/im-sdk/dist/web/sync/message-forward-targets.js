import { forwardWebIMMessages } from './message-forward.js';
import { createWebIMSyncError } from './sync-context.js';
/** Gateway 批量目标能力允许的最大转发目标数。 */
export const IM_FORWARD_MAX_TARGETS = 50;
/** 在 shared owner 内复用现有单目标状态机，逐目标收敛真实转发结果。 */
export async function forwardWebIMMessagesToTargets(context, options, dependencies) {
    /** conversationIDs 在任何落库前完成去空白、去重和上限校验。 */
    const conversationIDs = normalizeForwardConversationIDs(options.conversationIDs);
    /** targets 保持用户首次选择顺序并独立记录部分失败。 */
    const targets = [];
    for (const conversationID of conversationIDs) {
        try {
            /** result 完整复用既有来源重读、乐观实体和 Gateway 收敛。 */
            const result = await forwardWebIMMessages(context, {
                conversationID,
                sourceClientMsgIDs: options.sourceClientMsgIDs,
                ...(options.hideSenderName ? { hideSenderName: true } : {}),
                ...(options.comment?.trim() ? { comment: options.comment } : {}),
                ...(options.onSending ? { onSending: options.onSending } : {}),
            }, dependencies);
            /** failedCount 按转发项和附言的最终状态判断该目标是否完整成功。 */
            const failedCount = countFailedForwardItems(result);
            targets.push({
                conversationID,
                result,
                ...(failedCount ? { error: `${failedCount} forwarded messages failed.` } : {}),
            });
        }
        catch (cause) {
            targets.push({
                conversationID,
                error: cause instanceof Error && cause.message
                    ? cause.message
                    : 'Forwarding to the target failed.',
            });
        }
    }
    /** successCount 只统计取得真实结果的目标。 */
    const successCount = targets.filter(target => Boolean(target.result) && !target.error).length;
    return {
        successCount,
        failedCount: targets.length - successCount,
        targets,
    };
}
/** 统计一个目标内显式 error 或 failed 状态的转发项。 */
function countFailedForwardItems(result) {
    /** items 同时覆盖来源消息和可选附言。 */
    const items = result.comment ? [...result.list, result.comment] : result.list;
    return items.filter(item => Boolean(item.error) || item.message.status === 'failed').length;
}
/** 规范多目标会话身份并在副作用前拒绝空集合或超限。 */
export function normalizeForwardConversationIDs(values) {
    /** conversationIDs 保留首次出现顺序。 */
    const conversationIDs = Array.from(new Set(values.map(value => value.trim()).filter(Boolean)));
    if (!conversationIDs.length || conversationIDs.length > IM_FORWARD_MAX_TARGETS) {
        throw createWebIMSyncError('INVALID_FORWARD_TARGET_COUNT', `Forwarding requires between 1 and ${IM_FORWARD_MAX_TARGETS} target conversations.`);
    }
    return conversationIDs;
}
//# sourceMappingURL=message-forward-targets.js.map