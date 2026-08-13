import { useCallback, useEffect, useState, type CSSProperties } from 'react';
import type { IMContactCommonGroup } from '@im28/im-sdk/web';
import { Navigate, useNavigate, useParams } from 'react-router-dom';

import { getRNAvatarGradient, getRNAvatarInitial } from '../../components/rn-avatar-view.js';
import { useWebIMRuntime } from '../../runtime/index.js';
import { ContactProfileHeader } from './ContactProfileShared.js';
import './contact-common-groups-page.css';

/** RN 共同群聊页消费 SDK 完整分页结果和 canonical 会话 facade。 */
export function ContactCommonGroupsPage() {
  /** runtime 是页面唯一 SDK owner。 */
  const { runtime, snapshot, restoring, startupError } = useWebIMRuntime();
  /** userID 是共同群聊查询的稳定目标。 */
  const { userID: routeUserID = '' } = useParams();
  /** userID 统一清理 URL 参数。 */
  const userID = routeUserID.trim();
  /** navigate 只进入真实命中的群会话。 */
  const navigate = useNavigate();
  /** groups 保存 shared facade 完整分页投影。 */
  const [groups, setGroups] = useState<readonly IMContactCommonGroup[]>([]);
  /** loading 覆盖远端读取轮次。 */
  const [loading, setLoading] = useState(false);
  /** openingGroupID 阻止重复解析同一群会话。 */
  const [openingGroupID, setOpeningGroupID] = useState('');
  /** error 显示真实 SDK 或会话解析失败。 */
  const [error, setError] = useState<string | null>(null);

  /** 通过共享联系人动作 facade 完整拉取共同群聊。 */
  const loadGroups = useCallback(async (): Promise<void> => {
    if (!runtime || !snapshot.userID || !userID) return;
    setLoading(true);
    setError(null);
    try {
      setGroups(await runtime.getSync().contacts.listCommonGroups({
        targetUserID: userID,
        pageSize: 50,
      }));
    } catch (cause) {
      setError(readCommonGroupsError(cause));
    } finally {
      setLoading(false);
    }
  }, [runtime, snapshot.userID, userID]);

  useEffect(() => { void loadGroups(); }, [loadGroups]);

  /** 通过 shared 会话 facade 打开规范群会话后进入聊天页。 */
  const openGroup = useCallback(async (group: IMContactCommonGroup): Promise<void> => {
    if (!runtime || openingGroupID) return;
    setOpeningGroupID(group.groupID);
    setError(null);
    try {
      /** conversation 由 SDK 统一完成 cache、Gateway 身份校验和 SQLite 收敛。 */
      const conversation = await runtime.getSync().conversations.openGroup({
        groupID: group.groupID,
        conversationID: group.conversationID,
      });
      navigate(`/conversations/${encodeURIComponent(conversation.conversationID)}`);
    } catch (cause) {
      setError(readCommonGroupsError(cause, '打开群聊失败'));
    } finally {
      setOpeningGroupID('');
    }
  }, [navigate, openingGroupID, runtime]);

  if (restoring) return <CommonGroupsState label="正在恢复共同群聊" />;
  if (!runtime) return <CommonGroupsState label="运行配置不可用" detail={startupError} />;
  if (!snapshot.userID) return <Navigate to="/login" replace />;
  if (!userID) return <Navigate to="/contacts" replace />;

  return (
    <main className="rn-contact-common-groups-page" aria-busy={loading}>
      <section className="rn-contact-common-groups-surface">
        <ContactProfileHeader
          backHref={`/contacts/users/${encodeURIComponent(userID)}`}
          title="共同群聊"
        />
        {error ? (
          <div className="rn-contact-common-groups-error" role="alert">
            <span>{error}</span>
            <button type="button" onClick={() => void loadGroups()}>重试</button>
          </div>
        ) : null}
        <section className="rn-contact-common-groups-list" aria-label="共同群聊列表">
          {groups.map(group => (
            <CommonGroupRow
              key={group.groupID}
              group={group}
              opening={openingGroupID === group.groupID}
              onOpen={() => void openGroup(group)}
            />
          ))}
          {loading && groups.length === 0 ? <div className="rn-contact-common-groups-loading"><span /></div> : null}
          {!loading && !error && groups.length === 0 ? <p>暂无共同群聊</p> : null}
        </section>
      </section>
    </main>
  );
}

/** 共同群聊行参数。 */
interface CommonGroupRowProps {
  readonly group: IMContactCommonGroup;
  readonly opening: boolean;
  readonly onOpen: () => void;
}

/** 渲染 RN 40px 群头像和单行描述。 */
function CommonGroupRow({ group, opening, onOpen }: CommonGroupRowProps) {
  /** avatarStyle 复用 RN 稳定头像渐变。 */
  const avatarStyle = {
    '--contact-common-group-gradient': getRNAvatarGradient(group.groupID),
  } as CSSProperties;
  return (
    <button type="button" className="rn-contact-common-group-row" disabled={opening} onClick={onOpen}>
      <span className="rn-contact-common-group-avatar" style={avatarStyle}>
        <span>{getRNAvatarInitial(group.name, '群')}</span>
        {group.avatarURL ? <img src={group.avatarURL} alt="" onError={event => { event.currentTarget.hidden = true; }} /> : null}
      </span>
      <span className="rn-contact-common-group-body">
        <strong>{group.name}</strong>
        <small>{group.introduction || `${group.memberCount}人`}</small>
        {opening ? <i aria-label="正在打开" /> : null}
      </span>
    </button>
  );
}

/** 共同群聊启动状态参数。 */
interface CommonGroupsStateProps {
  readonly label: string;
  readonly detail?: string | null;
}

/** 统一呈现共同群聊启动和配置错误。 */
function CommonGroupsState({ label, detail }: CommonGroupsStateProps) {
  return <main className="rn-contact-common-groups-state"><strong>{label}</strong>{detail ? <span>{detail}</span> : null}</main>;
}

/** 将未知异常转换为不含凭据的页面文案。 */
function readCommonGroupsError(cause: unknown, fallback = '共同群聊加载失败'): string {
  return cause instanceof Error && cause.message ? cause.message : fallback;
}

export default ContactCommonGroupsPage;
