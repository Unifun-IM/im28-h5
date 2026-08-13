import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import arrowRightURL from '../../assets/rn/assets/icons/imm28/nav-arrow-right.dynamic.svg';
import cameraIconURL from '../../assets/rn/assets/icons/imm28/camera.solid.svg';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';
import { AvatarCropDialog } from '../../components/avatar/AvatarCropDialog.js';
import { AvatarSourceActionSheet } from '../../components/avatar/AvatarSourceActionSheet.js';
import { validateAvatarFile } from '../../components/avatar/avatar-crop.js';
import {
  AVATAR_ALBUM_INPUT,
  AVATAR_CAMERA_INPUT,
  buildAvatarUpload,
} from '../../components/avatar/avatar-upload.js';
import { useWebIMRuntime } from '../../runtime/index.js';
import {
  getProfileGenderLabel,
  normalizeProfileBio,
  normalizeProfileGender,
} from '../me/profile-edit-view.js';
import { AuthOnboardingRouteGuard } from './AuthOnboardingRouteGuard.js';
import { useAuthOnboarding } from './AuthOnboardingProvider.js';
import { readAuthError } from './auth-login-config.js';
import './auth-complete-profile-page.css';

// ONBOARDING_NICKNAME_MAX_LENGTH 对齐 RN CompleteProfileScreen 的 24 字符限制。
const ONBOARDING_NICKNAME_MAX_LENGTH = 24;

