import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { Navigate, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';

import backIconURL from '../../assets/rn/assets/icons/imm28/nav-arrow-left.regular.svg';
import copyIconURL from '../../assets/rn/assets/icons/imm28/copy.dynamic.svg';
import arrowIconURL from '../../assets/rn/assets/icons/imm28/nav-arrow-right.regular.svg';
import qrCodeIconURL from '../../assets/rn/assets/icons/imm28/qrcode-small.svg';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';
import { PageNavbar } from '../../components/navigation/PageNavbar.js';
import { useAppToast } from '../../components/interaction/index.js';
import { AvatarCropDialog } from '../../components/avatar/AvatarCropDialog.js';
import { validateAvatarFile } from '../../components/avatar/avatar-crop.js';
import { getRNAvatarGradient, getRNAvatarInitial } from '../../components/rn-avatar-view.js';
import { useWebIMRuntime } from '../../runtime/index.js';
import { useQRCodeModal } from '../qr/QRCodeModalProvider.js';
import { buildGroupProfileView, copyGroupProfileID } from './group-profile-view.js';
import { loadGroupProfileSource, type GroupProfileSource } from './group-profile-source.js';
import { resolveGroupProfileBackHref } from './group-profile-route-state.js';
import './group-profile-page.css';

/** RN 群资料页的 Web 垂直切片，开放 shared 群昵称与头像更新。 */
export function GroupProfilePage() {
  // conversationID 来自可刷新 React Router path。
  const { conversationID = '' } = useParams();
  // searchParams 支持群列表长按直接进入原有群名称编辑层。
  const [searchParams] = useSearchParams();
  // location 只提供白名单聊天来源的返回上下文。
  const location = useLocation();
  // navigate 负责返回受控聊天来源或默认群设置。
  const navigate = useNavigate();
  // runtime 是会话、群资料和群昵称 mutation 的唯一应用入口。
  const { runtime, snapshot, restoring, startupError } = useWebIMRuntime();
  // toast 统一承载群资料交互和 mutation 反馈。
  const { toast } = useAppToast();
  /** openGroupQRCode 将群二维码交给应用根级底部弹窗。 */
  const { openGroupQRCode } = useQRCodeModal();
  // source 仅保存当前路由验证通过的群资料。
  const [source, setSource] = useState<GroupProfileSource | null>(null);
  // loading 标记 cache-first 与远端刷新轮次。
  const [loading, setLoading] = useState(false);
  // editorOpen 控制 RN 同语义群昵称编辑层。
  const [editorOpen, setEditorOpen] = useState(false);
  // draft 保存尚未提交的群昵称。
  const [draft, setDraft] = useState('');
  // saving 阻止重复群昵称 mutation。
  const [saving, setSaving] = useState(false);
  // pendingAvatar 只保存用户已选择但尚未确认上传的本地图片。
  const [pendingAvatar, setPendingAvatar] = useState<File | null>(null);
  // uploadingAvatar 阻止重复裁剪、上传和群资料 mutation。
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  // avatarInputRef 触发浏览器平台文件选择器。
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  // autoOpenedGroupRef 保证同一群的 query 动作只触发一次。
  const autoOpenedGroupRef = useRef('');
  // error 只呈现群资料加载失败。
  const [error, setError] = useState<string | null>(null);

  /** 从当前账号 shared cache 恢复群资料，再执行 canonical 刷新。 */
  const load = useCallback(async (): Promise<void> => {
    if (!runtime || !snapshot.userID || !conversationID) return;
    // sync 复用当前认证 runtime 单例。
    const sync = runtime.getSync();
    setLoading(true);
    setError(null);
    try {
      setSource(await loadGroupProfileSource({ sync, conversationID, onCached: setSource }));
    } catch (cause) {
      setError(readGroupProfileError(cause, '群资料加载失败'));
    } finally {
      setLoading(false);
    }
  }, [conversationID, runtime, snapshot.userID]);

  useEffect(() => { void load(); }, [load]);

  // editNameRequested 仅接受稳定 query 值，不从 history state 读取业务参数。
  const editNameRequested = searchParams.get('edit') === 'name';
  useEffect(() => {
    if (!editNameRequested || !source || autoOpenedGroupRef.current === source.group.groupID) return;
    autoOpenedGroupRef.current = source.group.groupID;
    /** view 在自动打开时仍执行 shared capability 校验。 */
    const view = buildGroupProfileView(source.conversation, source.group);
    if (!view.canEdit) {
      toast.error('仅群主或管理员可以编辑群资料');
      return;
    }
    setDraft(view.name);
    setError(null);
    setEditorOpen(true);
  }, [editNameRequested, source]);

  /** 打开编辑层时从 shared 最新群昵称初始化草稿。 */
  function openNameEditor(): void {
    if (!source) return;
    // view 在打开时重新校验当前角色权限。
    const view = buildGroupProfileView(source.conversation, source.group);
    if (!view.canEdit) {
      toast.error('仅群主或管理员可以编辑群资料');
      return;
    }
    setDraft(view.name);
    setError(null);
    setEditorOpen(true);
  }

  /** 显式保存后调用 shared 群昵称 owner，并只接收成功 DTO。 */
  async function saveName(): Promise<void> {
    if (!runtime || !source || saving) return;
    // name 与 RN 一致先 trim，空值交给页面立即反馈。
    const name = draft.trim();
    if (!name) {
      toast.error('群昵称不能为空');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      // group 已经过 Gateway 响应匹配与 SQLite success-only upsert。
      const group = await runtime.getSync().groups.updateName(source.group.groupID, name);
      setSource(current => current ? { ...current, group } : current);
      setEditorOpen(false);
      toast.success('群昵称已更新');
    } catch (cause) {
      toast.error(readGroupProfileError(cause, '群昵称更新失败'));
    } finally {
      setSaving(false);
    }
  }

  /** 头像行只允许群主或管理员打开浏览器图片选择器。 */
  function chooseAvatar(): void {
    if (!source) return;
    // view 在文件选择前再次执行 RN owner/admin 权限投影。
    const view = buildGroupProfileView(source.conversation, source.group);
    if (!view.canEdit) {
      toast.error('仅群主或管理员可以编辑群资料');
      return;
    }
    setError(null);
    avatarInputRef.current?.click();
  }

  /** 校验文件后进入本地裁剪预览，尚不触发任何远端 I/O。 */
  function selectAvatar(file: File | undefined): void {
    // input value 必须复位，允许取消后重新选择同一文件。
    if (avatarInputRef.current) avatarInputRef.current.value = '';
    if (!file) return;
    try {
      validateAvatarFile(file);
      setPendingAvatar(file);
      setError(null);
    } catch (cause) {
      toast.error(readGroupProfileError(cause, '无法读取所选群头像'));
    }
  }

  /** 将确认后的 512x512 JPEG 交给 shared 上传与群资料 owner。 */
  async function saveAvatar(blob: Blob): Promise<void> {
    if (!runtime || !source || uploadingAvatar) return;
    setUploadingAvatar(true);
    setError(null);
    try {
      // group 只有 OSS 上传和 Gateway 响应均成功后才会写入账号 SQLite。
      const group = await runtime.getSync().groups.updateAvatar(source.group.groupID, {
        source: blob,
        name: `group-${source.group.groupID}.jpg`,
        mimeType: 'image/jpeg',
        size: blob.size,
        extension: 'jpg',
      });
      setSource(current => current ? { ...current, group } : current);
      setPendingAvatar(null);
      toast.success('群头像已更新');
    } catch (cause) {
      toast.error(readGroupProfileError(cause, '群头像更新失败'));
    } finally {
      setUploadingAvatar(false);
    }
  }

  /** 复制按钮只在浏览器 clipboard 成功后反馈。 */
  async function copyGroupID(): Promise<void> {
    if (!source) return;
    setError(null);
    try {
      await copyGroupProfileID(source.group.groupID);
      toast.success('复制群ID成功');
    } catch (cause) {
      toast.error(readGroupProfileError(cause, '复制群ID失败'));
    }
  }

  if (restoring) return <GroupProfileState label="正在恢复群资料" />;
  if (!runtime) return <GroupProfileState label="运行配置不可用" detail={startupError} />;
  if (!snapshot.userID) return <Navigate to="/login" replace />;
  // view 只从已验证 source 生成，不使用路由参数拼主体。
  const view = source ? buildGroupProfileView(source.conversation, source.group) : null;
  // backURL 仅允许当前聊天来源覆盖默认群设置目标。
  const backURL = resolveGroupProfileBackHref(location.state, conversationID);
  // avatarStyle 使用群 ID 生成 RN 稳定 fallback 渐变。
  const avatarStyle = { '--group-profile-avatar-gradient': getRNAvatarGradient(view?.groupID ?? '') } as CSSProperties;

  return (
    <main className="rn-group-profile-page" aria-busy={loading || saving || uploadingAvatar}>
      <section className="rn-group-profile-surface">
        <PageNavbar className="rn-group-profile-header"><button type="button" aria-label="返回" onClick={() => navigate(backURL)}><RNAssetIcon assetURL={backIconURL} /></button><h1>群资料</h1><span /></PageNavbar>
        <div className="rn-group-profile-content">
          {error ? <p className="rn-group-profile-error" role="alert">{error}</p> : null}
          {view ? <div className="rn-group-profile-card">
            <button className="rn-group-profile-row" type="button" onClick={chooseAvatar}><span>群头像</span><span className="rn-group-profile-trailing"><span className="rn-group-profile-avatar" style={avatarStyle}><span>{getRNAvatarInitial(view.name, '群')}</span>{view.avatarURL ? <img src={view.avatarURL} alt="" onError={event => { event.currentTarget.hidden = true; }} /> : null}</span>{view.canEdit ? <RNAssetIcon assetURL={arrowIconURL} /> : null}</span></button>
            <button className="rn-group-profile-row" type="button" onClick={openNameEditor}><span>群昵称</span><span className="rn-group-profile-trailing"><span>{view.name}</span>{view.canEdit ? <RNAssetIcon assetURL={arrowIconURL} /> : null}</span></button>
            <button className="rn-group-profile-row" type="button" onClick={() => openGroupQRCode(conversationID)}><span>群二维码</span><span className="rn-group-profile-trailing rn-group-profile-qr-trailing"><RNAssetIcon assetURL={qrCodeIconURL} /><RNAssetIcon assetURL={arrowIconURL} /></span></button>
            <button className="rn-group-profile-row" type="button" onClick={() => { void copyGroupID(); }}><span>群ID</span><span className="rn-group-profile-trailing"><span>{view.groupID}</span><RNAssetIcon assetURL={copyIconURL} /></span></button>
          </div> : loading ? <p className="rn-group-profile-state">正在加载群资料</p> : null}
        </div>
      </section>
      <input ref={avatarInputRef} className="rn-group-profile-avatar-input" type="file" accept="image/jpeg,image/png,image/webp" aria-label="选择群头像" onChange={event => selectAvatar(event.currentTarget.files?.[0])} />
      {editorOpen ? <section className="rn-group-profile-dialog-backdrop" role="presentation" onPointerDown={event => { if (!saving && event.target === event.currentTarget) setEditorOpen(false); }}><div className="rn-group-profile-dialog" role="dialog" aria-modal="true" aria-labelledby="group-name-title"><h2 id="group-name-title">群昵称</h2><input aria-label="群昵称输入框" value={draft} disabled={saving} autoCapitalize="none" autoCorrect="off" onChange={event => setDraft(event.target.value)} /><div><button type="button" disabled={saving} onClick={() => setEditorOpen(false)}>取消</button><button type="button" disabled={saving} onClick={() => { void saveName(); }}>{saving ? '保存中' : '保存'}</button></div></div></section> : null}
      {pendingAvatar ? <AvatarCropDialog file={pendingAvatar} uploading={uploadingAvatar} imageAlt="待裁剪群头像" errorMessage="群头像裁剪失败" onCancel={() => { if (!uploadingAvatar) setPendingAvatar(null); }} onConfirm={saveAvatar} onError={toast.error} /> : null}
    </main>
  );
}

/** 认证恢复和配置失败使用稳定页面状态。 */
function GroupProfileState({ label, detail = '' }: { readonly label: string; readonly detail?: string | null }) {
  return <main className="rn-chat-page-state"><strong>{label}</strong>{detail ? <span>{detail}</span> : null}</main>;
}

/** 将未知异常转换为可见且不泄露本地数据的群资料文案。 */
function readGroupProfileError(cause: unknown, fallback: string): string {
  return cause instanceof Error && cause.message ? cause.message : fallback;
}

export default GroupProfilePage;
