import { useCallback, useEffect, useMemo, useState } from 'react';
import type { WebIMPeerProfile } from '@im28/im-sdk/web';
import {
  Link,
  Navigate,
  useNavigate,
  useParams,
} from 'react-router-dom';

import copyIconURL from '../../assets/rn/assets/icons/imm28/copy.regular.svg';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';
import { useWebIMRuntime } from '../../runtime/index.js';
import {
  buildContactFriendApplicationRoute,
  formatContactProfileAddedAt,
  getContactProfileGenderLabel,
  getContactProfilePrimaryAction,
} from './contact-profile-view.js';
import {
  ContactProfileAvatar,
  ContactProfileHeader,
} from './ContactProfileShared.js';
import './contact-profile-page.css';

/** RN 联系人资料核心页只调用 Web SDK peerProfile facade。 */
export function ContactProfilePage() {
  // runtime context 是页面唯一 SDK 入口。
  const { runtime, snapshot, restoring, startupError } = useWebIMRuntime();
  // routeParams 提供稳定联系人 ID deep link。
  const routeParams = useParams<{ userID: string }>();
  // userID 统一清理缺失路由参数。
  const userID = routeParams.userID?.trim() ?? '';
  // navigate 仅负责真实 operation 成功后的 SPA 切换。
  const navigate = useNavigate();
  // profile 保存 Gateway 归一化的资料和关系状态。
  const [profile, setProfile] = useState<WebIMPeerProfile | null>(null);
  // loading 覆盖首次读取和手动重试。
  const [loading, setLoading] = useState(false);
  // actionPending 阻止重复创建单聊。
  const [actionPending, setActionPending] = useState(false);
  // error 显示真实 SDK/Gateway/clipboard 失败。
  const [error, setError] = useState<string | null>(null);

  /** 读取真实联系人资料，不降级为路由参数拼装。 */
  const loadProfile = useCallback(async (): Promise<void> => {
    if (!runtime || !snapshot.userID || !userID) return;
    setLoading(true);
    setError(null);
    try {
      setProfile(await runtime.getSync().peerProfile.get(userID));
    } catch (cause) {
      setError(readContactProfileError(cause));
    } finally {
      setLoading(false);
    }
  }, [runtime, snapshot.userID, userID]);

  useEffect(() => { void loadProfile(); }, [loadProfile]);

  /** 创建并持久化真实单聊后进入现有聊天 route。 */
  const openConversation = useCallback(async (): Promise<void> => {
    if (!runtime || !profile || actionPending) return;
    setActionPending(true);
    setError(null);
    try {
      // conversation 已由 SDK 写入当前账号 SQLite。
      const conversation = await runtime.getSync().peerProfile
        .openConversation(profile.userID);
      navigate(`/conversations/${encodeURIComponent(conversation.conversationID)}`);
    } catch (cause) {
      setError(readContactProfileError(cause, '打开会话失败，请重试'));
    } finally {
      setActionPending(false);
    }
  }, [actionPending, navigate, profile, runtime]);

  /** 复制按钮只在浏览器 clipboard 成功后结束。 */
  const copyUserID = useCallback(async (): Promise<void> => {
    if (!profile) return;
    try {
      await navigator.clipboard.writeText(profile.userID);
    } catch {
      setError('复制用户ID失败');
    }
  }, [profile]);

  // primaryAction 只公开本切片已具备真实 owner 的动作。
  const primaryAction = useMemo(
    () => profile ? getContactProfilePrimaryAction(profile.relationship) : null,
    [profile],
  );

  if (restoring) return <ContactProfilePageState label="正在恢复联系人资料" />;
  if (!runtime) {
    return <ContactProfilePageState label="运行配置不可用" detail={startupError} />;
  }
  if (!snapshot.userID) return <Navigate to="/login" replace />;
  if (!userID) return <Navigate to="/contacts" replace />;

  // genderLabel 只在服务端提供明确值时展示。
  const genderLabel = profile ? getContactProfileGenderLabel(profile.gender) : '';
  // addedAt 只为好友关系展示。
  const addedAt = profile ? formatContactProfileAddedAt(profile.addedAt) : '';
  return (
    <main className="rn-contact-profile-page" aria-busy={loading || actionPending}>
      <section className="rn-contact-profile-surface">
        <ContactProfileHeader backHref="/contacts" />
        {loading && !profile ? (
          <div className="rn-contact-profile-loading" aria-label="正在加载联系人资料"><span /></div>
        ) : profile ? (
          <div className="rn-contact-profile-content">
            {error ? <ContactProfileError error={error} onRetry={loadProfile} /> : null}
            <div className="rn-contact-profile-hero">
              <ContactProfileAvatar {...profile} />
              <div className="rn-contact-profile-name-row">
                <h2>{profile.displayName}</h2>
                {genderLabel ? (
                  <span
                    className={genderLabel === '男' ? 'is-male' : 'is-female'}
                    aria-label={`性别${genderLabel}`}
                  >
                    {genderLabel === '男' ? '♂' : '♀'}
                  </span>
                ) : null}
              </div>
              {profile.nickname && profile.nickname !== profile.displayName ? (
                <p className="rn-contact-profile-nickname">昵称：{profile.nickname}</p>
              ) : null}
              <button type="button" className="rn-contact-profile-id" onClick={() => void copyUserID()}>
                <span>ID：{profile.userID}</span>
                <RNAssetIcon assetURL={copyIconURL} />
              </button>
              {profile.relationship === 'stranger' && profile.bio ? (
                <p className="rn-contact-profile-bio">{profile.bio}</p>
              ) : null}
            </div>

            {primaryAction === 'message' ? (
              <button
                type="button"
                className="rn-contact-profile-primary"
                disabled={actionPending}
                onClick={() => void openConversation()}
              >
                {actionPending ? '正在打开' : '发消息'}
              </button>
            ) : primaryAction === 'add-friend' ? (
              <Link
                className="rn-contact-profile-primary"
                to={buildContactFriendApplicationRoute(profile.userID)}
              >
                加好友
              </Link>
            ) : null}

            {profile.relationship === 'friend' && (profile.bio || addedAt) ? (
              <div className="rn-contact-profile-card">
                {profile.bio ? <ContactProfileRow label="个性签名" value={profile.bio} /> : null}
                {addedAt ? <ContactProfileRow label="添加时间" value={addedAt} last /> : null}
              </div>
            ) : null}
          </div>
        ) : error ? (
          <div className="rn-contact-profile-empty-error">
            <ContactProfileError error={error} onRetry={loadProfile} />
          </div>
        ) : null}
      </section>
    </main>
  );
}

