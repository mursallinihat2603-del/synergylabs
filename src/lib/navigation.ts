import {distance,type Coordinate} from './mars';
export function bearing(a:Coordinate,b:Coordinate){const r=Math.PI/180,d=(b.lng-a.lng)*r;return (Math.atan2(Math.sin(d)*Math.cos(b.lat*r),Math.cos(a.lat*r)*Math.sin(b.lat*r)-Math.sin(a.lat*r)*Math.cos(b.lat*r)*Math.cos(d))*180/Math.PI+360)%360;}
export function navigationSteps(points:Coordinate[]){
 const last=points.at(-1);if(!last)return [];
 const stride=Math.max(1,Math.ceil((points.length-1)/8));const reduced=points.filter((_,i)=>i%stride===0);if(reduced.at(-1)!==last)reduced.push(last);
 return reduced.slice(0,-1).map((p,i)=>{const next=reduced[i+1]??last;const heading=bearing(p,next);const direction=['north','northeast','east','southeast','south','southwest','west','northwest'][Math.round(heading/45)%8]??'north';const previous=reduced[i-1];const turn=previous?((heading-bearing(previous,p)+540)%360)-180:0;return {point:p,next,km:distance(p,next),heading,direction,turn:Math.abs(turn)<25?'straight':turn>0?'right':'left'};});
}