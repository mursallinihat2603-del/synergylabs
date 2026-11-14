import {roverTerrainHeight} from './rover-driving';
import type {Coordinate} from './mars';

export const SAND_ZONES = [{x:0,z:-17,radius:6},{x:16,z:-51,radius:10},{x:-22,z:-80,radius:12}];
export const CHALLENGE_RULES = {sandGrip:.38,steepSlope:18,batteryDrain:.16,boostDrain:.45,recharge:.35,repair:3};
export type DriveCondition = {battery:number;integrity:number;travel:number};
export const freshDriveCondition = ():DriveCondition => ({battery:100,integrity:100,travel:0});
export function reachedRouteFinish(position:{x:number;z:number},finish:readonly [number,number,number]|undefined) {
  return !!finish&&Math.hypot(position.x-finish[0],position.z-finish[2])<=2;
}
export function poweredDriveInput(battery:number,input:{throttle:number;steer:number}) {
  return battery>0?input:{throttle:0,steer:0};
}
export function terrainCondition(x:number,z:number) {
  const dx=(roverTerrainHeight(x+.4,z)-roverTerrainHeight(x-.4,z))/.8;
  const dz=(roverTerrainHeight(x,z+.4)-roverTerrainHeight(x,z-.4))/.8;
  return {sand:SAND_ZONES.some(s=>Math.hypot(x-s.x,z-s.z)<s.radius),slope:Math.atan(Math.hypot(dx,dz))*180/Math.PI};
}
export function mobilityFactor(condition:DriveCondition,sand:boolean,slope:number) {
  if(condition.battery<=0)return 0;
  return (sand?CHALLENGE_RULES.sandGrip:1)*Math.max(.25,1-slope/45)*Math.max(.25,condition.integrity/100);
}
export function stepDriveCondition(state:DriveCondition,seconds:number,input:{moving:boolean;boost:boolean;sand:boolean;slope:number;speed:number;repair:boolean}) {
  const drain=CHALLENGE_RULES.batteryDrain+(input.boost?CHALLENGE_RULES.boostDrain:0)+(input.sand?.12:0)+input.slope*.004;
  return {
    battery:Math.max(0,Math.min(100,state.battery+seconds*(input.moving?-drain:CHALLENGE_RULES.recharge))),
    integrity:Math.min(100,state.integrity+(!input.moving&&input.repair?seconds*CHALLENGE_RULES.repair:0)),
    travel:state.travel+Math.abs(input.speed)*seconds,
  };
}
export function impactDamage(state:DriveCondition,speed:number):DriveCondition {
  return {...state,integrity:Math.max(0,state.integrity-Math.max(0,Math.abs(speed)-1)*7)};
}
// Normalize to a finite driving area, align the first leg with the rover, and
// densify so the ground line follows hills instead of cutting through them.
export function drivingRoutePoints(route:readonly Coordinate[]):[number,number,number][] {
  const first=route[0];if(!first||route.length<2)return [];
  let previous=first,unwrapped=0;
  const raw=route.map(p=>{unwrapped+=((p.lng-previous.lng+540)%360)-180;previous=p;return {x:unwrapped*Math.cos(first.lat*Math.PI/180),z:-(p.lat-first.lat)};});
  const length=raw.slice(1).reduce((sum,p,i)=>{const a=raw[i];return sum+(a?Math.hypot(p.x-a.x,p.z-a.z):0);},0);
  const direction=raw.find(p=>Math.hypot(p.x,p.z)>.000001);if(!direction||length===0)return [];
  const norm=Math.hypot(direction.x,direction.z),ux=direction.x/norm,uz=direction.z/norm;
  const scale=110/length;
  const local=raw.map(p=>({x:(-uz*p.x+ux*p.z)*scale,z:-(ux*p.x+uz*p.z)*scale}));
  const points:[number,number,number][]=[];
  local.slice(1).forEach((b,i)=>{const a=local[i];if(!a)return;const steps=Math.max(1,Math.ceil(Math.hypot(b.x-a.x,b.z-a.z)/.5));for(let j=0;j<steps;j++){const x=a.x+(b.x-a.x)*j/steps,z=a.z+(b.z-a.z)*j/steps;points.push([x,roverTerrainHeight(x,z)+.18,z]);}});
  const last=local.at(-1);if(last)points.push([last.x,roverTerrainHeight(last.x,last.z)+.18,last.z]);
  return points;
}