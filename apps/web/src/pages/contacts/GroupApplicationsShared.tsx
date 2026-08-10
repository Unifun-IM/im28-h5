import { Link } from 'react-router-dom';

import backIconURL from '../../assets/rn/assets/icons/imm28/nav-arrow-left.regular.svg';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';

/** 群申请页面共享导航栏参数。 */
interface GroupApplicationsHeaderProps { readonly title: string; readonly backTo: string }

/** 群申请页面共享 RN 导航栏。 */
export function GroupApplicationsHeader({ title, backTo }: GroupApplicationsHeaderProps) {
  return <header className="rn-group-applications-header"><Link to={backTo} aria-label="返回"><RNAssetIcon assetURL={backIconURL} /></Link><h1>{title}</h1><span /></header>;
}

/** 群申请错误状态参数。 */
interface GroupApplicationsErrorProps { readonly message: string; readonly onRetry: () => void }

/** 群申请页面共享真实失败状态。 */
export function GroupApplicationsError({ message, onRetry }: GroupApplicationsErrorProps) {
  return <div className="rn-group-applications-error" role="status"><span>{message}</span><button type="button" onClick={onRetry}>重试</button></div>;
}

/** 群申请启动状态参数。 */
interface GroupApplicationsPageStateProps { readonly label: string; readonly detail?: string | null }

/** 统一承载群申请启动状态。 */
export function GroupApplicationsPageState({ label, detail }: GroupApplicationsPageStateProps) {
  return <main className="rn-group-applications-state"><strong>{label}</strong>{detail ? <span>{detail}</span> : null}</main>;
}
