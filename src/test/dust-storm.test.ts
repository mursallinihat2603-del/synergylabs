import {it,expect} from 'vitest';
import {stormPhase} from '@/lib/dust-storm';
it('starts calm',()=>expect(stormPhase(0).phase).toBe('calm'));
it('warns before the storm',()=>expect(stormPhase(80).phase).toBe('warning'));
it('storm arrives after 85 seconds',()=>expect(stormPhase(100).phase).toBe('storm'));
it('cycle repeats',()=>expect(stormPhase(120).phase).toBe('calm'));
