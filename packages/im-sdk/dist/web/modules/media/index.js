import { IMError } from '../../core/errors.js';
const ALLOWED_ATTACHMENT_TRANSITIONS = new Map([
    ['pending', ['uploading', 'sending', 'failed', 'cancelled']],
    ['uploading', ['uploaded', 'failed', 'cancelled']],
    ['uploaded', ['sending', 'failed', 'cancelled']],
    ['sending', ['sent', 'failed', 'cancelled']],
    ['failed', ['pending', 'uploading', 'sending', 'cancelled']],
    ['sent', []],
    ['cancelled', []],
]);
export function createAttachmentTask(params) {
    const taskID = normalizeRequiredString(params.taskID, 'taskID');
    const conversationID = normalizeRequiredString(params.conversationID, 'conversationID');
    const localPath = normalizeLocalPath(params.localPath);
    const now = params.now ?? Date.now();
    return {
        taskID,
        conversationID,
        kind: params.kind,
        localPath,
        ...(params.fileName?.trim() ? { fileName: params.fileName.trim() } : {}),
        ...(params.mimeType?.trim() ? { mimeType: params.mimeType.trim() } : {}),
        ...(params.size !== undefined ? { size: Math.max(0, params.size) } : {}),
        status: 'pending',
        retryCount: 0,
        createdAt: now,
        updatedAt: now,
    };
}
export function normalizeLocalPath(path) {
    const normalized = path.trim();
    if (!normalized) {
        throw new IMError({
            code: 'ATTACHMENT_LOCAL_PATH_REQUIRED',
            message: 'Attachment localPath is required.',
            source: 'client',
        });
    }
    return normalized.startsWith('file://')
        ? normalized.slice('file://'.length)
        : normalized;
}
export function canTransitionAttachmentTaskStatus(from, to) {
    return ALLOWED_ATTACHMENT_TRANSITIONS.get(from)?.includes(to) ?? false;
}
export function transitionAttachmentTask(task, status, options = {}) {
    if (!canTransitionAttachmentTaskStatus(task.status, status)) {
        throw new IMError({
            code: 'ATTACHMENT_STATUS_TRANSITION_INVALID',
            message: `Cannot transition attachment task from ${task.status} to ${status}.`,
            source: 'client',
        });
    }
    const { errorMessage: _previousErrorMessage, ...taskWithoutError } = task;
    const errorMessage = options.errorMessage?.trim();
    return {
        ...taskWithoutError,
        status,
        ...(options.remoteURL?.trim()
            ? { remoteURL: options.remoteURL.trim() }
            : {}),
        ...(errorMessage ? { errorMessage } : {}),
        retryCount: status === 'pending' && task.status === 'failed'
            ? task.retryCount + 1
            : task.retryCount,
        updatedAt: options.now ?? Date.now(),
    };
}
function normalizeRequiredString(value, key) {
    const normalized = value.trim();
    if (!normalized) {
        throw new IMError({
            code: 'ATTACHMENT_FIELD_REQUIRED',
            message: `${key} is required.`,
            source: 'client',
        });
    }
    return normalized;
}
//# sourceMappingURL=index.js.map