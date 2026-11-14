import {it,expect} from 'vitest';
import {driveVelocityChange,steeringRate,vehicleMass,GLOBE_SENSITIVITY} from '@/lib/vehicle-physics';
it('accelerates gradually rather than jumping to target velocity',()=>expect(driveVelocityChange(0,3,.05)).toBeCloseTo(.12));
it('braking opposes motion',()=>expect(driveVelocityChange(3,0,.05)).toBeCloseTo(-.225));
it('A turns left and D turns right even when stationary',()=>{expect(steeringRate(1,0)).toBeCloseTo(.91);expect(steeringRate(-1,0)).toBeCloseTo(-.91);});
it('reverse steering changes direction',()=>expect(steeringRate(1,-2)).toBe(-steeringRate(1,2)));
it('heavy rover has greater physical mass',()=>expect(vehicleMass('Heavy Rover')).toBeGreaterThan(vehicleMass('Pressurized Rover')));
it('globe sensitivity increases from previous values',()=>{expect(GLOBE_SENSITIVITY.rotation).toBeGreaterThan(.6);expect(GLOBE_SENSITIVITY.zoom).toBeGreaterThan(.8);});