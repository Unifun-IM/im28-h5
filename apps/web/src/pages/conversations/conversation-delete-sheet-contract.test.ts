import { describe, expect, it } from 'vitest';

import sheetSource from './ConversationDeleteSheet.tsx?raw';

/** 会话删除层契约防止 modal 回到 Tab 场景内并再次悬空。 */
describe('conversation delete sheet contract', () => {
  it('portals the native dialog to body and applies the viewport sheet class', () => {
    expect(sheetSource).toContain('createPortal(');
    expect(sheetSource).toContain('document.body');
    expect(sheetSource).toContain('className="rn-conversation-delete-backdrop"');
    expect(sheetSource).toContain('placement="bottom"');
    expect(sheetSource).toContain('className="rn-conversation-delete-sheet im-modal-sheet"');
  });

  it('renders the all-members action only through the resolved permission prop', () => {
    expect(sheetSource).toContain('{canDeleteForAll ? (');
    expect(sheetSource).toContain("'为我和所有群成员删除'");
  });
});