/** 联系人资料信息行参数。 */
interface ContactProfileRowProps {
  readonly label: string;
  readonly value: string;
  readonly last?: boolean;
}

/** 渲染 RN 56px 左右 flex 信息行。 */
function ContactProfileRow({ label, value, last = false }: ContactProfileRowProps) {
  return (
    <div className={`rn-contact-profile-row${last ? ' is-last' : ''}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

/** 联系人资料错误条参数。 */
interface ContactProfileErrorProps {
  readonly error: string;
  readonly onRetry: () => Promise<void>;
}

/** 显示真实失败并提供同一 facade 重试。 */
function ContactProfileError({ error, onRetry }: ContactProfileErrorProps) {
  return (
    <div className="rn-contact-profile-error" role="alert">
      <span>{error}</span>
      <button type="button" onClick={() => void onRetry()}>重试</button>
    </div>
  );
}

/** 联系人资料启动状态参数。 */
interface ContactProfilePageStateProps {
  readonly label: string;
  readonly detail?: string | null;
}

/** 统一承载资料页启动和配置错误。 */
function ContactProfilePageState({ label, detail }: ContactProfilePageStateProps) {
  return <main className="rn-contact-profile-state"><strong>{label}</strong>{detail ? <span>{detail}</span> : null}</main>;
}

/** 将未知异常收敛为不含凭据的页面文案。 */
function readContactProfileError(
  cause: unknown,
  fallback = '联系人资料加载失败，请重试',
): string {
  return cause instanceof Error && cause.message ? cause.message : fallback;
}
