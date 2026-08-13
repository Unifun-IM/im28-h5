import { describe, expect, it } from 'vitest';

import {
  mergeAuthOnboardingProfileDraft,
  type AuthOnboardingProfileDraft,
} from './auth-onboarding-profile-draft.js';

// BASE_DRAFT 模拟真实 current-detail 初始化的内存基线。
const BASE_DRAFT: AuthOnboardingProfileDraft = {
  userID: 'user-1',
  nickname: '旧昵称',
  gender: 0,
  bio: '',
  phone: '13800000000',
  email: 'user@example.com',
  avatarURL: 'https://cdn.example.com/a.png',
};

describe('auth onboarding profile draft', () => {
  it('只合并完善资料页面允许编辑的字段', () => {
    // nextDraft 应保留 current-detail 的账号与只读字段。
    const nextDraft = mergeAuthOnboardingProfileDraft(BASE_DRAFT, {
      nickname: '新昵称',
      gender: 2,
      bio: '新签名',
      avatarURL: 'https://cdn.example.com/new.png',
    });

    expect(nextDraft).toEqual({
      ...BASE_DRAFT,
      nickname: '新昵称',
      gender: 2,
      bio: '新签名',
      avatarURL: 'https://cdn.example.com/new.png',
    });
  });

  it('空 patch 保持原始草稿值', () => {
    expect(mergeAuthOnboardingProfileDraft(BASE_DRAFT, {})).toEqual(BASE_DRAFT);
  });
});
