import { Link, Navigate, useParams } from 'react-router-dom';

import backIconURL from '../../assets/rn/assets/icons/imm28/nav-arrow-left.regular.svg';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';
import { useWebIMRuntime } from '../../runtime/index.js';
import { FriendApplicationsPage } from './FriendApplicationsPage.js';
import { GroupVerificationPage } from './GroupVerificationPage.js';
import './verification-messages-page.css';

/** 验证消息双 tab 的稳定路由值。 */
type VerificationTab = 'friend' | 'group';

/** 按 RN 统一承载好友验证与群聊验证，并复用两侧既有 facade。 */
export function VerificationMessagesPage() {
  // tab 来自 React Router，刷新和前进后退均可恢复当前验证分类。
  const { tab = 'friend' } = useParams<{ tab?: string }>();
  // runtime 只在容器层处理启动和登录守卫，业务读写仍归子页面 facade。
  const { runtime, snapshot, restoring, startupError } = useWebIMRuntime();

  if (tab !== 'friend' && tab !== 'group') return <Navigate to="/contacts/verifications/friend" replace />;
  if (restoring) return <VerificationMessagesState label="正在恢复验证消息" />;
  if (!runtime) return <VerificationMessagesState label="运行配置不可用" detail={startupError} />;
  if (!snapshot.userID) return <Navigate to="/login" replace />;

  // activeTab 经路由值校验后只保留两个合法分支。
  const activeTab: VerificationTab = tab;
  return <main className="rn-verification-messages-page">
    <section className="rn-verification-messages-surface">
      <header className="rn-verification-messages-header">
        <Link to="/contacts" aria-label="返回通讯录"><RNAssetIcon assetURL={backIconURL} /></Link>
        <h1>验证消息</h1><span aria-hidden="true" />
      </header>
      <nav className="rn-verification-messages-tabs" role="tablist" aria-label="验证消息类型">
        <Link role="tab" aria-selected={activeTab === 'friend'} className={activeTab === 'friend' ? 'is-active' : ''} replace to="/contacts/verifications/friend">好友验证</Link>
        <Link role="tab" aria-selected={activeTab === 'group'} className={activeTab === 'group' ? 'is-active' : ''} replace to="/contacts/verifications/group">群聊验证</Link>
      </nav>
      <section className="rn-verification-messages-body">
        {activeTab === 'friend' ? <FriendApplicationsPage /> : <GroupVerificationPage />}
      </section>
    </section>
  </main>;
}

/** 验证消息启动状态参数。 */
interface VerificationMessagesStateProps {
  readonly label: string;
  readonly detail?: string | null;
}

/** 统一承载验证消息启动和配置错误。 */
function VerificationMessagesState({ label, detail }: VerificationMessagesStateProps) {
  return <main className="rn-verification-messages-state"><strong>{label}</strong>{detail ? <span>{detail}</span> : null}</main>;
}
