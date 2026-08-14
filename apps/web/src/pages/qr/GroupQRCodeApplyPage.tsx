import { useCallback, useEffect, useRef, useState } from 'react';
import {
  DEFAULT_IM_GROUP_APPLICATION_MESSAGE,
  IM_GROUP_APPLICATION_MESSAGE_MAX_LENGTH,
  buildIMSelfGroupApplicationMessage,
  type WebIMPublicGroup,
} from '@im28/im-sdk/web';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';

import backIconURL from '../../assets/rn/assets/icons/imm28/nav-arrow-left.regular.svg';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';
import { useAppToast } from '../../components/interaction/index.js';
import { PageNavbar } from '../../components/navigation/PageNavbar.js';
import { useWebIMRuntime } from '../../runtime/index.js';
import { buildConversationRoute } from '../conversations/conversation-route.js';
import {
  createGroupApplyReturnState,
  readGroupApplyRouteState,
} from '../groups/group-search-route.js';
import { resolveApplicationMessageUpdate } from '../contacts/application-message-view.js';
import './qr-code-page.css';

/** 群二维码识别后的公开资料与真实入群申请页。 */
export default function GroupQRCodeApplyPage() {
  /** runtime 是公开群资料和申请 mutation 的唯一入口。 */
  const { runtime, snapshot, restoring, startupError } = useWebIMRuntime();
  /** toast 承载入群申请与打开群聊动作结果。 */
  const { toast } = useAppToast();
  /** routeParams 提供扫码协议解析出的群 ID。 */
  const routeParams = useParams<{ groupID: string }>();
  /** groupID 排除空 deep link。 */
  const groupID = routeParams.groupID?.trim() ?? '';
  /** location 保留扫码来源和受控返回页。 */
  const location = useLocation();
  /** navigate 处理返回、已入群跳转和成功收口。 */
  const navigate = useNavigate();
  /** routeState 区分扫码与查找群聊两条真实入口。 */
  const routeState = readGroupApplyRouteState(location.state);
  /** group 保存 public/get 的真实群公开资料。 */
  const [group, setGroup] = useState<WebIMPublicGroup | null>(null);
  /** message 保存用户可编辑的入群验证内容。 */
  const [message, setMessage] = useState(DEFAULT_IM_GROUP_APPLICATION_MESSAGE);
  /** defaultMessageRef 识别本人资料返回前用户是否已经编辑。 */
  const defaultMessageRef = useRef(DEFAULT_IM_GROUP_APPLICATION_MESSAGE);
  /** loading 覆盖群资料读取。 */
  const [loading, setLoading] = useState(false);
  /** submitting 阻止重复提交入群申请。 */
  const [submitting, setSubmitting] = useState(false);
  /** error 公开真实读取或 mutation 失败。 */
  const [error, setError] = useState<string | null>(null);

  /** 读取陌生人可访问的群公开资料，不调用成员专用群接口。 */
  const loadGroup = useCallback(async (): Promise<void> => {
    if (!runtime || !snapshot.userID || !groupID) return;
    setLoading(true);
    setError(null);
    try {
      setGroup(await runtime.getSync().groupApplications.getPublicGroup(groupID));
    } catch (cause) {
      setError(readGroupApplyError(cause, '群资料加载失败'));
    } finally {
      setLoading(false);
    }
  }, [groupID, runtime, snapshot.userID]);

  useEffect(() => { void loadGroup(); }, [loadGroup]);

  useEffect(() => {
    if (!runtime || !snapshot.userID) return undefined;
    /** active 阻止卸载或切号后的旧资料结果覆盖新页面草稿。 */
    let active = true;
    /** loadSelfApplicationMessage 用 shared 规则更新仍未编辑的缺省验证语。 */
    const loadSelfApplicationMessage = async (): Promise<void> => {
      try {
        /** selfProfile 只用于生成验证语，不参与群关系判断。 */
        const selfProfile = await runtime.getSync().profile.getCurrent();
        if (!active) return;
        /** nextDefaultMessage 由跨端 shared owner 统一生成。 */
        const nextDefaultMessage = buildIMSelfGroupApplicationMessage(selfProfile.nickname);
        /** previousDefaultMessage 是异步读取开始前的页面缺省基线。 */
        const previousDefaultMessage = defaultMessageRef.current;
        defaultMessageRef.current = nextDefaultMessage;
        setMessage(currentMessage => resolveApplicationMessageUpdate({
          currentMessage,
          previousDefaultMessage,
          nextDefaultMessage,
        }).message);
      } catch {
        // 本人资料增强失败时保留稳定缺省文案，不阻断群资料和申请操作。
      }
    };
    void loadSelfApplicationMessage();
    return () => { active = false; };
  }, [runtime, snapshot.userID]);

  /** 提交 qrcode 来源的真实群申请，成功前不改变完成态。 */
  const submitApplication = useCallback(async (): Promise<void> => {
    if (!runtime || !group || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await runtime.getSync().groupApplications.apply({
        groupID: group.groupID,
        message,
        sourceType: routeState.sourceType,
      });
      toast.success('入群申请已发送');
      navigate(routeState.backHref, {
        replace: true,
        state: createGroupApplyReturnState(routeState),
      });
    } catch (cause) {
      toast.error(readGroupApplyError(cause, '入群申请发送失败'));
    } finally {
      setSubmitting(false);
    }
  }, [group, message, navigate, routeState, runtime, submitting, toast]);

  /** 已入群账号进入现有群会话，不重复提交申请。 */
  const openJoinedGroup = useCallback(async (): Promise<void> => {
    if (!runtime || !group) return;
    setLoading(true);
    setError(null);
    try {
      /** conversation 由 shared owner 校验群/会话身份并收敛当前账号缓存。 */
      const conversation = await runtime.getSync().conversations.openGroup({
        groupID: group.groupID,
      });
      /** route 只为搜索来源关闭申请层，扫码来源保留既有 push 语义。 */
      const route = buildConversationRoute(conversation.conversationID, routeState.sourceType === 'search');
      if (!route) throw new Error('该群聊暂不可进入');
      navigate(route.href, { replace: route.replace });
    } catch (cause) {
      toast.error(readGroupApplyError(cause, '该群聊暂不可进入'));
    } finally {
      setLoading(false);
    }
  }, [group, navigate, routeState.sourceType, runtime, toast]);

  if (restoring) return <GroupApplyState label="正在恢复群资料" />;
  if (!runtime) return <GroupApplyState label="运行配置不可用" detail={startupError} />;
  if (!snapshot.userID) return <Navigate to="/login" replace />;
  if (!groupID) return <Navigate to={routeState.backHref} replace />;

  /** alreadyApplied 只依据服务端 pending 关系阻止重复提交。 */
  const alreadyApplied = group?.applicationStatus === 'pending';
  /** alreadyJoined 只依据 public/get 返回的当前账号关系。 */
  const alreadyJoined = group?.membershipStatus === 'active';
  return (
    <main className="rn-group-qr-apply-page" aria-busy={loading || submitting}>
      <section className="rn-group-qr-apply-surface">
        <PageNavbar className="rn-group-qr-apply-header">
          <button type="button" aria-label={routeState.sourceType === 'search' ? '返回查找群聊' : '返回扫码'} onClick={() => navigate(routeState.backHref, { replace: routeState.sourceType === 'search', state: createGroupApplyReturnState(routeState) })}><RNAssetIcon assetURL={backIconURL} /></button>
          <h1>申请加入群聊</h1><span aria-hidden="true" />
        </PageNavbar>
        {error ? <p className="rn-group-qr-error" role="alert">{error}<button type="button" onClick={() => void loadGroup()}>重试</button></p> : null}
        {loading && !group ? <div className="rn-group-qr-loading"><span /></div> : group ? (
          <div className="rn-group-qr-content">
            <div className="rn-group-qr-hero">
              <span className="rn-group-qr-avatar">
                <b>{Array.from(group.title)[0] || '群'}</b>
                {group.avatarURL ? <img src={group.avatarURL} alt="" onError={event => { event.currentTarget.hidden = true; }} /> : null}
              </span>
              <strong>{group.title}</strong>
              <span>群ID：{group.groupID}</span>
              <span>{group.memberCount ? `${group.memberCount} 位成员` : '群聊'}</span>
              {group.description ? <p>{group.description}</p> : null}
            </div>
            {!alreadyJoined ? (
              <label className="rn-group-qr-message">
                <span>验证消息</span>
                <textarea value={message} maxLength={IM_GROUP_APPLICATION_MESSAGE_MAX_LENGTH} disabled={alreadyApplied} onChange={event => setMessage(event.target.value)} />
              </label>
            ) : null}
            <button
              type="button"
              className="rn-group-qr-primary"
              disabled={submitting || alreadyApplied && !alreadyJoined}
              onClick={() => { alreadyJoined ? void openJoinedGroup() : void submitApplication(); }}
            >
              {alreadyJoined ? '进入群聊' : alreadyApplied ? '申请已发送' : submitting ? '正在发送' : '申请加入群聊'}
            </button>
          </div>
        ) : null}
      </section>
    </main>
  );
}

/** 群申请启动状态参数。 */
interface GroupApplyStateProps {
  readonly label: string;
  readonly detail?: string | null;
}

/** 展示群申请启动和配置失败状态。 */
function GroupApplyState({ label, detail }: GroupApplyStateProps) {
  return <main className="rn-qr-state"><strong>{label}</strong>{detail ? <span>{detail}</span> : null}</main>;
}

/** 将未知群申请异常转换为不含凭据的页面文案。 */
function readGroupApplyError(cause: unknown, fallback: string): string {
  return cause instanceof Error && cause.message ? cause.message : fallback;
}