/** 注册后的资料完善页只提交已有 Web profile facade 支持的字段。 */
export function AuthCompleteProfilePage() {
  // runtime/snapshot 共同提供真实账号与 profile facade。
  const { runtime, snapshot } = useWebIMRuntime();
  // onboarding owner 只在成功或明确跳过时清除 marker。
  const { clearProfileRequired, initializeProfileDraft, profileDraft, updateProfileDraft } = useAuthOnboarding();
  // navigate 完成后 replace，阻止回到 onboarding 表单。
  const navigate = useNavigate();
  // loading 表示 current-detail 未完成。
  const [loading, setLoading] = useState(false);
  // saving 阻止重复 update-profile。
  const [saving, setSaving] = useState(false);
  // confirmVisible 对齐 RN 缺少联系方式时的二次确认。
  const [confirmVisible, setConfirmVisible] = useState(false);
  // avatarSheetVisible 控制 RN 同语义的相册/拍照来源选择。
  const [avatarSheetVisible, setAvatarSheetVisible] = useState(false);
  // pendingAvatar 只保存当前页面待裁剪的浏览器文件。
  const [pendingAvatar, setPendingAvatar] = useState<File | null>(null);
  // uploadingAvatar 阻止重复裁剪确认和 OSS 上传。
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  // albumInputRef 触发普通相册文件选择器。
  const albumInputRef = useRef<HTMLInputElement | null>(null);
  // cameraInputRef 触发支持环境摄像头的单图选择器。
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  // error 显示真实读取或保存错误。
  const [error, setError] = useState<string | null>(null);

  /** 从 Gateway current-detail 重建刷新后的表单。 */
  const loadProfile = useCallback(async (): Promise<void> => {
    if (!runtime || !snapshot.userID) return;
    setLoading(true);
    setError(null);
    try {
      // nextProfile 是页面字段唯一远端基线。
      const nextProfile = await runtime.getSync().profile.getCurrent();
      initializeProfileDraft({
        userID: snapshot.userID,
        nickname: nextProfile.nickname?.trim() || nextProfile.user_id?.trim() || snapshot.userID,
        gender: normalizeProfileGender(nextProfile.gender),
        bio: normalizeProfileBio(nextProfile.bio),
        phone: nextProfile.phone?.trim() || '',
        email: nextProfile.email?.trim() || '',
        avatarURL: nextProfile.avatar_url?.trim() || '',
      });
    } catch (cause) {
      setError(readAuthError(cause, '个人资料加载失败'));
    } finally {
      setLoading(false);
    }
  }, [initializeProfileDraft, runtime, snapshot.userID]);

  useEffect(() => {
    if (profileDraft?.userID !== snapshot.userID) void loadProfile();
  }, [loadProfile, profileDraft?.userID, snapshot.userID]);

  /** 清除当前账号 marker 并进入会话页。 */
  function finishOnboarding(): void {
    if (!snapshot.userID) return;
    clearProfileRequired(snapshot.userID);
    navigate('/conversations', { replace: true });
  }

  /** 等待真实 update-profile 成功后完成 onboarding。 */
  async function saveProfile(): Promise<void> {
    if (!runtime || !profileDraft || !profileDraft.nickname.trim() || saving) return;
    setSaving(true);
    setError(null);
    try {
      await runtime.getSync().profile.update({
        nickname: profileDraft.nickname.trim(),
        gender: profileDraft.gender,
        bio: normalizeProfileBio(profileDraft.bio),
        ...(profileDraft.avatarURL ? { avatar_url: profileDraft.avatarURL } : {}),
      });
      finishOnboarding();
    } catch (cause) {
      setError(readAuthError(cause, '个人资料保存失败'));
      setSaving(false);
    }
  }

  /** 首次提交缺少联系方式时先呈现 RN 确认语义。 */
  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    if (!profileDraft?.phone && !profileDraft?.email) {
      setConfirmVisible(true);
      return;
    }
    void saveProfile();
  }

  /** 打开相册 input 前关闭来源 sheet，避免两个 top-layer 重叠。 */
  function chooseAlbum(): void {
    setAvatarSheetVisible(false);
    albumInputRef.current?.click();
  }

  /** 打开拍照 input 前关闭来源 sheet；桌面浏览器允许退化为文件选择。 */
  function chooseCamera(): void {
    setAvatarSheetVisible(false);
    cameraInputRef.current?.click();
  }

  /** 校验静态图片后进入共享 H5 头像裁剪层，不触发远端 I/O。 */
  function selectAvatar(file: File | undefined, input: HTMLInputElement): void {
    // value 复位后允许用户取消并重新选择同一文件。
    input.value = '';
    if (!file) return;
    try {
      validateAvatarFile(file);
      setPendingAvatar(file);
      setError(null);
    } catch (cause) {
      setError(readAuthError(cause, '无法读取所选头像'));
    }
  }

  /** 将 512x512 JPEG 交给 SDK 真实上传 owner，只把远端 URL 写入内存草稿。 */
  async function uploadAvatar(blob: Blob): Promise<void> {
    if (!runtime || !profileDraft || uploadingAvatar) return;
    setUploadingAvatar(true);
    setError(null);
    try {
      // avatarURL 只有真实 OSS 上传成功并保持同一账号时才会返回。
      const avatarURL = await runtime.getSync().profile.uploadAvatar(
        buildAvatarUpload(profileDraft.userID, blob),
      );
      updateProfileDraft({ avatarURL });
      setPendingAvatar(null);
    } catch (cause) {
      setError(readAuthError(cause, '头像上传失败'));
    } finally {
      setUploadingAvatar(false);
    }
  }

  // disabled 汇总真实 profile、昵称和请求状态。
  const disabled = loading || saving || uploadingAvatar || !profileDraft || !profileDraft.nickname.trim();
  return (
    <AuthOnboardingRouteGuard stage="complete-profile">
      <main className="auth-complete-page">
        <section className="auth-complete-surface">
          <header><h1>完善个人资料</h1><p>为保障账号安全，请完成以下资料</p></header>
          <form onSubmit={handleSubmit}>
            <button className="auth-complete-avatar" type="button" aria-label="设置头像" disabled={uploadingAvatar} onClick={() => setAvatarSheetVisible(true)}>
              {profileDraft?.avatarURL ? <img src={profileDraft.avatarURL} alt="当前头像" /> : <span aria-hidden="true">人</span>}
              <span className="auth-complete-avatar-camera" aria-hidden="true"><RNAssetIcon assetURL={cameraIconURL} /></span>
            </button>
            <label className="auth-complete-nickname"><span>昵称</span><input value={profileDraft?.nickname ?? ''} maxLength={ONBOARDING_NICKNAME_MAX_LENGTH} disabled={saving} placeholder="请输入昵称" onChange={event => updateProfileDraft({ nickname: event.target.value })} /></label>
            <section className="auth-complete-group"><p>完善联系方式,可以帮助账号找回,并更好的服务你</p><div className="auth-complete-card">
              <ProfileRow label="手机号" value={profileDraft?.phone || '绑定手机号'} muted={!profileDraft?.phone} />
              <ProfileRow label="邮箱" value={profileDraft?.email || '绑定邮箱'} muted={!profileDraft?.email} />
            </div></section>
            <section className="auth-complete-group"><div className="auth-complete-card">
              <ProfileRow label="性别" value={getProfileGenderLabel(profileDraft?.gender)} href="/auth/complete-profile/gender" />
              <ProfileRow label="个性签名" value={normalizeProfileBio(profileDraft?.bio) || '填写个性签名'} muted={!profileDraft?.bio} href="/auth/complete-profile/bio" />
            </div></section>
            {error ? <p className="auth-onboarding-error" role="alert">{error}</p> : null}
            <button className="auth-complete-submit" type="submit" disabled={disabled}>{loading ? '加载中' : saving ? '保存中' : '完成'}</button>
          </form>
        </section>
        <input ref={albumInputRef} className="rn-avatar-file-input" type="file" accept={AVATAR_ALBUM_INPUT.accept} aria-label="从相册选择头像" onChange={event => selectAvatar(event.currentTarget.files?.[0], event.currentTarget)} />
        <input ref={cameraInputRef} className="rn-avatar-file-input" type="file" accept={AVATAR_CAMERA_INPUT.accept} capture={AVATAR_CAMERA_INPUT.capture} aria-label="拍照设置头像" onChange={event => selectAvatar(event.currentTarget.files?.[0], event.currentTarget)} />
        <AvatarSourceActionSheet visible={avatarSheetVisible} onAlbum={chooseAlbum} onCamera={chooseCamera} onClose={() => setAvatarSheetVisible(false)} />
        {pendingAvatar ? <AvatarCropDialog file={pendingAvatar} uploading={uploadingAvatar} imageAlt="待裁剪个人头像" errorMessage="头像裁剪失败" onCancel={() => { if (!uploadingAvatar) setPendingAvatar(null); }} onConfirm={uploadAvatar} onError={setError} /> : null}
        {confirmVisible ? <MissingContactDialog saving={saving} onImprove={() => setConfirmVisible(false)} onContinue={() => { setConfirmVisible(false); void saveProfile(); }} /> : null}
      </main>
    </AuthOnboardingRouteGuard>
  );
}

