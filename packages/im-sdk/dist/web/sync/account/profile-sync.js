import { createWebIMSyncError } from '../sync-context.js';
/** 创建不暴露 token 的当前账号资料 facade。 */
export function createIMProfileSync(dependencies) {
    /** 在远端资料操作前统一拒绝匿名调用。 */
    const requireAuthenticatedUser = () => {
        // userID 同时作为远端响应和跨上传阶段的账号边界。
        const userID = dependencies.getCurrentUserID()?.trim() ?? '';
        if (!userID) {
            throw createWebIMSyncError('PROFILE_AUTH_REQUIRED', 'Current user profile requires an authenticated Web IM session.');
        }
        return userID;
    };
    /** 校验资料响应属于发起 mutation 的同一认证账号。 */
    const requireMatchingProfile = (userID, updated) => {
        if (updated.user_id?.trim() !== userID) {
            throw createWebIMSyncError('PROFILE_RESPONSE_MISMATCH', 'Updated profile does not match the authenticated user.');
        }
        return updated;
    };
    /** 通过平台端口上传头像，并拒绝上传阶段账号切换或非远端地址。 */
    const uploadAvatarForUser = async (userID, input) => {
        // uploadPort 缺失必须可见失败，禁止返回 blob URL 或假成功地址。
        const uploadPort = dependencies.mediaUploadPort;
        if (!uploadPort) {
            throw createWebIMSyncError('PROFILE_AVATAR_UPLOAD_UNAVAILABLE', 'Profile avatar upload requires a platform upload adapter.');
        }
        // normalizedInput 在 OSS I/O 前执行头像格式与大小约束。
        const normalizedInput = normalizeWebIMProfileAvatarInput(input);
        // uploaded 只能来自当前 runtime 注入的真实媒体上传端口。
        const uploaded = await uploadPort.upload(normalizedInput);
        if (dependencies.getCurrentUserID()?.trim() !== userID) {
            throw createWebIMSyncError('PROFILE_ACCOUNT_CHANGED', 'Authenticated user changed while uploading the profile avatar.');
        }
        // avatarURL 必须是可提交到 Gateway 的远端 HTTP(S) 地址。
        const avatarURL = uploaded.url.trim();
        if (!/^https?:\/\//i.test(avatarURL)) {
            throw createWebIMSyncError('PROFILE_AVATAR_URL_INVALID', 'Profile avatar upload did not return a remote URL.');
        }
        return avatarURL;
    };
    return {
        getCurrent: async () => {
            requireAuthenticatedUser();
            return dependencies.gatewayClient.getCurrentUserDetail();
        },
        update: async (patch) => {
            // userID 冻结本次资料 mutation 的账号身份。
            const userID = requireAuthenticatedUser();
            // updated 必须回显同一账号，避免切号或错误响应污染页面状态。
            const updated = await dependencies.gatewayClient.updateUserProfile(normalizeWebIMProfileUpdate(patch));
            return requireMatchingProfile(userID, updated);
        },
        saveContact: async (input) => {
            // userID 冻结联系人读取与 mutation 的账号边界。
            const userID = requireAuthenticatedUser();
            // normalized 在任何网络 mutation 前收敛联系方式和验证码。
            const normalized = normalizeWebIMProfileContact(input);
            // current 决定首次绑定或换绑，客户端不得重复维护分流规则。
            const current = requireMatchingProfile(userID, await dependencies.gatewayClient.getCurrentUserDetail());
            // existing 只读取当前联系方式类型的远端真实值。
            const existing = String(current[normalized.kind] ?? '').trim();
            if (existing && existing.toLowerCase() === normalized.account.toLowerCase()) {
                throw createWebIMSyncError('PROFILE_CONTACT_UNCHANGED', 'New profile contact must differ from the current contact.');
            }
            if (!existing) {
                // updated 只有首次绑定接口成功并回显同一账号后才可返回。
                const updated = await dependencies.gatewayClient.bindContact({
                    type: normalized.kind,
                    account: normalized.account,
                    verification_code: normalized.verificationCode,
                    ...(normalized.kind === 'phone' ? { phone_area_code: normalized.phoneAreaCode } : {}),
                });
                return { mode: 'bind', profile: requireMatchingProfile(userID, updated) };
            }
            // updated 由联系方式类型选择唯一换绑接口。
            const updated = normalized.kind === 'phone'
                ? await dependencies.gatewayClient.updatePhone({
                    phone: normalized.account,
                    phone_area_code: normalized.phoneAreaCode,
                    verification_code: normalized.verificationCode,
                })
                : await dependencies.gatewayClient.updateEmail({
                    email: normalized.account,
                    verification_code: normalized.verificationCode,
                });
            return { mode: 'update', profile: requireMatchingProfile(userID, updated) };
        },
        uploadAvatar: async (input) => {
            // userID 在任何平台上传前冻结，防止结果被后续账号使用。
            const userID = requireAuthenticatedUser();
            return uploadAvatarForUser(userID, input);
        },
        updateAvatar: async (input) => {
            // userID 贯穿上传和资料 mutation，避免客户端分步编排产生切号窗口。
            const userID = requireAuthenticatedUser();
            // avatarURL 只来自同一账号完成的平台上传。
            const avatarURL = await uploadAvatarForUser(userID, input);
            if (dependencies.getCurrentUserID()?.trim() !== userID) {
                throw createWebIMSyncError('PROFILE_ACCOUNT_CHANGED', 'Authenticated user changed before updating the profile avatar.');
            }
            // updated 只有远端资料明确回显原账号时才作为成功返回。
            const updated = await dependencies.gatewayClient.updateUserProfile({ avatar_url: avatarURL });
            return { ...requireMatchingProfile(userID, updated), avatar_url: updated.avatar_url?.trim() || avatarURL };
        },
    };
}
/** 兼容已发布的 Web 命名；实现与 createIMProfileSync 相同。 */
export const createWebIMProfileSync = createIMProfileSync;
/** 归一化联系方式并在 Gateway mutation 前拒绝无效输入。 */
function normalizeWebIMProfileContact(input) {
    // account 统一去除首尾空白，邮箱比较保持大小写无关。
    const account = input.account.trim();
    // verificationCode 对齐 RN 六位验证码约束。
    const verificationCode = input.verificationCode.trim();
    // phoneAreaCode 当前 Gateway contract 仅允许中国区号。
    const phoneAreaCode = input.phoneAreaCode ?? '+86';
    if (verificationCode.length !== 6) {
        throw createWebIMSyncError('PROFILE_CONTACT_CODE_INVALID', 'Profile contact verification code must contain 6 characters.');
    }
    if (input.kind === 'phone' && (phoneAreaCode !== '+86' || !/^1\d{10}$/.test(account))) {
        throw createWebIMSyncError('PROFILE_PHONE_INVALID', 'Profile phone must be a valid mainland China mobile number.');
    }
    if (input.kind === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(account)) {
        throw createWebIMSyncError('PROFILE_EMAIL_INVALID', 'Profile email address is invalid.');
    }
    return { kind: input.kind, account, verificationCode, phoneAreaCode };
}
/** 对齐 RN 昵称、性别和签名约束并拒绝空更新。 */
function normalizeWebIMProfileUpdate(patch) {
    // normalized 只收集 caller 明确提交的字段。
    const normalized = {};
    if (patch.nickname !== undefined) {
        // nickname 对齐 RN trim、非空和 32 字符上限。
        const nickname = patch.nickname.trim();
        if (!nickname || Array.from(nickname).length > 32) {
            throw createWebIMSyncError('PROFILE_NICKNAME_INVALID', 'Profile nickname must contain 1 to 32 characters.');
        }
        normalized.nickname = nickname;
    }
    if (patch.gender !== undefined) {
        if (patch.gender !== 0 && patch.gender !== 1 && patch.gender !== 2) {
            throw createWebIMSyncError('PROFILE_GENDER_INVALID', 'Profile gender must be 0, 1 or 2.');
        }
        normalized.gender = patch.gender;
    }
    if (patch.bio !== undefined) {
        normalized.bio = Array.from(patch.bio.trim()).slice(0, 100).join('');
    }
    if (patch.avatar_url !== undefined) {
        // avatarURL 只接受平台上传端口返回的远端地址。
        const avatarURL = patch.avatar_url.trim();
        if (!/^https?:\/\//i.test(avatarURL)) {
            throw createWebIMSyncError('PROFILE_AVATAR_URL_INVALID', 'Profile avatar must use a remote HTTP(S) URL.');
        }
        normalized.avatar_url = avatarURL;
    }
    if (!Object.keys(normalized).length) {
        throw createWebIMSyncError('PROFILE_UPDATE_EMPTY', 'Profile update requires at least one supported field.');
    }
    return normalized;
}
/** 头像上传只接受裁剪后的常见静态图片和 10MB 上限。 */
function normalizeWebIMProfileAvatarInput(input) {
    // mimeType 与 extension 共同阻止 SVG 或可执行内容伪装成头像。
    const mimeType = input.mimeType.trim().toLowerCase();
    // extension 统一为小写以便跨平台上传端口消费。
    const extension = input.extension.trim().toLowerCase();
    // size 使用整数进行明确的 10MB 上限判断。
    const size = Math.trunc(input.size);
    if (!input.name.trim() || input.source === null || input.source === undefined) {
        throw createWebIMSyncError('PROFILE_AVATAR_SOURCE_INVALID', 'Select a profile avatar image.');
    }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(mimeType) ||
        !['jpg', 'jpeg', 'png', 'webp'].includes(extension)) {
        throw createWebIMSyncError('PROFILE_AVATAR_TYPE_INVALID', 'Profile avatars support JPEG, PNG, or WEBP images.');
    }
    if (!Number.isFinite(input.size) || size <= 0 || size > 10 * 1024 * 1024) {
        throw createWebIMSyncError('PROFILE_AVATAR_SIZE_INVALID', 'Profile avatar image cannot exceed 10MB.');
    }
    return { ...input, name: input.name.trim(), mimeType, extension, size };
}
//# sourceMappingURL=profile-sync.js.map