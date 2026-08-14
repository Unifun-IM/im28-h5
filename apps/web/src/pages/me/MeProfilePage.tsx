import { useCallback, useEffect, useRef, useState } from 'react';
import { formatIMUserDisplayName, type GatewayUser } from '@im28/im-sdk/web';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';

import arrowIconURL from '../../assets/rn/assets/icons/imm28/nav-arrow-right.regular.svg';
import qrCodeIconURL from '../../assets/rn/assets/icons/imm28/qrcode-small.svg';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';
import { AvatarCropDialog } from '../../components/avatar/AvatarCropDialog.js';
import { AvatarSourceActionSheet } from '../../components/avatar/AvatarSourceActionSheet.js';
import { validateAvatarFile } from '../../components/avatar/avatar-crop.js';
import { copyUserIDToClipboard } from '../../components/clipboard/user-id-clipboard.js';
import {
  AVATAR_ALBUM_INPUT,
  AVATAR_CAMERA_INPUT,
  buildAvatarUpload,
} from '../../components/avatar/avatar-upload.js';
import { useWebIMRuntime } from '../../runtime/index.js';
import { MeProfileHeader } from './MeProfileHeader.js';
import {
  getProfileGenderLabel,
  normalizeProfileBio,
  readMeProfileRouteState,
} from './profile-edit-view.js';
import './me-profile-page.css';

