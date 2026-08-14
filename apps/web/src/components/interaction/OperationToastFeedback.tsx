import { useEffect } from 'react';

import { useAppToast } from './AppToast.js';

/** 操作结果适配器参数不接收加载、权限或可重试结构状态。 */
export interface OperationToastFeedbackProps {
  readonly error?: string | null;
  readonly notice?: string | null;
}

/** 将页面已分类的瞬时操作结果投递给唯一全局 Toast owner。 */
export function OperationToastFeedback({
  error = null,
  notice = null,
}: OperationToastFeedbackProps) {
  /** toast 是应用顶层唯一的操作提示命令通道。 */
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
