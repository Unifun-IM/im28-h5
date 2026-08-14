/** 异步本人资料更新验证语时所需的最小页面状态。 */
export interface ApplicationMessageUpdateInput {
  readonly currentMessage: string;
  readonly previousDefaultMessage: string;
  readonly nextDefaultMessage: string;
}

/** 验证语更新结果同时推进缺省基线并保护用户已经编辑的内容。 */
export interface ApplicationMessageUpdateResult {
  readonly defaultMessage: string;
  readonly message: string;
}

/** 仅在当前内容仍等于旧缺省值时应用异步昵称生成的新文案。 */
export function resolveApplicationMessageUpdate(
  input: ApplicationMessageUpdateInput,
): ApplicationMessageUpdateResult {
  return {
    defaultMessage: input.nextDefaultMessage,
    message: input.currentMessage === input.previousDefaultMessage
      ? input.nextDefaultMessage
      : input.currentMessage,
  };
}
