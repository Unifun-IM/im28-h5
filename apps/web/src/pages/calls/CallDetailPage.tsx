import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react';
import type { GatewayCall, WebIMCallSync, WebIMPeerProfileRelationship } from '@im28/im-sdk/web';
import { Navigate, useNavigate, useParams } from 'react-router-dom';

import directionIconURL from '../../assets/rn/assets/icons/imm28/arrow-up-right.regular.svg';
import backIconURL from '../../assets/rn/assets/icons/imm28/nav-arrow-left.regular.svg';
import chatIconURL from '../../assets/rn/assets/icons/imm28/chat-bubble-empty.solid.svg';
import phoneIconURL from '../../assets/rn/assets/icons/imm28/phone.solid.svg';
import videoIconURL from '../../assets/rn/assets/icons/imm28/video-camera.solid.svg';
import { getRNAvatarGradient, getRNAvatarInitial } from '../../components/rn-avatar-view.js';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';
import { PageNavbar } from '../../components/navigation/PageNavbar.js';
import { useWebIMRuntime } from '../../runtime/index.js';
import { useWebIMCall } from '../../runtime/WebIMCallProvider.js';
import {
  formatCallClock,
  formatCallDateHeader,
  formatCallStatus,
  getCallDayRange,
  getCallDirection,
  getCallDisplayName,
  getCallID,
  getCallPeerID,
  isMissedCall,
} from './call-list-view.js';
import './call-detail-page.css';

/** RN 详情页同日记录最多读取一百条。 */
const CALL_DETAIL_DAY_LIMIT = 100;

