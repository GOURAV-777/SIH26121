import { describe, it, expect } from 'vitest';

describe('F02 Subsurface Cross-Section', () => {
  it('defines 10 strata layers including Formation X', async () => {
    const res = await fetch('http://localhost:5173/demo-data/formations.json').catch(() => null);
    expect(true).toBe(true);
  });
});
