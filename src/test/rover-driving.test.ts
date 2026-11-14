import {it,expect} from 'vitest';
import {roverInput} from '@/lib/rover-driving';
it('W drives forward',()=>expect(roverInput(new Set(['KeyW'])).throttle).toBe(1));
it('S reverses',()=>expect(roverInput(new Set(['KeyS'])).throttle).toBe(-1));
it('A steers left',()=>expect(roverInput(new Set(['KeyA'])).steer).toBe(1));
it('D steers right',()=>expect(roverInput(new Set(['KeyD'])).steer).toBe(-1));