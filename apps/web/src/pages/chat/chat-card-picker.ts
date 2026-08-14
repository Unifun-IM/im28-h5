import type { IMMessageCard } from '@im28/im-sdk/web';

import type { ChatTargetPickerItem } from '../../components/chat-target-picker/index.js';

/** 将全局选择器的中性目标映射为 SDK type108 名片。 */
export function toIMMessageCard(target: ChatTargetPickerItem): IMMessageCard {
  if (target.kind === 'friend') {
    return {
      type: 'user',
      userID: target.id,
      nickname: target.title,
      avatarURL: target.avatarURL,
    };
  }
  return {
    type: 'group',
    groupID: target.id,
    groupName: target.title,
    avatarURL: target.avatarURL,
  };
}
