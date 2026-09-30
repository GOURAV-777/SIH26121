import { describe, it, expect } from 'vitest';
import { CasingProgram } from './CasingProgram';

describe('F21 Casing & Mud Programme', () => {
  it('exports CasingProgram component correctly', () => {
    expect(CasingProgram).toBeDefined();
    expect(typeof CasingProgram).toBe('function');
  });
});
