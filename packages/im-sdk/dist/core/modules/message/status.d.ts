import type { MessageStatus } from '../../core/types.js';
export declare function canTransitionMessageStatus(from: MessageStatus, to: MessageStatus): boolean;
export declare function assertMessageStatusTransition(from: MessageStatus, to: MessageStatus): void;
export declare function isTerminalMessageStatus(status: MessageStatus): boolean;
//# sourceMappingURL=status.d.ts.map