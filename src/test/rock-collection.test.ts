import {describe, it, expect} from 'vitest';
import {collectRock, readRockCollection, nearbyRock} from '@/lib/rock-collection';
describe('Mars rock collection', () => {
  it('collects each named specimen only once', () => {
    expect(collectRock(['jake'], 'jake')).toEqual(['jake']);
    expect(collectRock(['jake'], 'cheyava')).toEqual(['jake','cheyava']);
  });
  it('restores only documented specimens from local storage', () => {
    expect(readRockCollection('["jake","fake","adirondack","jake"]')).toEqual(['jake','adirondack']);
    expect(readRockCollection('broken')).toEqual([]);
  });
  it('requires proximity to inspect an uncollected specimen', () => {
    expect(nearbyRock({x:0,z:0})).toBe('jake');
    expect(nearbyRock({x:50,z:50})).toBeUndefined();
  });
});