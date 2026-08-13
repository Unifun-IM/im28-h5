import { Link } from 'react-router-dom';

import backIconURL from '../../assets/rn/assets/icons/imm28/nav-arrow-left.regular.svg';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';
import { PageNavbar } from '../../components/navigation/PageNavbar.js';

/** 个人资料全屏页共用的 RN 顶栏参数。 */
interface MeProfileHeaderProps {
  readonly title: string;
  readonly backHref: string;
  readonly actionLabel?: string;
  readonly actionDisabled?: boolean;
  readonly onAction?: () => void;
}

/** 渲染 RN 94px 顶栏和 route-owned 返回/完成操作。 */
export function MeProfileHeader({
  title,
  backHref,
  actionLabel,
  actionDisabled = false,
  onAction,
}: MeProfileHeaderProps) {
  return (
    <PageNavbar className="rn-me-profile-header">
      <Link to={backHref} aria-label="返回">
        <RNAssetIcon assetURL={backIconURL} />
      </Link>
      {title ? <h1>{title}</h1> : <span aria-hidden="true" />}
      {actionLabel && onAction ? (
        <button type="button" disabled={actionDisabled} onClick={onAction}>
          {actionLabel}
        </button>
      ) : <span />}
    </PageNavbar>
  );
}
