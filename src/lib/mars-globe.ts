import type { Coordinate } from './mars';

export function globePosition(p: Coordinate, radius = 2): [number, number, number] {
  const lat = p.lat * Math.PI / 180, lng = p.lng * Math.PI / 180;
  return [radius * Math.cos(lat) * Math.cos(lng), radius * Math.sin(lat), -radius * Math.cos(lat) * Math.sin(lng)];
}

export function globeCoordinate(p: {x:number;y:number;z:number}): Coordinate {
  return {lat: Math.atan2(p.y, Math.hypot(p.x,p.z))*180/Math.PI, lng: Math.atan2(-p.z,p.x)*180/Math.PI};
}

export function surfaceLine(points: Coordinate[], radius = 2.018): [number,number,number][] {
  return points.flatMap((p,i) => {
    const next=points[i+1];
    if(!next)return [globePosition(p,radius)];
    const delta=((next.lng-p.lng+540)%360)-180;
    const steps=Math.max(1,Math.ceil(Math.max(Math.abs(delta),Math.abs(next.lat-p.lat))));
    return Array.from({length:steps},(_,j)=>globePosition({lat:p.lat+(next.lat-p.lat)*j/steps,lng:p.lng+delta*j/steps},radius));
  });
}