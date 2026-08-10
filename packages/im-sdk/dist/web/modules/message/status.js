import { IMError } from '../../core/errors.js';
const MESSAGE_STATUS_ORDER = {
    pending: ['sending', 'failed', 'deleted_local'],
    sending: ['sent', 'failed', 'deleted_local'],
    sent: ['revoked', 'deleted_local'],
    failed: ['pending', 'sending', 'deleted_local'],
    received: ['revoked', 'deleted_local'],
    revoked: ['deleted_local'],
    deleted_local: [],
};
export function canTransitionMessageStatus(from, to) {
    return from === to || MESSAGE_STATUS_ORDER[from].includes(to);
}
export function assertMessageStatusTransition(from, to) {
    if (canTransitionMessageStatus(from, to)) {
        return;
    }
    throw new IMError({
        code: 'MESSAGE_STATUS_TRANSITION_INVALID',
        message: `Cannot transition message status from ${from} to ${to}.`,
        source: 'client',
    });
}
export function isTerminalMessageStatus(status) {
    return MESSAGE_STATUS_ORDER[status].length === 0;
}
//# sourceMappingURL=status.js.map