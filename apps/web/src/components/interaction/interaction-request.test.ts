import { describe, expect, it } from 'vitest';

import { isCurrentInteractionRequest } from './interaction-request.js';

/** 页面异步交互只接受最后一次请求代次。 */
describe('interaction request generation', () => {
  it('accepts only an equal current request id', () => {
    expect(isCurrentInteractionRequest(7, 7)).toBe(true);
    expect(isCurrentInteractionRequest(8, 7)).toBe(false);
  });
});
