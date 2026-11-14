import {it,expect} from 'vitest';
import {roverGuidance} from '@/lib/rover-guidance';
it('guides right for a calculated right bend ahead',()=>expect(roverGuidance([[0,0,0],[0,0,-10],[10,0,-10]],{x:0,z:0})?.maneuver).toBe('right'));
it('guides left for a calculated left bend ahead',()=>expect(roverGuidance([[0,0,0],[0,0,-10],[-10,0,-10]],{x:0,z:0})?.maneuver).toBe('left'));
it('guides straight on a straight route',()=>expect(roverGuidance([[0,0,0],[0,0,-10],[0,0,-20]],{x:0,z:0})?.maneuver).toBe('straight'));
it('does not invent guidance without a calculated route',()=>expect(roverGuidance([],{x:0,z:0})).toBeUndefined());