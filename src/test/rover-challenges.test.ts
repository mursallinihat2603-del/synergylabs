import {describe,it,expect} from 'vitest';
import {freshDriveCondition,mobilityFactor,stepDriveCondition,impactDamage,drivingRoutePoints,terrainCondition} from '@/lib/rover-challenges';
import {roverTerrainHeight} from '@/lib/rover-driving';
describe('simulated terrain challenges',()=>{
 it('soft sand reduces traction',()=>expect(mobilityFactor(freshDriveCondition(),true,0)).toBeLessThan(mobilityFactor(freshDriveCondition(),false,0)));
 it('steeper slopes reduce speed',()=>expect(mobilityFactor(freshDriveCondition(),false,25)).toBeLessThan(mobilityFactor(freshDriveCondition(),false,0)));
 it('boost consumes more battery',()=>{const input={moving:true,boost:false,sand:false,slope:0,speed:2,repair:false};expect(stepDriveCondition(freshDriveCondition(),10,{...input,boost:true}).battery).toBeLessThan(stepDriveCondition(freshDriveCondition(),10,input).battery);});
 it('resting recharges an empty battery',()=>{expect(stepDriveCondition({...freshDriveCondition(),battery:0},10,{moving:false,boost:false,sand:false,slope:0,speed:0,repair:false}).battery).toBeGreaterThan(0);});
 it('rock impacts damage the rover but slow touches do not',()=>{expect(impactDamage(freshDriveCondition(),3).integrity).toBeLessThan(100);expect(impactDamage(freshDriveCondition(),.5).integrity).toBe(100);});
 it('repairs only operate when stationary',()=>{const s={...freshDriveCondition(),integrity:40},input={moving:false,boost:false,sand:false,slope:0,speed:0,repair:true};expect(stepDriveCondition(s,10,input).integrity).toBe(70);expect(stepDriveCondition(s,10,{...input,moving:true}).integrity).toBe(40);});
 it('sand detection matches the visible sand patch',()=>expect(terrainCondition(0,-17).sand).toBe(true));
});
describe('calculated route in driving terrain',()=>{
 it('makes a tiny Jezero–Perseverance route visible ahead at a compressed scale',()=>{const points=drivingRoutePoints([{lat:18.44,lng:77.45},{lat:18.4447,lng:77.4508}]);expect(points[0]?.[0]).toBe(0);expect(points.at(-1)?.[2]).toBeCloseTo(-110);expect(points.length).toBeGreaterThan(200);points.forEach(p=>expect(p[1]).toBeCloseTo(roverTerrainHeight(p[0],p[2])+.18));});
 it('preserves calculated turns',()=>{const p=drivingRoutePoints([{lat:0,lng:0},{lat:1,lng:0},{lat:1,lng:1}]);expect(p.at(-1)?.[0]).toBeCloseTo(55);expect(p.at(-1)?.[2]).toBeCloseTo(-55);});
 it('keeps long routes inside the simulated area',()=>{const p=drivingRoutePoints([{lat:18,lng:77},{lat:-5,lng:137}]);expect(Math.hypot(p.at(-1)?.[0]??0,p.at(-1)?.[2]??0)).toBeCloseTo(110);});
});