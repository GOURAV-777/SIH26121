import { describe, it, expect } from 'vitest';
import { DemoGuideOverlay, DEMO_TOUR_STEPS } from './DemoGuideOverlay';

describe('F23 Guided Demo Mode', () => {
  it('exports DemoGuideOverlay and tour steps correctly', () => {
    expect(DemoGuideOverlay).toBeDefined();
    expect(typeof DemoGuideOverlay).toBe('function');
    expect(DEMO_TOUR_STEPS.length).toBe(8);
  });
});
