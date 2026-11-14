import {describe,it,expect} from 'vitest';
import {globeCoordinate,globePosition,surfaceLine} from '@/lib/mars-globe';

describe('Mars globe coordinates',()=>{
  it('places 0° latitude and longitude on the positive X axis',()=>{
    expect(globePosition({lat:0,lng:0})).toEqual([2,0,-0]);
  });
  it('preserves map coordinates when picking the 3D surface',()=>{
    const [x,y,z]=globePosition({lat:18.38,lng:77.58});
    const point=globeCoordinate({x,y,z});
    expect(point.lat).toBeCloseTo(18.38,6);
    expect(point.lng).toBeCloseTo(77.58,6);
  });
  it('draws routes above the globe rather than through its interior',()=>{
    const points=surfaceLine([{lat:0,lng:170},{lat:0,lng:-170}]);
    expect(points).toHaveLength(21);
    for(const p of points)expect(Math.hypot(...p)).toBeCloseTo(2.018,6);
  });
});