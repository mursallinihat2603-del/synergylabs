import {describe,it,expect} from 'vitest';
import {bearing,navigationSteps,maneuver,spokenInstruction} from '@/lib/navigation';
describe('Navigation guidance',()=>{
 it('uses geographic bearings for east and north',()=>{expect(bearing({lat:0,lng:0},{lat:0,lng:1})).toBeCloseTo(90);expect(bearing({lat:0,lng:0},{lat:1,lng:0})).toBeCloseTo(0);});
 it('keeps the destination and generates remaining trip segments',()=>{const steps=navigationSteps([{lat:0,lng:0},{lat:0,lng:1},{lat:1,lng:1}]);expect(steps).toHaveLength(2);expect(steps[0]?.direction).toBe('east');expect(steps[1]?.turn).toBe('left');expect(steps[1]?.next).toEqual({lat:1,lng:1});});
 it('names turns like a road navigator',()=>{expect(maneuver(10)).toBe('straight');expect(maneuver(-30)).toBe('slight left');expect(maneuver(90)).toBe('right');expect(maneuver(-150)).toBe('sharp left');expect(maneuver(175)).toBe('u-turn');});
 it('announces the upcoming turn and arrival',()=>{const steps=navigationSteps([{lat:0,lng:0},{lat:0,lng:1},{lat:1,lng:1}]);expect(spokenInstruction(steps,0,'Gale')).toMatch(/^Head east\. In .* kilometers, turn left\.$/);expect(spokenInstruction(steps,1,'Gale')).toMatch(/^Turn left now.*destination Gale/);expect(spokenInstruction(steps,2,'Gale')).toBe('You have arrived at Gale.');});
});
