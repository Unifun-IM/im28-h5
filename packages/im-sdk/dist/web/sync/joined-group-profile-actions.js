import { createWebIMSyncError, requireWebIMSyncContext } from './sync-context.js';
import { requireIMGroupProfileUpdateAccess, updateIMGroupAvatar, updateIMGroupIntroduction, updateIMGroupName, } from './group-profile-update.js';
/** 更新群昵称并只在 Gateway 成功后收敛当前群缓存。 */
export function updateIMJoinedGroupName(dependencies, groupID, name, project) {
    // operation 在共享队列执行时冻结账号和数据库。
    const operation = async () => {
        // context 拒绝匿名和未打开账号库。
        const context = requireWebIMSyncContext(dependencies, 'Group name update');
        // updated 由群资料模块完成权限、响应匹配和 success-only upsert。
        const updated = await updateIMGroupName(context, { groupID, name }, dependencies.gatewayClient);
        return project(updated, context.userID);
    };
    // queue 防止群列表刷新和资料更新交错覆盖。
    const queue = dependencies.mutationQueue;
    return queue ? queue.enqueue(operation) : operation();
}
/** 上传群头像后在共享写队列内收敛远端群资料。 */
export async function updateIMJoinedGroupAvatar(dependencies, groupID, input, project) {
    // context 在上传前冻结当前账号数据库和身份。
    const context = requireWebIMSyncContext(dependencies, 'Group avatar update');
    // normalizedInput 在任何平台 I/O 前执行图片格式和大小约束。
    const normalizedInput = normalizeGroupAvatarUploadInput(input);
    // 权限预检阻止普通成员产生无法使用的 OSS 对象。
    await requireIMGroupProfileUpdateAccess(context, groupID);
    // uploadPort 缺失必须可见失败，禁止用 blob URL 伪造远端头像。
    const uploadPort = dependencies.mediaUploadPort;
    if (!uploadPort) {
        throw createWebIMSyncError('GROUP_AVATAR_UPLOAD_UNAVAILABLE', 'Group avatar update requires a platform upload adapter.');
    }
    // uploaded 在写队列外完成，避免阻塞消息和群缓存 mutation。
    const uploaded = await uploadPort.upload(normalizedInput);
    // operation 只串行 Gateway mutation 与 groups cache mutation。
    const operation = async () => {
        // updated 复用 shared 权限、响应匹配和 success-only upsert。
        const updated = await updateIMGroupAvatar(context, { groupID, avatarURL: uploaded.url }, dependencies.gatewayClient);
        return project(updated, context.userID);
    };
    // queue 阻止群刷新和头像写回交错覆盖。
    const queue = dependencies.mutationQueue;
    return queue ? queue.enqueue(operation) : operation();
}
/** 更新群简介并只在 Gateway 精确成功后收敛当前群缓存。 */
export function updateIMJoinedGroupIntroduction(dependencies, groupID, introduction, project) {
    // operation 在共享队列执行时冻结账号和数据库。
    const operation = async () => {
        // context 拒绝匿名和未打开账号库。
        const context = requireWebIMSyncContext(dependencies, 'Group introduction update');
        // updated 由 shared 群资料 owner 完成校验、权限和 success-only upsert。
        const updated = await updateIMGroupIntroduction(context, { groupID, introduction }, dependencies.gatewayClient);
        return project(updated, context.userID);
    };
    // queue 防止群列表刷新和简介写回交错覆盖。
    const queue = dependencies.mutationQueue;
    return queue ? queue.enqueue(operation) : operation();
}
/** 群头像上传仅接受裁剪后的常见静态图片和 10MB 上限。 */
function normalizeGroupAvatarUploadInput(input) {
    // mimeType 必须与浏览器/RN 上传端口声明一致。
    const mimeType = input.mimeType.trim().toLowerCase();
    // extension 防止 SVG 或可执行内容伪装为头像。
    const extension = input.extension.trim().toLowerCase();
    // size 必须是正整数且不超过图片消息同一安全上限。
    const size = Math.trunc(input.size);
    if (!input.name.trim() || input.source === null || input.source === undefined) {
        throw createWebIMSyncError('GROUP_AVATAR_SOURCE_INVALID', 'Select a group avatar image.');
    }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(mimeType) ||
        !['jpg', 'jpeg', 'png', 'webp'].includes(extension)) {
        throw createWebIMSyncError('GROUP_AVATAR_TYPE_INVALID', 'Group avatars support JPEG, PNG, or WEBP images.');
    }
    if (!Number.isFinite(input.size) || size <= 0 || size > 10 * 1024 * 1024) {
        throw createWebIMSyncError('GROUP_AVATAR_SIZE_INVALID', 'Group avatar image cannot exceed 10MB.');
    }
    return { ...input, name: input.name.trim(), mimeType, extension, size };
}
//# sourceMappingURL=joined-group-profile-actions.js.map