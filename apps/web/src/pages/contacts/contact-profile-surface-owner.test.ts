import { describe, expect, it } from 'vitest';

import pageSource from './ContactProfilePage.tsx?raw';
import surfaceSource from './ContactProfileSurface.tsx?raw';

/** 联系人资料 owner 合同防止页面与 Surface 再次形成双业务主路径。 */
describe('contact profile surface owner', () => {
  /** 页面独占 runtime、资料读取、Router 与 action 编排。 */
  it('keeps state and operations in the page owner', () => {
    expect(pageSource).toContain('runtime.getSync().peerProfile.get(userID)');
    expect(pageSource).toContain('useContactProfileActions({');
    expect(pageSource).toContain('useContactProfileGroupContext({');
    expect(pageSource).toContain('<ContactProfileSurface');
    expect(surfaceSource).not.toMatch(/useWebIMRuntime|useNavigate|runtime\.getSync|useContactProfileActions/);
  });

  /** Surface 独占稳定正文 JSX 且只通过回调请求动作。 */
  it('keeps stable profile presentation in one bounded surface', () => {
    expect(surfaceSource).toContain('rn-contact-profile-content');
    expect(surfaceSource).toContain('rn-contact-profile-quick-actions');
    expect(surfaceSource).toContain('onOpenConversation');
    expect(pageSource).not.toContain('rn-contact-profile-content');
    expect(pageSource.split('\n').length).toBeLessThanOrEqual(301);
    expect(surfaceSource.split('\n').length).toBeLessThanOrEqual(301);
  });
});
