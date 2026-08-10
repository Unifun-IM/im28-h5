import type { CSSProperties } from 'react';
import type { GatewayCall } from '@im28/im-sdk/web';

import directionIconURL from '../../assets/rn/assets/icons/imm28/arrow-up-right.regular.svg';
import checkedIconURL from '../../assets/rn/assets/icons/imm28/check-circle.solid.svg';
import uncheckedIconURL from '../../assets/rn/assets/icons/imm28/circle.regular.svg';
import phoneDisabledIconURL from '../../assets/rn/assets/icons/imm28/phone-disabled.dynamic.svg';
import phoneIconURL from '../../assets/rn/assets/icons/imm28/phone-paused.dynamic.svg';
import videoDisabledIconURL from '../../assets/rn/assets/icons/imm28/video-camera-off.dynamic.svg';
import videoIconURL from '../../assets/rn/assets/icons/imm28/video-camera.dynamic.svg';
import { getRNAvatarGradient, getRNAvatarInitial } from '../../components/rn-avatar-view.js';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';
import {
  formatCallStatus,
  formatCallTime,
  getCallDirection,
  getCallDisplayName,
  getCallID,
  getCallPeerID,
  isCanceledCall,
  isMissedCall,
} from './call-list-view.js';

/** 通话记录行参数。 */
interface CallRecordRowProps {
  readonly call: GatewayCall;
  readonly editing: boolean;
  readonly selected: boolean;
  readonly selfID: string;
  readonly onToggle: (callID: string) => void;
}

/** 渲染 RN 通话记录行，不暴露未迁移的详情或 RTC 操作。 */
export function CallRecordRow({
  call,
  editing,
  selected,
  selfID,
  onToggle,
}: CallRecordRowProps) {
  // callID 驱动编辑选择与 React key。
  const callID = getCallID(call);
  // peerID 提供头像色和回退显示。
  const peerID = getCallPeerID(call, selfID);
  // name 遵循 RN nickname -> peer ID 回退。
  const name = getCallDisplayName(call, selfID);
  // missed 只由 answer_status 判定。
  const missed = isMissedCall(call);
  // avatarStyle 复用 RN 稳定渐变算法。
  const avatarStyle = {
    '--call-avatar-gradient': getRNAvatarGradient(peerID || callID),
  } as CSSProperties;
  // statusIconURL 根据音视频和取消态选择 RN 原资产。
  const statusIconURL = call.call_type === 'video'
    ? isCanceledCall(call) ? videoDisabledIconURL : videoIconURL
    : isCanceledCall(call) ? phoneDisabledIconURL : phoneIconURL;
  // incoming 控制方向箭头旋转。
  const incoming = getCallDirection(call, selfID) === 'incoming';

  return (
    <article className={`rn-call-row${editing ? ' is-editing' : ''}`}>
      {editing ? (
        <button
          type="button"
          className="rn-call-select"
          aria-label={`选择${name}`}
          aria-pressed={selected}
          onClick={() => onToggle(callID)}
        >
          <RNAssetIcon assetURL={selected ? checkedIconURL : uncheckedIconURL} />
        </button>
      ) : null}
      <div className="rn-call-row-content">
        <span className="rn-call-avatar" style={avatarStyle}>
          <span>{getRNAvatarInitial(name || peerID)}</span>
          {call.avatar_url?.trim() ? <img src={call.avatar_url} alt="" loading="lazy" onError={event => {
            event.currentTarget.hidden = true;
          }} /> : null}
        </span>
        <div className="rn-call-body">
          <div className="rn-call-text">
            <strong className={missed ? 'is-missed' : ''}>{name}</strong>
            <span className="rn-call-meta">
              <RNAssetIcon assetURL={statusIconURL} />
              {formatCallStatus(call)}
            </span>
          </div>
          <div className={`rn-call-side${missed ? ' is-missed' : ''}`}>
            <time>{formatCallTime(call.started_at)}</time>
            <RNAssetIcon assetURL={directionIconURL} className={incoming ? 'is-incoming' : ''} />
          </div>
        </div>
      </div>
    </article>
  );
}
