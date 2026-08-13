/** 验证列表刷新编排参数。 */
export interface RefreshVerificationEntriesOptions<Entry> {
  readonly loadEntries: () => Promise<readonly Entry[]>;
  readonly refreshUnread?: (() => void | Promise<void>) | undefined;
}

/** 并行刷新列表和角标，并只以列表结果决定页面成功或失败。 */
export async function refreshVerificationEntries<Entry>({
  loadEntries,
  refreshUnread,
}: RefreshVerificationEntriesOptions<Entry>): Promise<readonly Entry[]> {
  /** results 保证角标端点失败不阻断真实列表，反向也不伪造列表成功。 */
  const results = await Promise.allSettled([
    Promise.resolve().then(loadEntries),
    Promise.resolve().then(() => refreshUnread?.()),
  ]);
  /** entriesResult 是页面内容唯一结果。 */
  const entriesResult = results[0];
  if (entriesResult.status === 'rejected') throw entriesResult.reason;
  return entriesResult.value;
}