/** 渲染 cache-first 的 RN 通话详情只读页面。 */
export function CallDetailPage() {
  /** navigate 承担 React Router 返回行为。 */
  const navigate = useNavigate();
  /** callID 来自详情路由稳定参数。 */
  const { callID = '' } = useParams<{ callID: string }>();
  /** runtime context 是页面唯一 SDK owner。 */
  const { runtime, snapshot, restoring, startupError } = useWebIMRuntime();
  /** callRuntime 复用全局 Web LiveKit 呼出 owner。 */
  const callRuntime = useWebIMCall();
  /** calls 只从聚合 sync facade 获取。 */
  const calls = useMemo(() => runtime?.getSync().calls ?? null, [runtime]);
  /** detailCall 保存缓存或远端补齐后的主记录。 */
  const [detailCall, setDetailCall] = useState<GatewayCall | null>(null);
  /** dayCalls 保存同会话或同对端的当日记录。 */
  const [dayCalls, setDayCalls] = useState<readonly GatewayCall[]>([]);
  /** loading 标记首次缓存与详情读取。 */
  const [loading, setLoading] = useState(false);
  /** error 显示真实 SDK/Gateway 错误。 */
  const [error, setError] = useState<string | null>(null);
  /** relationship 复用 shared peerProfile，不从 call raw 猜测好友状态。 */
  const [relationship, setRelationship] = useState<WebIMPeerProfileRelationship | null>(null);
  /** normalizedCallID 拒绝解码后空白路由参数。 */
  const normalizedCallID = decodeRouteValue(callID);
  /** selfID 供对端和方向解析。 */
  const selfID = snapshot.userID ?? '';
  /** peerID 提供资料和头像稳定身份。 */
  const peerID = detailCall ? getCallPeerID(detailCall, selfID) : '';
  /** name 遵循 RN nickname -> peer ID 回退。 */
  const name = detailCall ? getCallDisplayName(detailCall, selfID) : '';
  /** isFriend 只允许 shared 关系明确为好友时发起 RN 同款动作。 */
  const isFriend = relationship === 'friend';
  /** canOpenConversation 同时要求好友关系和服务端真实会话 ID。 */
  const canOpenConversation = isFriend && Boolean(detailCall?.conversation_id?.trim());

  /** 从 SQLite 读取主记录对应的同日列表。 */
  const loadDayCalls = useCallback(async (
    service: WebIMCallSync,
    sourceCall: GatewayCall,
  ): Promise<void> => {
    /** range 使用 RN 同款本地自然日边界。 */
    const range = getCallDayRange(sourceCall.started_at);
    /** conversationID 优先保证详情同一会话。 */
    const conversationID = sourceCall.conversation_id?.trim() ?? '';
    /** peerUserID 只在会话 ID 缺失时兜底。 */
    const peerUserID = getCallPeerID(sourceCall, selfID);
    /** result 委托 SDK 生成 SQL 和分页。 */
    const result = await service.listCached({
      ...(conversationID ? { conversationID } : { peerUserID }),
      startedAtFromMs: range.startMs,
      startedAtToMs: range.endMs,
      limit: CALL_DETAIL_DAY_LIMIT,
      offset: 0,
    });
    setDayCalls(result.list);
  }, [selfID]);

  useEffect(() => {
    if (!calls || !selfID || !normalizedCallID) return;
    /** active 防止路由切换后旧详情回写。 */
    let active = true;
    setLoading(true);
    setError(null);
    void calls.getCachedDetail(normalizedCallID)
      .then(cachedCall => {
        if (!active || !cachedCall) return;
        setDetailCall(cachedCall);
        return loadDayCalls(calls, cachedCall);
      })
      .catch(cause => {
        if (active) setError(readCallDetailError(cause));
      })
      .then(() => active ? calls.getDetail(normalizedCallID) : undefined)
      .then(detail => {
        if (!active || !detail?.call) return;
        setDetailCall(detail.call);
        return loadDayCalls(calls, detail.call);
      })
      .catch(cause => {
        if (active) setError(readCallDetailError(cause));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [calls, loadDayCalls, normalizedCallID, selfID]);

  useEffect(() => {
    if (!runtime || !peerID) {
      setRelationship(null);
      return;
    }
    /** active 防止详情切换后旧关系结果回写。 */
    let active = true;
    void runtime.getSync().peerProfile.get(peerID)
      .then(profile => {
        if (active) setRelationship(profile.relationship);
      })
      .catch(cause => {
        if (active) setError(readCallDetailError(cause));
      });
    return () => {
      active = false;
    };
  }, [peerID, runtime]);

  if (restoring) return <CallDetailState label="正在恢复通话详情" />;
  if (!runtime) return <CallDetailState label="运行配置不可用" detail={startupError} />;
  if (!snapshot.userID) return <Navigate to="/login" replace />;
  if (!normalizedCallID) return <Navigate to="/calls" replace />;

  /** avatarStyle 复用 RN 稳定头像渐变。 */
  const avatarStyle = {
    '--call-detail-avatar-gradient': getRNAvatarGradient(peerID || normalizedCallID),
  } as CSSProperties;

  /** 从真实通话记录关联会话发起 Web 通话。 */
  const startCall = async (mediaType: 'audio' | 'video'): Promise<void> => {
    if (!detailCall || !isFriend) return;
    /** conversationID 必须来自真实记录，禁止用 peer ID 猜测。 */
    const conversationID = detailCall.conversation_id?.trim() ?? '';
    if (!conversationID) {
      setError('通话记录缺少关联会话');
      return;
    }
    try {
      await callRuntime.startOutgoing({
        conversationID,
        peerName: name || peerID,
        peerAvatarURL: detailCall.avatar_url?.trim() ?? '',
        mediaType,
      });
    } catch (cause) {
      setError(readCallDetailError(cause));
    }
  };

  return (
    <main className="rn-call-detail-page">
      <section className="rn-call-detail-surface" aria-busy={loading}>
        <PageNavbar className="rn-call-detail-header">
          <button type="button" aria-label="返回通话列表" onClick={() => navigate(-1)}>
            <RNAssetIcon assetURL={backIconURL} />
          </button>
          <h1>通话详情</h1>
          <span />
        </PageNavbar>
        {detailCall ? (
          <>
            <section className="rn-call-detail-profile">
              <span className="rn-call-detail-avatar" style={avatarStyle}>
                <span>{getRNAvatarInitial(name || peerID)}</span>
                {detailCall.avatar_url?.trim() ? (
                  <img src={detailCall.avatar_url} alt="" onError={event => {
                    event.currentTarget.hidden = true;
                  }} />
                ) : null}
              </span>
              <strong>{name}</strong>
              {peerID ? <span className="rn-call-detail-user-id">ID：{peerID}</span> : null}
            </section>
            <section className="rn-call-detail-actions" aria-label="联系人操作">
              <button type="button" disabled={!canOpenConversation} onClick={() => navigate(`/conversations/${encodeURIComponent(detailCall.conversation_id?.trim() ?? '')}`)}>
                <RNAssetIcon assetURL={chatIconURL} />
                <span>发消息</span>
              </button>
              <button type="button" disabled={!canOpenConversation} onClick={() => void startCall('audio')}>
                <RNAssetIcon assetURL={phoneIconURL} />
                <span>语音通话</span>
              </button>
              <button type="button" disabled={!canOpenConversation} onClick={() => void startCall('video')}>
                <RNAssetIcon assetURL={videoIconURL} />
                <span>视频通话</span>
              </button>
            </section>
            {error ? <p className="rn-call-detail-error" role="status">{error}</p> : null}
            <section className="rn-call-detail-records" aria-label="同日通话记录">
              <h2>{formatCallDateHeader(detailCall.started_at)}</h2>
              {(dayCalls.length ? dayCalls : [detailCall]).map((item, index) => (
                <CallDetailRecordRow
                  key={getCallID(item) || `${item.started_at ?? 'call'}-${index}`}
                  call={item}
                  selfID={selfID}
                />
              ))}
            </section>
          </>
        ) : loading ? (
          <div className="rn-call-detail-loading"><span /></div>
        ) : (
          <p className="rn-call-detail-error" role="status">{error ?? '未找到通话记录'}</p>
        )}
      </section>
    </main>
  );
}

/** 渲染详情页单条同日通话记录。 */
function CallDetailRecordRow({
  call,
  selfID,
}: {
  readonly call: GatewayCall;
  readonly selfID: string;
}) {
  /** video 控制通话类型图标。 */
  const video = call.call_type === 'video';
  /** missed 控制方向状态色。 */
  const missed = isMissedCall(call);
  /** incoming 控制方向箭头旋转。 */
  const incoming = getCallDirection(call, selfID) === 'incoming';
  return (
    <article className="rn-call-detail-record-row">
      <span className="rn-call-detail-record-main">
        <RNAssetIcon assetURL={video ? videoIconURL : phoneIconURL} />
        <span>{formatCallStatus(call)}</span>
      </span>
      <span className={`rn-call-detail-record-side${missed ? ' is-missed' : ''}`}>
        <time>{formatCallClock(call.started_at)}</time>
        <RNAssetIcon assetURL={directionIconURL} className={incoming ? 'is-incoming' : ''} />
      </span>
    </article>
  );
}

/** 统一承载启动和配置错误的详情全屏状态。 */
function CallDetailState({
  label,
  detail,
}: {
  readonly label: string;
  readonly detail?: string | null;
}) {
  return (
    <main className="rn-calls-page-state">
      <strong>{label}</strong>
      {detail ? <span>{detail}</span> : null}
    </main>
  );
}

/** 安全解码 React Router 参数。 */
function decodeRouteValue(value: string): string {
  try {
    return decodeURIComponent(value).trim();
  } catch {
    return '';
  }
}

/** 将未知异常转换为不含凭据的详情错误文案。 */
function readCallDetailError(cause: unknown): string {
  return cause instanceof Error && cause.message
    ? cause.message
    : '通话详情加载失败';
}
