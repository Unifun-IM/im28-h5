import { useCallback, useEffect, useState } from 'react';
import type { WebIMPublicGroup } from '@im28/im-sdk/web';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';

import backIconURL from '../../assets/rn/assets/icons/imm28/nav-arrow-left.regular.svg';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';
import { PageNavbar } from '../../components/navigation/PageNavbar.js';
import { useWebIMRuntime } from '../../runtime/index.js';
import { readGroupApplyRouteState } from '../groups/group-search-route.js';
import './qr-code-page.css';

/** RN 申请加入群缺省验证消息。 */
const DEFAULT_GROUP_APPLICATION_MESSAGE = '申请加入群聊';

/** 群二维码识别后的公开资料与真实入群申请页。 */
export default function GroupQRCodeApplyPage() {
  /** runtime 是公开群资料和申请 mutation 的唯一入口。 */
  const { runtime, snapshot, restoring, startupError } = useWebIMRuntime();
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
  const [message, setMessage] = useState(DEFAULT_GROUP_APPLICATION_MESSAGE);
  /** loading 覆盖群资料读取。 */
  const [loading, setLoading] = useState(false);
  /** submitting 阻止重复提交入群申请。 */
  const [submitting, setSubmitting] = useState(false);
  /** submitted 只在 Gateway 成功后置为真。 */
  const [submitted, setSubmitted] = useState(false);
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

  /** 提交 qrcode 来源的真实群申请，成功前不改变完成态。 */
  const submitApplication = useCallback(async (): Promise<void> => {
    if (!runtime || !group || submitting || submitted) return;
    setSubmitting(true);
    setError(null);
    try {
      await runtime.getSync().groupApplications.apply({
        groupID: group.groupID,
        message,
        sourceType: routeState.sourceType,
      });
      setSubmitted(true);
    } catch (cause) {
      setError(readGroupApplyError(cause, '入群申请发送失败'));
    } finally {
      setSubmitting(false);
    }
  }, [group, message, routeState.sourceType, runtime, submitted, submitting]);

  /** 已入群账号进入现有群会话，不重复提交申请。 */
  const openJoinedGroup = useCallback(async (): Promise<void> => {
    if (!runtime || !group) return;
    setLoading(true);
    setError(null);
    try {
      /** cachedGroups 优先避免无意义远端刷新。 */
      const cachedGroups = await runtime.getSync().groups.listCached();
      /** joinedGroup 从本地缺失时再执行真实全量同步。 */
      const joinedGroup = cachedGroups.find(item => item.groupID === group.groupID)
        ?? (await runtime.getSync().groups.sync()).find(item => item.groupID === group.groupID);
      if (!joinedGroup?.conversationID) throw new Error('该群聊暂不可进入');
      navigate(`/conversations/${encodeURIComponent(joinedGroup.conversationID)}`);
    } catch (cause) {
      setError(readGroupApplyError(cause, '该群聊暂不可进入'));
    } finally {
      setLoading(false);
    }
  }, [group, navigate, runtime]);

  if (restoring) return <GroupApplyState label="正在恢复群资料" />;
  if (!runtime) return <GroupApplyState label="运行配置不可用" detail={startupError} />;
  if (!snapshot.userID) return <Navigate to="/login" replace />;
  if (!groupID) return <Navigate to={routeState.backHref} replace />;

  /** alreadyApplied 将服务端 pending 与本地成功态统一为不可重复提交。 */
  const alreadyApplied = submitted || group?.applicationStatus === 'pending';
  /** alreadyJoined 只依据 public/get 返回的当前账号关系。 */
  const alreadyJoined = group?.membershipStatus === 'active';
  return (
    <main className="rn-group-qr-apply-page" aria-busy={loading || submitting}>
      <section className="rn-group-qr-apply-surface">
        <PageNavbar className="rn-group-qr-apply-header">
          <button type="button" aria-label={routeState.sourceType === 'search' ? '返回查找群聊' : '返回扫码'} onClick={() => navigate(routeState.backHref, { state: routeState.sourceType === 'search' ? { ...routeState.createState, searchKeyword: routeState.searchKeyword } : undefined })}><RNAssetIcon assetURL={backIconURL} /></button>
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
                <textarea value={message} maxLength={80} disabled={alreadyApplied} onChange={event => setMessage(event.target.value)} />
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
