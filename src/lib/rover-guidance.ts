import {maneuver,type Maneuver} from './navigation';
export type DrivingPoint=readonly [number,number,number];
export type RoverGuidance={maneuver:Maneuver;distance:number;key:string};
export function roverGuidance(route:readonly DrivingPoint[],position:{x:number;z:number}):RoverGuidance|undefined {
 if(route.length<2)return;
 let nearest=0,best=Infinity;
 route.forEach((p,i)=>{const d=Math.hypot(p[0]-position.x,p[2]-position.z);if(d<best){best=d;nearest=i;}});
 let remaining=0;
 for(let i=nearest+1;i<route.length-1;i++){
  const a=route[i-1],b=route[i],c=route[i+1];if(!a||!b||!c)continue;
  remaining+=Math.hypot(b[0]-a[0],b[2]-a[2]);
  const h1=Math.atan2(b[0]-a[0],-(b[2]-a[2])),h2=Math.atan2(c[0]-b[0],-(c[2]-b[2]));
  const angle=((h2-h1)*180/Math.PI+540)%360-180;
  if(Math.abs(angle)>=20)return {maneuver:maneuver(angle),distance:remaining,key:`turn-${i}`};
 }
 return {maneuver:'straight',distance:0,key:'straight'};
}