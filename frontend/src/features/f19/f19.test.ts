import { describe, it, expect } from 'vitest';
import { WellComparison } from './WellComparison';

describe('F19 Well Comparison', () => {
  it('exports WellComparison component correctly', () => {
    expect(WellComparison).toBeDefined();
    expect(typeof WellComparison).toBe('function');
  });
});
