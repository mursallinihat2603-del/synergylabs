import {it,expect} from 'vitest';
import {roverInput,roverTargetSpeed,ROVER_PHYSICS} from '@/lib/rover-driving';
it('W drives forward',()=>expect(roverInput(new Set(['KeyW'])).throttle).toBe(1));
it('S reverses',()=>expect(roverInput(new Set(['KeyS'])).throttle).toBe(-1));
it('A steers left',()=>expect(roverInput(new Set(['KeyA'])).steer).toBe(1));
it('D steers right',()=>expect(roverInput(new Set(['KeyD'])).steer).toBe(-1));
it('holding Shift increases speed',()=>expect(roverTargetSpeed('Pressurized Rover',new Set(['ShiftLeft']))).toBeCloseTo(roverTargetSpeed('Pressurized Rover',new Set())*1.8));
it('selected heavy rover uses its own speed',()=>expect(roverTargetSpeed('Heavy Rover',new Set())).toBe(2));
it('suspension uses Mars gravity and finite travel',()=>{expect(ROVER_PHYSICS.gravity).toBe(3.71);expect(ROVER_PHYSICS.maxTravel).toBe(.35);});