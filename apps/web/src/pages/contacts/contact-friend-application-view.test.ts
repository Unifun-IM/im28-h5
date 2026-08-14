import { describe, expect, it } from 'vitest';

import applicationPageSource from './ContactFriendApplicationPage.tsx?raw';
import { resolveApplicationMessageUpdate } from './application-message-view.js';

/** 好友申请页只在用户尚未编辑时跟随本人昵称更新缺省验证语。 */
describe('contact friend application view', () => {
  it('异步昵称返回时替换仍未编辑的缺省值', () => {
    expect(resolveApplicationMessageUpdate({
      currentMessage: '你好，我想添加你为好友',
      previousDefaultMessage: '你好，我想添加你为好友',
      nextDefaultMessage: '我是donk，请通过好友验证',
    })).toEqual({
      defaultMessage: '我是donk，请通过好友验证',
      message: '我是donk，请通过好友验证',
    });
  });

  it('异步昵称返回时保留用户已经编辑的验证语', () => {
    expect(resolveApplicationMessageUpdate({
      currentMessage: '我们在群里聊过',
      previousDefaultMessage: '你好，我想添加你为好友',
      nextDefaultMessage: '我是donk，请通过好友验证',
    })).toEqual({
      defaultMessage: '我是donk，请通过好友验证',
      message: '我们在群里聊过',
    });
  });

  it('页面读取本人资料并在真实申请成功后替换回资料路由', () => {
    expect(applicationPageSource).toContain('runtime.getSync().profile.getCurrent()');
    expect(applicationPageSource).toContain('buildIMSelfFriendApplicationMessage');
    expect(applicationPageSource).toMatch(
      /navigate\(buildContactProfileRoute\(profile\.userID\),\s*\{\s*replace: true,\s*state: profileRouteState,?\s*\}\)/,
    );
    expect(applicationPageSource).not.toContain('setSubmitted(true)');
  });
});
