import { Link } from 'react-router-dom';

import backIconURL from '../../assets/rn/assets/icons/imm28/nav-arrow-left.regular.svg';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';
import { PageNavbar } from '../../components/navigation/PageNavbar.js';

/** 个人资料全屏页共用的 RN 顶栏参数。 */
interface MeProfileHeaderProps {
  readonly title: string;
  readonly backHref: string;
  readonly onBack?: () => void;
  readonly backLabel?: string | undefined;
  readonly backDisabled?: boolean;
  readonly actionLabel?: string;
  readonly actionDisabled?: boolean;
  readonly actionPending?: boolean;
  readonly onAction?: () => void;
}

/** 渲染 RN 94px 顶栏和 route-owned 返回/完成操作。 */
export function MeProfileHeader({
  title,
  backHref,
  onBack,
  backLabel,
  backDisabled = false,
  actionLabel,
  actionDisabled = false,
  actionPending = false,
  onAction,
}: MeProfileHeaderProps) {
  return (
    <PageNavbar className="rn-me-profile-header">
      {onBack ? (
        <button className="rn-me-profile-back-action" type="button" aria-label={backLabel ?? '返回'} disabled={backDisabled} onClick={onBack}>
          {backLabel ? <span>{backLabel}</span> : <RNAssetIcon assetURL={backIconURL} />}
        </button>
      ) : (
        <Link className="rn-me-profile-back-action" to={backHref} aria-label="返回">
          <RNAssetIcon assetURL={backIconURL} />
        </Link>
      )}
      {title ? <h1>{title}</h1> : <span aria-hidden="true" />}
      {actionLabel && onAction ? (
        <button className={`rn-me-profile-save-action${actionPending ? ' is-pending' : ''}`} type="button" disabled={actionDisabled} onClick={onAction}>
          {actionPending ? <span className="rn-me-profile-save-spinner" role="status" aria-label="正在保存" /> : actionLabel}
        </button>
      ) : <span />}
    </PageNavbar>
  );
}
