export type AttachmentKind = 'image' | 'video' | 'audio' | 'file';
export type AttachmentTaskStatus = 'pending' | 'uploading' | 'uploaded' | 'sending' | 'sent' | 'failed' | 'cancelled';
export interface AttachmentTask {
    readonly taskID: string;
    readonly conversationID: string;
    readonly kind: AttachmentKind;
    readonly localPath: string;
    readonly fileName?: string;
    readonly mimeType?: string;
    readonly size?: number;
    readonly remoteURL?: string;
    readonly status: AttachmentTaskStatus;
    readonly retryCount: number;
    readonly createdAt: number;
    readonly updatedAt: number;
    readonly errorMessage?: string;
}
export interface CreateAttachmentTaskParams {
    readonly taskID: string;
    readonly conversationID: string;
    readonly kind: AttachmentKind;
    readonly localPath: string;
    readonly fileName?: string;
    readonly mimeType?: string;
    readonly size?: number;
    readonly now?: number;
}
export declare function createAttachmentTask(params: CreateAttachmentTaskParams): AttachmentTask;
export declare function normalizeLocalPath(path: string): string;
export declare function canTransitionAttachmentTaskStatus(from: AttachmentTaskStatus, to: AttachmentTaskStatus): boolean;
export declare function transitionAttachmentTask(task: AttachmentTask, status: AttachmentTaskStatus, options?: {
    readonly now?: number;
    readonly remoteURL?: string;
    readonly errorMessage?: string;
}): AttachmentTask;
//# sourceMappingURL=index.d.ts.map