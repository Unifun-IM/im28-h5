import { Link } from 'react-router-dom';

import { ContactProfileAvatar } from './ContactProfileShared.js';
import { buildContactProfileRoute } from './contact-profile-view.js';
import { splitContactSearchText } from './contact-search-view.js';
import type { ContactSearchProfileLocationState } from './contact-search-view.js';

/** 单个联系人搜索结果行参数。 */
interface ContactSearchUserRowProps {
  readonly userID: string;
  readonly displayName: string;
  readonly avatarURL: string;
  readonly description: string;
  readonly keyword: string;
  readonly profileState: ContactSearchProfileLocationState;
}

/** 渲染 RN 72px 用户搜索行并进入既有资料路由。 */
export function ContactSearchUserRow({
  userID,
  displayName,
  avatarURL,
  description,
  keyword,
  profileState,
}: ContactSearchUserRowProps) {
  return (
    <Link
      className="rn-contact-search-user-row"
      to={buildContactProfileRoute(userID)}
      state={profileState}
    >
      <ContactProfileAvatar
        userID={userID}
        displayName={displayName}
        avatarURL={avatarURL}
        size="row"
      />
      <span className="rn-contact-search-user-body">
        <ContactSearchHighlightedText text={displayName} keyword={keyword} className="is-title" />
        {description ? (
          <ContactSearchHighlightedText text={description} keyword={keyword} className="is-description" />
        ) : null}
      </span>
    </Link>
  );
}

/** 搜索高亮文本参数。 */
interface ContactSearchHighlightedTextProps {
  readonly text: string;
  readonly keyword: string;
  readonly className: string;
}

/** 只通过文本节点渲染安全的关键词高亮。 */
function ContactSearchHighlightedText({
  text,
  keyword,
  className,
}: ContactSearchHighlightedTextProps) {
  return (
    <span className={`rn-contact-search-text ${className}`}>
      {splitContactSearchText(text, keyword).map((part, index) => (
        <span className={part.highlighted ? 'is-highlighted' : undefined} key={`${index}-${part.text}`}>
          {part.text}
        </span>
      ))}
    </span>
  );
}
