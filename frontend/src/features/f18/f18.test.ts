import { describe, it, expect } from 'vitest';
import { AnalyticsDashboard } from './AnalyticsDashboard';

describe('F18 Analytics Dashboard', () => {
  it('exports AnalyticsDashboard component correctly', () => {
    expect(AnalyticsDashboard).toBeDefined();
    expect(typeof AnalyticsDashboard).toBe('function');
  });
});
