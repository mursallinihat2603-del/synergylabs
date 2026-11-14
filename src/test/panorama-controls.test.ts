import {describe,it,expect} from 'vitest';
import {panoramaDirection,isPanoramaKey} from '@/lib/panorama-controls';
describe('WASD panorama panning',()=>{
 it('W pans up',()=>expect(panoramaDirection(new Set(['KeyW']))).toEqual({x:0,y:-1}));
 it('A pans left',()=>expect(panoramaDirection(new Set(['KeyA']))).toEqual({x:-1,y:0}));
 it('S pans down',()=>expect(panoramaDirection(new Set(['KeyS']))).toEqual({x:0,y:1}));
 it('D pans right',()=>expect(panoramaDirection(new Set(['KeyD']))).toEqual({x:1,y:0}));
 it('opposite held keys cancel',()=>expect(panoramaDirection(new Set(['KeyW','KeyS','KeyA','KeyD']))).toEqual({x:0,y:0}));
 it('diagonal panning has the same speed',()=>{const p=panoramaDirection(new Set(['KeyW','KeyD']));expect(Math.hypot(p.x,p.y)).toBeCloseTo(1);});
 it('does not treat unrelated keys as movement',()=>expect(isPanoramaKey('KeyQ')).toBe(false));
});