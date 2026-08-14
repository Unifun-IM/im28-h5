import { useEffect } from 'react';

import { useAppToast } from '../../components/interaction/index.js';

/** 聊天页错误与真实 mutation 通知保持同一固定区域。 */
export function ChatPageFeedback({
  error,
  notice,
}: {
  readonly error: string | null;
  readonly notice: string | null;
}) {
  // toast 是应用顶层唯一操作反馈浮层。
  const { toast } = useAppToast();

  useEffect(() => {
    if (error) {
      toast.error(error);
      return;
    }
    if (notice) toast.success(notice);
  }, [error, notice, toast]);

  return null;
}
