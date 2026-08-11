/** 分类搜索首页只负责 RN 快捷入口和关键词建议。 */
interface ChatSearchHomePanelProps {
  readonly query: string;
  readonly loading: boolean;
  readonly error: string | null;
  readonly onSearchText: () => void;
  readonly onOpenDate: () => void;
  readonly onOpenMedia: () => void;
  readonly onOpenFile: () => void;
}

/** 复刻 RN 空关键词快捷分类和非空关键词搜索建议。 */
export function ChatSearchHomePanel({
  query,
  loading,
  error,
  onSearchText,
  onOpenDate,
  onOpenMedia,
  onOpenFile,
}: ChatSearchHomePanelProps) {
  /** keyword 决定展示搜索建议还是分类快捷入口。 */
  const keyword = query.trim();
  return (
    <section className="rn-chat-search-home">
      {loading ? <p role="status">加载中</p> : null}
      {error ? <p className="rn-chat-search-error" role="alert">{error}</p> : null}
      {keyword ? (
        <button type="button" className="rn-chat-search-suggestion" onClick={onSearchText}>
          搜索:&quot;{keyword}&quot;
        </button>
      ) : (
        <>
          <h2>搜索指定内容</h2>
          <div className="rn-chat-search-quick-actions">
            <button type="button" onClick={onOpenDate}>日期</button>
            <span aria-hidden="true" />
            <button type="button" onClick={onOpenMedia}>图片与视频</button>
            <span aria-hidden="true" />
            <button type="button" onClick={onOpenFile}>文件</button>
          </div>
        </>
      )}
    </section>
  );
}
