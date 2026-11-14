import {describe,it,expect} from 'vitest';
import {bearing,navigationSteps} from '@/lib/navigation';
describe('Navigation guidance',()=>{
 it('uses geographic bearings for east and north',()=>{expect(bearing({lat:0,lng:0},{lat:0,lng:1})).toBeCloseTo(90);expect(bearing({lat:0,lng:0},{lat:1,lng:0})).toBeCloseTo(0);});
 it('keeps the destination and generates remaining trip segments',()=>{const steps=navigationSteps([{lat:0,lng:0},{lat:0,lng:1},{lat:1,lng:1}]);expect(steps).toHaveLength(2);expect(steps[0]?.direction).toBe('east');expect(steps[1]?.turn).toBe('left');expect(steps[1]?.next).toEqual({lat:1,lng:1});});
});