/** RN 个人资料总览仅公开已具备真实编辑 owner 的字段。 */
export function MeProfilePage() {
  // runtime context 是资料读取唯一 SDK 入口。
  const { runtime, snapshot, restoring, startupError } = useWebIMRuntime();
  // location 只承载应用内部的受控快捷动作，不参与资料业务状态。
  const location = useLocation();
  // navigate 在消费快捷动作后清空当前 history entry 的瞬时 state。
  const navigate = useNavigate();
  // routeState 拒绝未知或伪造的非布尔路由字段。
  const routeState = readMeProfileRouteState(location.state);
  // profile 保存 current-detail 返回的真实资料。
  const [profile, setProfile] = useState<GatewayUser | null>(null);
  // loading 覆盖资料请求。
  const [loading, setLoading] = useState(false);
  // error 保留真实请求错误。
  const [error, setError] = useState<string | null>(null);
  // copied 短暂反馈用户 ID 已真实写入系统剪贴板。
  const [copied, setCopied] = useState(false);
  // avatarSheetVisible 控制 RN 同语义的头像来源选择。
  const [avatarSheetVisible, setAvatarSheetVisible] = useState(false);
  // pendingAvatar 保存当前等待裁剪的浏览器文件。
  const [pendingAvatar, setPendingAvatar] = useState<File | null>(null);
  // updatingAvatar 覆盖 Canvas 编码、OSS 上传和资料 mutation。
  const [updatingAvatar, setUpdatingAvatar] = useState(false);
  // albumInputRef 触发普通相册文件选择器。
  const albumInputRef = useRef<HTMLInputElement | null>(null);
  // cameraInputRef 触发支持环境摄像头的单图选择器。
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  // openedRouteAvatarSourceRef 保证同一次路由挂载只自动打开一次。
  const openedRouteAvatarSourceRef = useRef(false);

  /** 从 profile facade 重读当前资料。 */
  const loadProfile = useCallback(async () => {
    if (!runtime || !snapshot.userID) return;
    setLoading(true);
    setError(null);
    try {
      setProfile(await runtime.getSync().profile.getCurrent());
    } catch (cause) {
      setError(readProfilePageError(cause));
    } finally {
      setLoading(false);
    }
  }, [runtime, snapshot.userID]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    if (!routeState.openAvatarSource || openedRouteAvatarSourceRef.current) return;
    openedRouteAvatarSourceRef.current = true;
    setAvatarSheetVisible(true);
    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, navigate, routeState.openAvatarSource]);

  /** 关闭来源 sheet 后在当前用户手势内打开相册选择。 */
  function chooseAlbum(): void {
    setAvatarSheetVisible(false);
    albumInputRef.current?.click();
  }

  /** 关闭来源 sheet 后请求拍照；桌面浏览器允许平台退化。 */
  function chooseCamera(): void {
    setAvatarSheetVisible(false);
    cameraInputRef.current?.click();
  }

  /** 在任何解码或远端 I/O 前校验浏览器所选头像。 */
  function selectAvatar(file: File | undefined, input: HTMLInputElement): void {
    // value 复位后允许再次选择同一个文件。
    input.value = '';
    if (!file) return;
    try {
      validateAvatarFile(file);
      setPendingAvatar(file);
      setError(null);
    } catch (cause) {
      setError(readProfilePageError(cause, '无法读取所选头像'));
    }
  }

  /** 通过 shared SDK 原子完成头像上传和当前资料更新。 */
  async function updateAvatar(blob: Blob): Promise<void> {
    if (!runtime || !snapshot.userID || updatingAvatar) return;
    setUpdatingAvatar(true);
    setError(null);
    try {
      // updatedProfile 只有 OSS 与 update-profile 都成功且身份一致时返回。
      const updatedProfile = await runtime.getSync().profile.updateAvatar(
        buildAvatarUpload(snapshot.userID, blob),
      );
      setProfile(current => ({ ...current, ...updatedProfile }));
      setPendingAvatar(null);
    } catch (cause) {
      setError(readProfilePageError(cause, '头像上传失败'));
    } finally {
      setUpdatingAvatar(false);
    }
  }

  /** 只有浏览器剪贴板写入成功后才显示 RN 同语义反馈。 */
  async function copyUserID(): Promise<void> {
    // userID 以 current-detail 为主并用认证 identity 保底。
    const userID = profile?.user_id?.trim() || snapshot.userID || '';
    try {
      await copyUserIDToClipboard(userID);
      setError(null);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch (cause) {
      setCopied(false);
      setError(readProfilePageError(cause, '复制用户ID失败'));
    }
  }

  if (restoring) return <ProfilePageState label="正在恢复个人资料" />;
  if (!runtime) return <ProfilePageState label="运行配置不可用" detail={startupError} />;
  if (!snapshot.userID) return <Navigate to="/login" replace />;

  // userID 以 current-detail 为主并用认证 identity 保底。
  const userID = profile?.user_id?.trim() || snapshot.userID;
  // nickname 对齐 RN 用户 ID 回退。
  const nickname = profile?.nickname?.trim() || formatIMUserDisplayName(userID);
  // bio 对齐 RN trim/截断规则。
  const bio = normalizeProfileBio(profile?.bio);
  // avatarFallback 在远端头像缺失或加载失败时显示昵称首字符。
  const avatarFallback = Array.from(nickname)[0]?.toUpperCase() || '人';
  return (
    <main className="rn-me-profile-page" aria-busy={loading}>
      <section className="rn-me-profile-surface">
        <MeProfileHeader title="个人资料" backHref="/me" />
        <div className="rn-me-profile-content">
          {error ? <div className="rn-me-profile-error" role="status">
            <span>{error}</span>
            <button type="button" onClick={() => void loadProfile()}>重试</button>
          </div> : null}
          {copied ? <p className="rn-me-profile-copy-state" role="status">已复制ID</p> : null}
          <div className="rn-me-profile-card">
            <button className="rn-me-profile-row rn-me-profile-avatar-row" type="button" disabled={updatingAvatar} onClick={() => setAvatarSheetVisible(true)}>
              <span className="rn-me-profile-label">头像</span>
              <span className="rn-me-profile-trailing">
                {updatingAvatar ? <span className="rn-me-profile-avatar-status">上传中</span> : <span className="rn-me-profile-avatar"><span>{avatarFallback}</span>{profile?.avatar_url?.trim() ? <img src={profile.avatar_url} alt="当前头像" onError={event => { event.currentTarget.hidden = true; }} /> : null}</span>}
                <RNAssetIcon assetURL={arrowIconURL} />
              </span>
            </button>
            <ProfileLinkRow label="昵称" value={nickname} href="/me/profile/nickname" />
            <ProfileLinkRow label="性别" value={getProfileGenderLabel(profile?.gender)} href="/me/profile/gender" />
            <button className="rn-me-profile-row rn-me-profile-id-row" type="button" aria-label="复制ID" onClick={() => void copyUserID()}>
              <span className="rn-me-profile-label">ID</span>
              <span className="rn-me-profile-trailing"><strong>{userID}</strong></span>
            </button>
            <Link className="rn-me-profile-row" to="/me/qrcode" state={{ backHref: '/me/profile' }}>
              <span className="rn-me-profile-label">二维码</span>
              <span className="rn-me-profile-trailing">
                <RNAssetIcon assetURL={qrCodeIconURL} />
              </span>
            </Link>
            <ProfileLinkRow label="个性签名" value={bio || '未设置'} href="/me/profile/bio" last />
          </div>
        </div>
        <input ref={albumInputRef} className="rn-avatar-file-input" type="file" accept={AVATAR_ALBUM_INPUT.accept} aria-label="从相册选择头像" onChange={event => selectAvatar(event.currentTarget.files?.[0], event.currentTarget)} />
        <input ref={cameraInputRef} className="rn-avatar-file-input" type="file" accept={AVATAR_CAMERA_INPUT.accept} capture={AVATAR_CAMERA_INPUT.capture} aria-label="拍照设置头像" onChange={event => selectAvatar(event.currentTarget.files?.[0], event.currentTarget)} />
        <AvatarSourceActionSheet visible={avatarSheetVisible} onAlbum={chooseAlbum} onCamera={chooseCamera} onClose={() => setAvatarSheetVisible(false)} />
        {pendingAvatar ? <AvatarCropDialog file={pendingAvatar} uploading={updatingAvatar} imageAlt="待裁剪个人头像" errorMessage="头像裁剪失败" onCancel={() => { if (!updatingAvatar) setPendingAvatar(null); }} onConfirm={updateAvatar} onError={message => setError(message)} /> : null}
      </section>
    </main>
  );
}

/** 资料总览的可编辑字段行参数。 */
interface ProfileLinkRowProps {
  readonly label: string;
  readonly value: string;
  readonly href: string;
  readonly last?: boolean;
}

/** 渲染 RN 56px 字段行并交给 React Router 导航。 */
function ProfileLinkRow({ label, value, href, last = false }: ProfileLinkRowProps) {
  return (
    <Link className={`rn-me-profile-row${last ? ' is-last' : ''}`} to={href} state={{ returnMode: 'history' }}>
      <span className="rn-me-profile-label">{label}</span>
      <span className="rn-me-profile-trailing">
        <strong>{value}</strong>
        <RNAssetIcon assetURL={arrowIconURL} />
      </span>
    </Link>
  );
}

/** 统一承载个人资料启动和配置状态。 */
function ProfilePageState({ label, detail }: { readonly label: string; readonly detail?: string | null }) {
  return <main className="rn-me-page-state"><strong>{label}</strong>{detail ? <span>{detail}</span> : null}</main>;
}

/** 将未知异常收敛为不含凭据的页面消息。 */
function readProfilePageError(cause: unknown, fallback = '个人资料加载失败'): string {
  return cause instanceof Error && cause.message ? cause.message : fallback;
}
