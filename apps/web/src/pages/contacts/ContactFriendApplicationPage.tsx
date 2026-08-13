import { useCallback, useEffect, useState } from 'react';
import type { WebIMPeerProfile } from '@im28/im-sdk/web';
import { Navigate, useLocation, useParams } from 'react-router-dom';

import { useWebIMRuntime } from '../../runtime/index.js';
import { buildContactProfileRoute } from './contact-profile-view.js';
import {
  ContactProfileAvatar,
  ContactProfileHeader,
} from './ContactProfileShared.js';
import './contact-profile-page.css';
import './contact-friend-application-page.css';

/** RN 好友申请缺省验证消息。 */
const DEFAULT_APPLICATION_MESSAGE = '你好，我想添加你为好友';

/** RN 添加朋友全屏状态通过真实 peerProfile mutation 提交。 */
export function ContactFriendApplicationPage() {
  // runtime context 是页面唯一 SDK 入口。
  const { runtime, snapshot, restoring, startupError } = useWebIMRuntime();
  // routeParams 提供申请目标用户 ID。
  const routeParams = useParams<{ userID: string }>();
  /** location 提供扫码入口传递的受控申请来源。 */
  const location = useLocation();
  // userID 清理无效 deep link。
  const userID = routeParams.userID?.trim() ?? '';
  // profile 只来自真实资料 facade。
  const [profile, setProfile] = useState<WebIMPeerProfile | null>(null);
  // message 对齐 RN 80 字符验证输入。
  const [message, setMessage] = useState(DEFAULT_APPLICATION_MESSAGE);
  // loading 覆盖资料读取。
  const [loading, setLoading] = useState(false);
  // submitting 阻止重复申请。
  const [submitting, setSubmitting] = useState(false);
  // submitted 只在 Gateway mutation 成功后置为 true。
  const [submitted, setSubmitted] = useState(false);
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

  /** 提交好友申请，成功前不改变页面完成态。 */
  const submitApplication = useCallback(async (): Promise<void> => {
    if (!runtime || !profile || submitting || submitted) return;
    setSubmitting(true);
    setError(null);
    try {
      await runtime.getSync().peerProfile.applyFriend(
        profile.userID,
        message,
        readFriendApplicationSourceType(location.state) ?? undefined,
      );
      setSubmitted(true);
    } catch (cause) {
      setError(readApplicationError(cause, '好友申请发送失败'));
    } finally {
      setSubmitting(false);
    }
  }, [location.state, message, profile, runtime, submitted, submitting]);

  if (restoring) return <ApplicationPageState label="正在恢复好友申请" />;
  if (!runtime) return <ApplicationPageState label="运行配置不可用" detail={startupError} />;
  if (!snapshot.userID) return <Navigate to="/login" replace />;
  if (!userID) return <Navigate to="/contacts" replace />;
  if (profile?.relationship === 'self' || profile?.relationship === 'friend') {
    return <Navigate to={buildContactProfileRoute(userID)} replace />;
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
                disabled={submitted}
                placeholder="输入打招呼内容"
                onChange={event => setMessage(event.target.value)}
              />
            </label>
            <button
              type="button"
              className="rn-contact-profile-primary"
              disabled={submitting || submitted}
              onClick={() => void submitApplication()}
            >
              {submitted ? '申请已发送' : submitting ? '正在发送' : '加朋友'}
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

/** 只接受扫码页登记的 qrcode 好友申请来源。 */
function readFriendApplicationSourceType(state: unknown): 'qrcode' | null {
  if (!state || typeof state !== 'object') return null;
  return Reflect.get(state, 'sourceType') === 'qrcode' ? 'qrcode' : null;
}
