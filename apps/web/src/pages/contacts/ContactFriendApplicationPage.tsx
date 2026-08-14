import { useCallback, useEffect, useRef, useState } from 'react';
import {
  buildIMSelfFriendApplicationMessage,
  DEFAULT_IM_FRIEND_APPLICATION_MESSAGE,
  type WebIMPeerProfile,
} from '@im28/im-sdk/web';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';

import { useAppToast } from '../../components/interaction/index.js';
import { useWebIMRuntime } from '../../runtime/index.js';
import { buildContactProfileRoute } from './contact-profile-view.js';
import {
  createContactProfileChildRouteState,
  readContactProfileApplicationSourceType,
} from './contact-profile-route-state.js';
import { resolveApplicationMessageUpdate } from './application-message-view.js';
import {
  ContactProfileAvatar,
  ContactProfileHeader,
} from './ContactProfileShared.js';
import './contact-profile-page.css';
import './contact-friend-application-page.css';

/** RN 添加朋友全屏状态通过真实 peerProfile mutation 提交。 */
export function ContactFriendApplicationPage() {
  // runtime context 是页面唯一 SDK 入口。
  const { runtime, snapshot, restoring, startupError } = useWebIMRuntime();
  /** toast 承载好友申请提交结果。 */
  const { toast } = useAppToast();
  // routeParams 提供申请目标用户 ID。
  const routeParams = useParams<{ userID: string }>();
  /** location 提供扫码入口传递的受控申请来源。 */
  const location = useLocation();
  /** profileRouteState 只回传资料页继续恢复来源所需的白名单 context。 */
  const profileRouteState = createContactProfileChildRouteState(location.state);
  /** navigate 只在真实申请成功后替换回资料页。 */
  const navigate = useNavigate();
  // userID 清理无效 deep link。
  const userID = routeParams.userID?.trim() ?? '';
  // profile 只来自真实资料 facade。
  const [profile, setProfile] = useState<WebIMPeerProfile | null>(null);
  // message 对齐 RN 80 字符验证输入。
  const [message, setMessage] = useState(DEFAULT_IM_FRIEND_APPLICATION_MESSAGE);
  /** defaultMessageRef 识别本人资料返回前用户是否已经编辑。 */
  const defaultMessageRef = useRef(DEFAULT_IM_FRIEND_APPLICATION_MESSAGE);
  // loading 覆盖资料读取。
  const [loading, setLoading] = useState(false);
  // submitting 阻止重复申请。
  const [submitting, setSubmitting] = useState(false);
  // error 显示真实读取或 mutation 失败。
  const [error, setError] = useState<string | null>(null);

  /** 读取申请目标的真实资料和关系。 */
  const loadProfile = useCallback(async (): Promise<void> => {
    if (!runtime || !snapshot.userID || !userID) return;
    setLoading(true);
    setError(null);
    try {
      setProfile(await runtime.getSync().peerProfile.get(userID));
    } catch (cause) {
      setError(readApplicationError(cause, '联系人资料加载失败'));
    } finally {
      setLoading(false);
    }
  }, [runtime, snapshot.userID, userID]);

  useEffect(() => { void loadProfile(); }, [loadProfile]);

  useEffect(() => {
    if (!runtime || !snapshot.userID) return undefined;
    /** active 阻止卸载或切号后的旧资料结果覆盖新页面草稿。 */
    let active = true;
    /** loadSelfApplicationMessage 用 shared 规则更新仍未编辑的缺省验证语。 */
    const loadSelfApplicationMessage = async (): Promise<void> => {
      try {
        /** selfProfile 只用于生成验证语，不参与目标关系判断。 */
        const selfProfile = await runtime.getSync().profile.getCurrent();
        if (!active) return;
        /** nextDefaultMessage 由跨端 shared owner 统一生成。 */
        const nextDefaultMessage = buildIMSelfFriendApplicationMessage(selfProfile.nickname);
        /** previousDefaultMessage 是异步读取开始前的页面缺省基线。 */
        const previousDefaultMessage = defaultMessageRef.current;
        defaultMessageRef.current = nextDefaultMessage;
        setMessage(currentMessage => resolveApplicationMessageUpdate({
          currentMessage,
          previousDefaultMessage,
          nextDefaultMessage,
        }).message);
      } catch {
        // 本人资料增强失败时保留稳定缺省文案，不阻断目标资料和申请操作。
      }
    };
    void loadSelfApplicationMessage();
    return () => { active = false; };
  }, [runtime, snapshot.userID]);

  /** 提交好友申请，成功前不改变页面完成态。 */
  const submitApplication = useCallback(async (): Promise<void> => {
    if (!runtime || !profile || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await runtime.getSync().peerProfile.applyFriend(
        profile.userID,
        message,
        readContactProfileApplicationSourceType(location.state) ?? undefined,
      );
      toast.success('好友申请已发送');
      navigate(buildContactProfileRoute(profile.userID), {
        replace: true,
        state: profileRouteState,
      });
    } catch (cause) {
      toast.error(readApplicationError(cause, '好友申请发送失败'));
    } finally {
      setSubmitting(false);
    }
  }, [location.state, message, navigate, profile, profileRouteState, runtime, submitting, toast]);

  if (restoring) return <ApplicationPageState label="正在恢复好友申请" />;
  if (!runtime) return <ApplicationPageState label="运行配置不可用" detail={startupError} />;
  if (!snapshot.userID) return <Navigate to="/login" replace />;
  if (!userID) return <Navigate to="/contacts" replace />;
  if (profile?.relationship === 'self' || profile?.relationship === 'friend') {
    return (
      <Navigate
        to={buildContactProfileRoute(userID)}
        replace
        state={profileRouteState}
      />
    );
  }

  return (
    <main className="rn-contact-application-page" aria-busy={loading || submitting}>
      <section className="rn-contact-profile-surface">
        <ContactProfileHeader
          backHref={buildContactProfileRoute(userID)}
          title="申请添加朋友"
        />
        {error ? <div className="rn-contact-application-error" role="alert">{error}</div> : null}
        {loading && !profile ? (
          <div className="rn-contact-profile-loading" aria-label="正在加载联系人资料"><span /></div>
        ) : profile ? (
          <div className="rn-contact-application-content">
            <div className="rn-contact-application-user">
              <ContactProfileAvatar {...profile} size="small" />
              <div className="rn-contact-application-user-info">
                <strong>{profile.displayName}</strong>
                <span>ID：{profile.userID}</span>
              </div>
            </div>
            <label className="rn-contact-application-field">
              <span>打招呼内容</span>
              <textarea
                value={message}
                maxLength={80}
                disabled={submitting}
                placeholder="输入打招呼内容"
                onChange={event => setMessage(event.target.value)}
              />
            </label>
            <button
              type="button"
              className="rn-contact-profile-primary"
              disabled={submitting}
              onClick={() => void submitApplication()}
            >
              {submitting ? '正在发送' : '加朋友'}
            </button>
          </div>
        ) : null}
      </section>
    </main>
  );
}

/** 好友申请启动状态参数。 */
interface ApplicationPageStateProps {
  readonly label: string;
  readonly detail?: string | null;
}

/** 统一承载好友申请启动和配置错误。 */
function ApplicationPageState({ label, detail }: ApplicationPageStateProps) {
  return <main className="rn-contact-profile-state"><strong>{label}</strong>{detail ? <span>{detail}</span> : null}</main>;
}

/** 将未知申请异常转换为不含凭据的页面文案。 */
function readApplicationError(cause: unknown, fallback: string): string {
  return cause instanceof Error && cause.message ? cause.message : fallback;
}
