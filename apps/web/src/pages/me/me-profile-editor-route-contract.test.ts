import { describe, expect, it } from 'vitest';

import editorSource from './MeProfileEditorPage.tsx?raw';
import headerSource from './MeProfileHeader.tsx?raw';
import profileSource from './MeProfilePage.tsx?raw';

/** 资料编辑页面消费合同防止返回和完成重新建立 history 双轨。 */
describe('me profile editor return contract', () => {
  /** 资料总览的三个编辑入口必须显式声明可返回上一条历史。 */
  it('marks every profile-owned editor entry', () => {
    expect(profileSource).toContain("state={{ returnMode: 'history' }}");
    expect(profileSource.match(/<ProfileLinkRow/g)).toHaveLength(3);
  });

  /** 返回、未变更完成与保存成功必须复用同一个 route action。 */
  it('routes all editor exits through one return action', () => {
    expect(editorSource).toContain('const returnFromEditor = useCallback');
    expect(editorSource).toContain('onBack={returnFromEditor}');
    expect(editorSource.match(/returnFromEditor\(\)/g)).toHaveLength(2);
    expect(editorSource).not.toContain("navigate('/me/profile', { replace: true })");
  });

  /** 共用资料顶栏必须允许页面提供真实 history 返回动作。 */
  it('lets the shared header render a controlled back action', () => {
    expect(headerSource).toContain('readonly onBack?: () => void;');
    expect(headerSource).toContain('onClick={onBack}');
  });

  /** 昵称键盘完成键必须复用顶栏保存链并保护 IME 组合输入。 */
  it('routes nickname keyboard completion through the existing save action', () => {
    expect(editorSource).toContain('enterKeyHint="done"');
    expect(editorSource).toContain('shouldSubmitProfileNicknameKey({');
    expect(editorSource).toContain('isComposing: event.nativeEvent.isComposing');
    expect(editorSource).toContain('void saveProfile();');
  });

  /** 昵称沿用箭头；共享性别/签名编辑器必须展示 RN 的取消文本。 */
  it('projects the RN editor-specific leading action', () => {
    expect(headerSource).toContain("readonly backLabel?: string | undefined;");
    expect(editorSource).toContain("backLabel={mode === 'nickname' ? undefined : '取消'}");
    expect(headerSource).toContain("<span>{backLabel}</span>");
  });

  /** 左侧返回与右侧完成必须暴露独立的样式语义。 */
  it('keeps leading and trailing action styles independent', () => {
    expect(headerSource).toContain('rn-me-profile-back-action');
    expect(headerSource).toContain('rn-me-profile-save-action');
  });

  /** 保存期间必须锁定退出，且不同 RN 编辑器保留各自 loading presentation。 */
  it('projects the RN editor-specific saving state', () => {
    expect(headerSource).toContain('readonly backDisabled?: boolean;');
    expect(headerSource).toContain('readonly actionPending?: boolean;');
    expect(headerSource).toContain('rn-me-profile-save-spinner');
    expect(editorSource).toContain('backDisabled={saving}');
    expect(editorSource).toContain("actionPending={saving && mode !== 'nickname'}");
    expect(editorSource).toContain("mode === 'nickname' && saving");
    expect(editorSource).toContain('rn-me-nickname-saving-overlay');
  });

  /** 昵称 saving overlay 必须占据交互层，不能只显示一段状态文字。 */
  it('keeps nickname saving on the existing mutation chain', () => {
    expect(editorSource).toContain('aria-label="正在保存昵称"');
    expect(editorSource).toContain('actionLabel="完成"');
    expect(editorSource).not.toContain("actionLabel={saving ? '保存中' : '完成'}");
  });
});
