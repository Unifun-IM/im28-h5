/** 资料编辑页只接受资料总览写入的历史返回标记。 */
export interface MeProfileEditorRouteState {
  readonly returnMode: 'history' | 'profile';
}

/** 编辑页退出动作区分真实历史返回与深链安全回退。 */
export type MeProfileEditorReturnAction =
  | { readonly destination: -1; readonly replace: false }
  | { readonly destination: '/me/profile'; readonly replace: true };

/** 将未知 Router state 收敛为不会产生编辑页循环的返回模式。 */
export function readMeProfileEditorRouteState(value: unknown): MeProfileEditorRouteState {
  if (!value || typeof value !== 'object') return { returnMode: 'profile' };
  return Reflect.get(value, 'returnMode') === 'history'
    ? { returnMode: 'history' }
    : { returnMode: 'profile' };
}

/** 为返回、未变更和保存成功投影同一个退出动作。 */
export function resolveMeProfileEditorReturn(
  state: MeProfileEditorRouteState,
): MeProfileEditorReturnAction {
  return state.returnMode === 'history'
    ? { destination: -1, replace: false }
    : { destination: '/me/profile', replace: true };
}
