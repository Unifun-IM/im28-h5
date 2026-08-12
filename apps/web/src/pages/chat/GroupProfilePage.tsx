import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import type { Conversation, WebIMJoinedGroup } from '@im28/im-sdk/web';
import { Navigate, useNavigate, useParams } from 'react-router-dom';

import backIconURL from '../../assets/rn/assets/icons/imm28/nav-arrow-left.regular.svg';
import copyIconURL from '../../assets/rn/assets/icons/imm28/copy.dynamic.svg';
import arrowIconURL from '../../assets/rn/assets/icons/imm28/nav-arrow-right.regular.svg';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';
import { getRNAvatarGradient, getRNAvatarInitial } from '../../components/rn-avatar-view.js';
import { useWebIMRuntime } from '../../runtime/index.js';
import { GroupAvatarCropDialog } from './GroupAvatarCropDialog.js';
import { validateGroupAvatarFile } from './group-avatar-crop.js';
import { buildGroupProfileView, copyGroupProfileID } from './group-profile-view.js';
import './group-profile-page.css';

/** 群资料页恢复结果保留真实群会话和 shared 群快照。 */
interface GroupProfileSource {
  readonly conversation: Conversation;
  readonly group: WebIMJoinedGroup;
}

/** RN 群资料页的 Web 垂直切片，开放 shared 群昵称与头像更新。 */
export function GroupProfilePage() {
  // conversationID 来自可刷新 React Router path。
  const { conversationID = '' } = useParams();
  // navigate 负责返回群设置，不依赖 location state。
  const navigate = useNavigate();
  // runtime 是会话、群资料和群昵称 mutation 的唯一应用入口。
  const { runtime, snapshot, restoring, startupError } = useWebIMRuntime();
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
  // error 呈现真实读取、复制或更新失败。
  const [error, setError] = useState<string | null>(null);
  // notice 只在真实平台或 shared operation 成功后展示。
  const [notice, setNotice] = useState<string | null>(null);

  /** 从当前账号 shared cache 恢复群资料，再执行 canonical 刷新。 */
  const load = useCallback(async (): Promise<void> => {
    if (!runtime || !snapshot.userID || !conversationID) return;
    // sync 复用当前认证 runtime 单例。
    const sync = runtime.getSync();
    setLoading(true);
    setError(null);
    try {
      // conversations 缺失时通过 canonical sync 恢复深链。
      let conversations = await sync.conversations.listCached({ limit: 500 });
      let conversation = conversations.find(item => item.conversationID === conversationID);
      if (!conversation) {
        conversations = await sync.conversations.sync({ pageSize: 100 });
        conversation = conversations.find(item => item.conversationID === conversationID);
      }
      if (!conversation || conversation.type !== 'group') throw new Error('群聊不存在或尚未同步');
      // cachedGroup 允许离线时先展示已有真实快照。
      const cachedGroups = await sync.groups.listCached();
      const cachedGroup = cachedGroups.find(item => item.groupID === conversation?.targetID);
      if (cachedGroup) setSource({ conversation, group: cachedGroup });
      // groups 刷新后必须再次精确匹配当前群。
      const groups = await sync.groups.sync({ pageSize: 100 });
      const group = groups.find(item => item.groupID === conversation?.targetID);
      if (!group) throw new Error('群资料不存在或尚未同步');
      setSource({ conversation, group });
    } catch (cause) {
      setError(readGroupProfileError(cause, '群资料加载失败'));
    } finally {
      setLoading(false);
    }
  }, [conversationID, runtime, snapshot.userID]);

  useEffect(() => { void load(); }, [load]);

  /** 打开编辑层时从 shared 最新群昵称初始化草稿。 */
  function openNameEditor(): void {
    if (!source) return;
    // view 在打开时重新校验当前角色权限。
    const view = buildGroupProfileView(source.conversation, source.group);
    if (!view.canEdit) {
      setError('仅群主或管理员可以编辑群资料');
      return;
    }
    setDraft(view.name);
    setError(null);
    setNotice(null);
    setEditorOpen(true);
  }

  /** 显式保存后调用 shared 群昵称 owner，并只接收成功 DTO。 */
  async function saveName(): Promise<void> {
    if (!runtime || !source || saving) return;
    // name 与 RN 一致先 trim，空值交给页面立即反馈。
    const name = draft.trim();
    if (!name) {
      setError('群昵称不能为空');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      // group 已经过 Gateway 响应匹配与 SQLite success-only upsert。
      const group = await runtime.getSync().groups.updateName(source.group.groupID, name);
      setSource(current => current ? { ...current, group } : current);
      setEditorOpen(false);
      setNotice('群昵称已更新');
    } catch (cause) {
      setError(readGroupProfileError(cause, '群昵称更新失败'));
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
      setError('仅群主或管理员可以编辑群资料');
      return;
    }
    setError(null);
    setNotice(null);
    avatarInputRef.current?.click();
  }

  /** 校验文件后进入本地裁剪预览，尚不触发任何远端 I/O。 */
  function selectAvatar(file: File | undefined): void {
    // input value 必须复位，允许取消后重新选择同一文件。
    if (avatarInputRef.current) avatarInputRef.current.value = '';
    if (!file) return;
    try {
      validateGroupAvatarFile(file);
      setPendingAvatar(file);
      setError(null);
    } catch (cause) {
      setError(readGroupProfileError(cause, '无法读取所选群头像'));
    }
  }

  /** 将确认后的 512x512 JPEG 交给 shared 上传与群资料 owner。 */
  async function saveAvatar(blob: Blob): Promise<void> {
    if (!runtime || !source || uploadingAvatar) return;
    setUploadingAvatar(true);
    setError(null);
    setNotice(null);
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
      setNotice('群头像已更新');
    } catch (cause) {
      setError(readGroupProfileError(cause, '群头像更新失败'));
    } finally {
      setUploadingAvatar(false);
    }
  }

  /** 复制按钮只在浏览器 clipboard 成功后反馈。 */
  async function copyGroupID(): Promise<void> {
    if (!source) return;
    setError(null);
    setNotice(null);
    try {
      await copyGroupProfileID(source.group.groupID);
      setNotice('复制群ID成功');
    } catch (cause) {
      setError(readGroupProfileError(cause, '复制群ID失败'));
    }
  }

  if (restoring) return <GroupProfileState label="正在恢复群资料" />;
  if (!runtime) return <GroupProfileState label="运行配置不可用" detail={startupError} />;
  if (!snapshot.userID) return <Navigate to="/login" replace />;
  // view 只从已验证 source 生成，不使用路由参数拼主体。
  const view = source ? buildGroupProfileView(source.conversation, source.group) : null;
  // backURL 是当前群设置稳定返回目标。
  const backURL = `/conversations/${encodeURIComponent(conversationID)}/settings`;
  // avatarStyle 使用群 ID 生成 RN 稳定 fallback 渐变。
  const avatarStyle = { '--group-profile-avatar-gradient': getRNAvatarGradient(view?.groupID ?? '') } as CSSProperties;

  return (
    <main className="rn-group-profile-page" aria-busy={loading || saving || uploadingAvatar}>
      <section className="rn-group-profile-surface">
        <header className="rn-group-profile-header"><button type="button" aria-label="返回群设置" onClick={() => navigate(backURL)}><RNAssetIcon assetURL={backIconURL} /></button><h1>群资料</h1><span /></header>
        <div className="rn-group-profile-content">
          {error ? <p className="rn-group-profile-error" role="alert">{error}</p> : null}
          {notice ? <p className="rn-group-profile-notice" role="status">{notice}</p> : null}
          {view ? <div className="rn-group-profile-card">
            <button className="rn-group-profile-row" type="button" onClick={chooseAvatar}><span>群头像</span><span className="rn-group-profile-trailing"><span className="rn-group-profile-avatar" style={avatarStyle}><span>{getRNAvatarInitial(view.name, '群')}</span>{view.avatarURL ? <img src={view.avatarURL} alt="" onError={event => { event.currentTarget.hidden = true; }} /> : null}</span>{view.canEdit ? <RNAssetIcon assetURL={arrowIconURL} /> : null}</span></button>
            <button className="rn-group-profile-row" type="button" onClick={openNameEditor}><span>群昵称</span><span className="rn-group-profile-trailing"><span>{view.name}</span>{view.canEdit ? <RNAssetIcon assetURL={arrowIconURL} /> : null}</span></button>
            <button className="rn-group-profile-row" type="button" onClick={() => { void copyGroupID(); }}><span>群ID</span><span className="rn-group-profile-trailing"><span>{view.groupID}</span><RNAssetIcon assetURL={copyIconURL} /></span></button>
          </div> : loading ? <p className="rn-group-profile-state">正在加载群资料</p> : null}
        </div>
      </section>
      <input ref={avatarInputRef} className="rn-group-profile-avatar-input" type="file" accept="image/jpeg,image/png,image/webp" aria-label="选择群头像" onChange={event => selectAvatar(event.currentTarget.files?.[0])} />
      {editorOpen ? <section className="rn-group-profile-dialog-backdrop" role="presentation" onPointerDown={event => { if (!saving && event.target === event.currentTarget) setEditorOpen(false); }}><div className="rn-group-profile-dialog" role="dialog" aria-modal="true" aria-labelledby="group-name-title"><h2 id="group-name-title">群昵称</h2><input aria-label="群昵称输入框" value={draft} disabled={saving} autoCapitalize="none" autoCorrect="off" onChange={event => setDraft(event.target.value)} /><div><button type="button" disabled={saving} onClick={() => setEditorOpen(false)}>取消</button><button type="button" disabled={saving} onClick={() => { void saveName(); }}>{saving ? '保存中' : '保存'}</button></div></div></section> : null}
      {pendingAvatar ? <GroupAvatarCropDialog file={pendingAvatar} uploading={uploadingAvatar} onCancel={() => { if (!uploadingAvatar) setPendingAvatar(null); }} onConfirm={saveAvatar} onError={setError} /> : null}
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
