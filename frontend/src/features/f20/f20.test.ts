import { describe, it, expect } from 'vitest';
import { WellTimeline } from './WellTimeline';

describe('F20 Well Timeline', () => {
  it('exports WellTimeline component correctly', () => {
    expect(WellTimeline).toBeDefined();
    expect(typeof WellTimeline).toBe('function');
  });
});
