import { expect } from '@jest/globals';
import { installSnap } from '@metamask/snaps-jest';
import { panel, text } from '@metamask/snaps-sdk';

describe('onRpcRequest', () => {
  describe('Initialize', () => {
    it('Simple test', async () => {
      expect(1).toBe(1);
    });
  });
});
