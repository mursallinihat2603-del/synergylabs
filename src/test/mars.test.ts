import {describe,it,expect} from 'vitest';
import {distance,routeBetween,hazards,speeds} from '@/lib/mars';
describe('Mars rules',()=>{
 it('measures on Mars, not Earth',()=>expect(distance({lat:0,lng:0},{lat:0,lng:90})).toBeCloseTo(5324.21,1));
 it('safest routing avoids sample slopes above 25 degrees',()=>{const r=routeBetween({lat:-5,lng:-90},{lat:-24,lng:-35},true);expect(r).not.toBeNull();expect(r?.crossed).not.toContain('slope');});
 it('scores stay between zero and 100',()=>{const r=routeBetween({lat:0,lng:0},{lat:2,lng:2});expect(r?.score).toBeGreaterThanOrEqual(0);expect(r?.score).toBeLessThanOrEqual(100);});
 it('illustrative zones have explicit sample labels',()=>hazards.filter(h=>h.geometry.type==='Polygon').forEach(h=>expect(h.properties.source).toContain('Sample data')));
 it('all three vehicle modes have positive modeled speeds',()=>{expect(Object.keys(speeds)).toEqual(['Walking EVA','Pressurized Rover','Heavy Rover']);Object.values(speeds).forEach(s=>expect(s).toBeGreaterThan(0));});
});
