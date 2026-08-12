import announcementIconURL from '../../assets/rn/assets/icons/imm28/announcement-megaphone.svg';
import arrowIconURL from '../../assets/rn/assets/icons/imm28/nav-arrow-right.dynamic.svg';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';

/** 聊天页公告横幅参数只包含展示文本和显式查看动作。 */
interface ChatGroupAnnouncementBannerProps {
  readonly text: string;
  readonly onOpen: () => void;
}

/** 对齐 RN 的两行群公告查看横幅。 */
export function ChatGroupAnnouncementBanner({
  text,
  onOpen,
}: ChatGroupAnnouncementBannerProps) {
  return (
    <button
      type="button"
      className="rn-chat-announcement"
      aria-label="查看群公告"
      onClick={onOpen}
    >
      <RNAssetIcon assetURL={announcementIconURL} />
      <span>{text}</span>
      <RNAssetIcon assetURL={arrowIconURL} />
    </button>
  );
}
