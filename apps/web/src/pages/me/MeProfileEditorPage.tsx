import { useCallback, useEffect, useMemo, useState, type KeyboardEvent } from 'react';
import {
  formatIMUserDisplayName,
  type GatewayUser,
  type WebIMProfileUpdate,
} from '@im28/im-sdk/web';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';

import clearIconURL from '../../assets/rn/assets/icons/imm28/xmark-circle.solid.svg';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';
import { useWebIMRuntime } from '../../runtime/index.js';
import { MeProfileHeader } from './MeProfileHeader.js';
import {
  readMeProfileEditorRouteState,
  resolveMeProfileEditorReturn,
} from './me-profile-editor-route.js';
import {
  PROFILE_BIO_MAX_LENGTH,
  PROFILE_NICKNAME_MAX_LENGTH,
  normalizeProfileBio,
  normalizeProfileGender,
  shouldSubmitProfileNicknameKey,
  type ProfileEditMode,
  type ProfileGender,
} from './profile-edit-view.js';
import './me-profile-page.css';

/** 资料编辑页由 route 显式指定字段 owner。 */
interface MeProfileEditorPageProps {
  readonly mode: ProfileEditMode;
}

/** 三个 RN 编辑页面共享加载、保存和错误语义。 */
export function MeProfileEditorPage({ mode }: MeProfileEditorPageProps) {
  // runtime context 是读取和更新资料的唯一 SDK 入口。
  const { runtime, snapshot, restoring, startupError } = useWebIMRuntime();
  // navigate 在成功或未变更时返回总览页。
  const navigate = useNavigate();
  // location 只读取资料页写入的受控返回标记。
  const location = useLocation();
  // routeState 对深链、首页快捷入口和未知 state 统一 fail-closed。
  const routeState = useMemo(
    () => readMeProfileEditorRouteState(location.state),
    [location.state],
  );
  // profile 保存当前远端资料基线。
  const [profile, setProfile] = useState<GatewayUser | null>(null);
  // nicknameDraft 对应 RN 32 字符单行输入。
  const [nicknameDraft, setNicknameDraft] = useState('');
  // bioDraft 对应 RN 100 字符多行输入。
  const [bioDraft, setBioDraft] = useState('');
  // genderDraft 对应 RN 0/1/2 选择。
  const [genderDraft, setGenderDraft] = useState<ProfileGender>(0);
  // loading 表示 current-detail 尚未完成。
  const [loading, setLoading] = useState(false);
  // saving 阻止重复 update-profile。
  const [saving, setSaving] = useState(false);
  // error 显示真实读取或更新错误。
  const [error, setError] = useState<string | null>(null);

  /** 读取远端资料并初始化当前 route 的草稿。 */
  const loadProfile = useCallback(async () => {
    if (!runtime || !snapshot.userID) return;
    setLoading(true);
    setError(null);
    try {
      // nextProfile 是编辑时的不可伪造基线。
      const nextProfile = await runtime.getSync().profile.getCurrent();
      setProfile(nextProfile);
      setNicknameDraft(nextProfile.nickname?.trim() || formatIMUserDisplayName(
        nextProfile.user_id?.trim() || snapshot.userID,
      ));
      setBioDraft(normalizeProfileBio(nextProfile.bio));
      setGenderDraft(normalizeProfileGender(nextProfile.gender));
    } catch (cause) {
      setError(readEditorError(cause));
    } finally {
      setLoading(false);
    }
  }, [runtime, snapshot.userID]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  // updatePatch 只生成当前 route 所有的一个字段。
  const updatePatch = useMemo<WebIMProfileUpdate>(() => mode === 'nickname'
    ? { nickname: nicknameDraft.trim() }
    : mode === 'gender'
      ? { gender: genderDraft }
      : { bio: normalizeProfileBio(bioDraft) }, [bioDraft, genderDraft, mode, nicknameDraft]);
  // isUnchanged 避免无变化时伪造保存请求。
  const isUnchanged = mode === 'nickname'
    ? updatePatch.nickname === (profile?.nickname?.trim() || formatIMUserDisplayName(
      profile?.user_id?.trim() || snapshot.userID,
    ))
    : mode === 'gender'
      ? updatePatch.gender === normalizeProfileGender(profile?.gender)
      : updatePatch.bio === normalizeProfileBio(profile?.bio);
  // actionDisabled 对齐 RN 昵称非空与所有页面 saving 门禁。
  const actionDisabled = loading || saving || !profile || (mode === 'nickname' && !nicknameDraft.trim());

  /** 返回、未变更和保存成功共用同一条非循环退出链。 */
  const returnFromEditor = useCallback(() => {
    // returnAction 只可能是历史后退或 replace 到资料总览。
    const returnAction = resolveMeProfileEditorReturn(routeState);
    if (returnAction.destination === -1) {
      navigate(-1);
      return;
    }
    navigate(returnAction.destination, { replace: returnAction.replace });
  }, [navigate, routeState]);

  /** 等待真实 update-profile 成功后返回总览页。 */
  const saveProfile = useCallback(async () => {
    if (!runtime || actionDisabled) return;
    if (isUnchanged) {
      returnFromEditor();
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await runtime.getSync().profile.update(updatePatch);
      returnFromEditor();
    } catch (cause) {
      setError(readEditorError(cause));
      setSaving(false);
    }
  }, [actionDisabled, isUnchanged, returnFromEditor, runtime, updatePatch]);

  /** 将软键盘 Done 和物理 Enter 委托给既有昵称保存链。 */
  const submitNicknameFromKeyboard = useCallback((event: KeyboardEvent<HTMLInputElement>) => {
    if (!shouldSubmitProfileNicknameKey({
      key: event.key,
      isComposing: event.nativeEvent.isComposing,
      repeat: event.repeat,
    })) return;
    event.preventDefault();
    void saveProfile();
  }, [saveProfile]);

  if (restoring) return <EditorPageState label="正在恢复个人资料" />;
  if (!runtime) return <EditorPageState label="运行配置不可用" detail={startupError} />;
  if (!snapshot.userID) return <Navigate to="/login" replace />;

  // title 与 RN 三个编辑页逐字一致。
  const title = mode === 'nickname' ? '昵称' : mode === 'gender' ? '设置性别' : '个性签名';
  return (
    <main className="rn-me-profile-page">
      <section className="rn-me-profile-surface">
        <MeProfileHeader title={title} backHref="/me/profile" onBack={returnFromEditor} backLabel={mode === 'nickname' ? undefined : '取消'} backDisabled={saving} actionLabel="完成" actionDisabled={actionDisabled} actionPending={saving && mode !== 'nickname'} onAction={() => void saveProfile()} />
        {error ? <p className="rn-me-editor-error" role="status">{error}</p> : null}
        {mode === 'nickname' ? (
          <div className="rn-me-nickname-content"><label className="rn-me-nickname-input">
            <span className="sr-only">昵称</span>
            <input autoFocus value={nicknameDraft} maxLength={PROFILE_NICKNAME_MAX_LENGTH} disabled={saving} enterKeyHint="done" placeholder="请输入昵称" onChange={event => setNicknameDraft(event.target.value)} onKeyDown={submitNicknameFromKeyboard} />
            {nicknameDraft ? <button type="button" aria-label="清空昵称" onClick={() => setNicknameDraft('')}><RNAssetIcon assetURL={clearIconURL} /></button> : null}
          </label></div>
        ) : mode === 'gender' ? (
          <GenderPicker value={genderDraft} initialValue={normalizeProfileGender(profile?.gender)} disabled={saving} onChange={setGenderDraft} />
        ) : (
          <div className="rn-me-bio-content"><textarea autoFocus aria-label="个性签名输入框" value={bioDraft} maxLength={PROFILE_BIO_MAX_LENGTH} disabled={saving} placeholder="填写个性签名" onChange={event => setBioDraft(Array.from(event.target.value).slice(0, PROFILE_BIO_MAX_LENGTH).join(''))} /><span>{Array.from(bioDraft).length}/{PROFILE_BIO_MAX_LENGTH}</span></div>
        )}
        {mode === 'nickname' && saving ? <div className="rn-me-nickname-saving-overlay" role="status" aria-label="正在保存昵称"><span /></div> : null}
      </section>
    </main>
  );
}

/** 性别选择器参数。 */
interface GenderPickerProps {
  readonly value: ProfileGender;
  readonly initialValue: ProfileGender;
  readonly disabled: boolean;
  readonly onChange: (value: ProfileGender) => void;
}

/** 渲染 RN 男、女及条件性未知选项。 */
function GenderPicker({ value, initialValue, disabled, onChange }: GenderPickerProps) {
  // options 仅在原值未知时允许保留未知选项。
  const options: readonly { readonly label: string; readonly value: ProfileGender }[] = initialValue === 0
    ? [{ label: '男', value: 1 }, { label: '女', value: 2 }, { label: '未知', value: 0 }]
    : [{ label: '男', value: 1 }, { label: '女', value: 2 }];
  return <div className="rn-me-gender-content"><div className="rn-me-gender-card">
    {options.map(option => <button type="button" role="radio" aria-checked={value === option.value} disabled={disabled} key={option.value} onClick={() => onChange(option.value)}><span>{option.label}</span>{value === option.value ? <strong>✓</strong> : null}</button>)}
  </div></div>;
}

/** 统一承载编辑页启动和配置状态。 */
function EditorPageState({ label, detail }: { readonly label: string; readonly detail?: string | null }) {
  return <main className="rn-me-page-state"><strong>{label}</strong>{detail ? <span>{detail}</span> : null}</main>;
}

/** 将未知异常收敛为不含凭据的编辑错误。 */
function readEditorError(cause: unknown): string {
  return cause instanceof Error && cause.message ? cause.message : '保存失败';
}
