import type { CSSProperties } from 'react';

import searchIconURL from '../../assets/rn/assets/icons/imm28/search.regular.svg';
import clearIconURL from '../../assets/rn/assets/icons/imm28/xmark-circle.solid.svg';
import { InteractionModal } from '../../components/interaction/index.js';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';
import {
  getRNAvatarGradient,
  getRNAvatarInitial,
} from '../../components/rn-avatar-view.js';
import type { CreateGroupCandidate } from './create-group-view.js';

/** 已选好友栏和复核层共用的页面参数。 */
interface CreateGroupSelectedFriendsProps {
  readonly candidates: readonly CreateGroupCandidate[];
  readonly disabled: boolean;
  readonly open: boolean;
  readonly onOpenSearch: () => void;
  readonly onOpenReview: () => void;
  readonly onClear: () => void;
  readonly onCloseReview: () => void;
  readonly onToggle: (userID: string) => void;
}

/** 对齐 RN 已选好友搜索、头像预览、清空和底部复核交互。 */
export function CreateGroupSelectedFriends({
  candidates,
  disabled,
  open,
  onOpenSearch,
  onOpenReview,
  onClear,
  onCloseReview,
  onToggle,
}: CreateGroupSelectedFriendsProps) {
  return (
    <>
      <div className="rn-create-group-selected-bar">
        <button type="button" aria-label="查找群聊" disabled={disabled} onClick={onOpenSearch}>
          <RNAssetIcon assetURL={searchIconURL} />
        </button>
        <div className="rn-create-group-selected-shell">
          <button
            className="rn-create-group-selected-preview"
            type="button"
            aria-label="查看已选好友详情"
            disabled={disabled}
            onClick={onOpenReview}
          >
            <span className="rn-create-group-selected-avatars">
              {candidates.slice(0, 5).map(candidate => (
                <CreateGroupSelectedAvatar key={candidate.contact.userID} candidate={candidate} />
              ))}
              {candidates.length > 5 ? (
                <span className="rn-create-group-selected-overflow">+{candidates.length - 5}</span>
              ) : null}
            </span>
          </button>
          <button
            className="rn-create-group-selected-clear"
            type="button"
            aria-label={`清空已选好友，共 ${candidates.length} 人`}
            disabled={disabled}
            onClick={onClear}
          >
            <RNAssetIcon assetURL={clearIconURL} />
          </button>
        </div>
      </div>
      <InteractionModal
        open={open}
        ariaLabel="已选好友"
        className="rn-create-group-selected-modal"
        placement="bottom"
        onRequestClose={onCloseReview}
      >
        <section className="rn-create-group-selected-sheet im-modal-sheet">
          <span className="rn-create-group-selected-handle" aria-hidden="true" />
          <h2>已选好友（{candidates.length}）</h2>
          <div className="rn-create-group-selected-list">
            {candidates.map(candidate => (
              <button
                type="button"
                key={candidate.contact.userID}
                aria-label={`取消选择好友${candidate.displayName}`}
                disabled={disabled}
                onClick={() => onToggle(candidate.contact.userID)}
              >
                <CreateGroupSelectedAvatar candidate={candidate} />
                <strong>{candidate.displayName}</strong>
                <span className="rn-create-group-selected-check">✓</span>
              </button>
            ))}
          </div>
        </section>
      </InteractionModal>
    </>
  );
}

/** 已选好友头像复用 RN 稳定渐变和真实头像失败回退。 */
function CreateGroupSelectedAvatar({ candidate }: {
  readonly candidate: CreateGroupCandidate;
}) {
  /** avatarStyle 把稳定身份映射到已有 RN fallback 渐变。 */
  const avatarStyle = {
    '--create-group-selected-avatar-gradient': getRNAvatarGradient(candidate.contact.userID),
  } as CSSProperties;
  return (
    <span className="rn-create-group-selected-avatar" style={avatarStyle}>
      <span>{getRNAvatarInitial(candidate.displayName, '友')}</span>
      {candidate.contact.avatarURL ? (
        <img
          src={candidate.contact.avatarURL}
          alt=""
          onError={event => { event.currentTarget.hidden = true; }}
        />
      ) : null}
    </span>
  );
}