/** 完善资料卡片行参数。 */
interface ProfileRowProps {
  readonly label: string;
  readonly value: string;
  readonly muted?: boolean;
  readonly href?: string;
}

/** 渲染 RN 56px 资料行；无真实能力的联系方式保持只读。 */
function ProfileRow({ label, value, muted = false, href }: ProfileRowProps) {
  // navigate 只处理已冻结的 gender/bio 子路由。
  const navigate = useNavigate();
  // content 保持静态行和按钮行完全同构。
  const content = <><span>{label}</span><strong className={muted ? 'is-muted' : ''}>{value}</strong>{href ? <RNAssetIcon assetURL={arrowRightURL} /> : null}</>;
  return href
    ? <button type="button" className="auth-complete-row" onClick={() => navigate(href)}>{content}</button>
    : <div className="auth-complete-row">{content}</div>;
}

/** 缺少联系方式时保留 RN 二次确认，不伪造联系方式或保存成功。 */
function MissingContactDialog({ saving, onImprove, onContinue }: { readonly saving: boolean; readonly onImprove: () => void; readonly onContinue: () => void }) {
  return <div className="auth-complete-dialog-overlay" role="presentation"><section className="auth-complete-dialog" role="dialog" aria-modal="true" aria-labelledby="missing-contact-title">
    <div><h2 id="missing-contact-title">提示</h2><p>你尚未完善联系方式<br />没有联系方式就无法找回账号<br />我们可能无法提供更好的服务</p></div>
    <footer><button type="button" disabled={saving} onClick={onImprove}>继续完善</button><button type="button" disabled={saving} onClick={onContinue}>打开28聊天</button></footer>
  </section></div>;
}
