import { describe, expect, it } from 'vitest';

import pageSource from './GroupRemoveMembersPage.tsx?raw';

/** 群成员移除回归确保选择和 destructive mutation 之间保留二次确认。 */
describe('group member removal confirmation', () => {
  it('只在底部二次确认后调用 shared mutation', () => {
    expect(pageSource).toContain('onClick={() => setConfirmOpen(true)}');
    expect(pageSource).toContain('open={confirmOpen}');
    expect(pageSource).toContain('placement="bottom"');
    expect(pageSource).toContain('void confirmRemoval()');
    expect(pageSource).toContain('sync.groupMembers.removeMembers({');
  });

  it('确认层占满视口宽度并保留取消动作', () => {
    expect(pageSource).toContain('className="rn-group-remove-confirm-modal"');
    expect(pageSource).toContain('className="rn-group-remove-confirm im-modal-sheet"');
    expect(pageSource).toContain('>取消</button>');
  });
});
