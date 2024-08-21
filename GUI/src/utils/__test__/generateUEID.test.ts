import { generateUEID } from '../generateUEID';

describe('generateUEID', () => {
  it('should return a string of length 6', () => {
    const ueid = generateUEID();
    expect(ueid).toHaveLength(6);
  });

  it('should return an alphanumeric string', () => {
    const ueid = generateUEID();
    expect(ueid).toMatch(/^[a-z0-9]{6}$/);
  });

  it('should generate unique IDs across multiple invocations', () => {
    const ids = new Set<string>();
    for (let i = 0; i < 10000; i++) {
      ids.add(generateUEID());
    }
    // Ensure that all generated IDs are unique
    expect(ids.size).toBe(10000);
  });
});
