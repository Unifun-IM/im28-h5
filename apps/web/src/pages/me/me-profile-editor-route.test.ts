import { describe, expect, it } from 'vitest';

import {
  readMeProfileEditorRouteState,
  resolveMeProfileEditorReturn,
} from './me-profile-editor-route.js';

/** 个人资料编辑返回合同区分资料页进入与深链/快捷入口。 */
describe('me profile editor route', () => {
  /** 只有资料页显式写入的精确字面量允许消费浏览器历史。 */
  it('accepts only the explicit profile history source', () => {
    expect(readMeProfileEditorRouteState({ returnMode: 'history' })).toEqual({
      returnMode: 'history',
    });
    expect(readMeProfileEditorRouteState(null)).toEqual({ returnMode: 'profile' });
    expect(readMeProfileEditorRouteState({ returnMode: true })).toEqual({ returnMode: 'profile' });
    expect(readMeProfileEditorRouteState({ returnMode: 'back' })).toEqual({ returnMode: 'profile' });
  });

  /** 资料页进入返回上一条历史，深链和首页快捷入口 replace 到资料页。 */
  it('projects one non-looping return action', () => {
    expect(resolveMeProfileEditorReturn({ returnMode: 'history' })).toEqual({
      destination: -1,
      replace: false,
    });
    expect(resolveMeProfileEditorReturn({ returnMode: 'profile' })).toEqual({
      destination: '/me/profile',
      replace: true,
    });
  });
});
