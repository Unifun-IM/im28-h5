import { createWebIMSyncError } from './sync-context.js';
/** 创建不暴露 token 的当前账号资料 facade。 */
export function createWebIMProfileSync(dependencies) {
    /** 在远端资料操作前统一拒绝匿名调用。 */
    const requireAuthenticatedUser = () => {
        if (!dependencies.getCurrentUserID()?.trim()) {
            throw createWebIMSyncError('PROFILE_AUTH_REQUIRED', 'Current user profile requires an authenticated Web IM session.');
        }
    };
    return {
        getCurrent: async () => {
            requireAuthenticatedUser();
            return dependencies.gatewayClient.getCurrentUserDetail();
        },
        update: async (patch) => {
            requireAuthenticatedUser();
            return dependencies.gatewayClient.updateUserProfile(normalizeWebIMProfileUpdate(patch));
        },
    };
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
    if (!Object.keys(normalized).length) {
        throw createWebIMSyncError('PROFILE_UPDATE_EMPTY', 'Profile update requires at least one supported field.');
    }
    return normalized;
}
//# sourceMappingURL=profile-sync.js.map