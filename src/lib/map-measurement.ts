import {distance, modeledElevation, type Coordinate} from './mars';
import {globeCoordinate, globePosition} from './mars-globe';

// Follow great-circle segments, including across the longitude seam.
export function measureLine(points: Coordinate[], elevation = modeledElevation) {
 const profile: {km:number;elevation:number}[]=[];
 let km=0,ascent=0,descent=0,steepestSlope=0;
 const first=points[0];
 if(!first)return {km,ascent,descent,elevationChange:0,steepestSlope,profile};
 profile.push({km:0,elevation:elevation(first)});
 for(let i=1;i<points.length;i++){
  const a=points[i-1],b=points[i];if(!a||!b)continue;
  const length=distance(a,b);if(length<1e-8)continue;
  const steps=Math.min(256,Math.max(16,Math.ceil(length/5)));
  const av=globePosition(a,1),bv=globePosition(b,1);
  const angle=Math.acos(Math.max(-1,Math.min(1,av.reduce((sum,v,j)=>sum+v*(bv[j]??0),0))));
  const sin=Math.sin(angle);
  for(let j=1;j<=steps;j++){
   const fraction=j/steps;
   let p=b;
   if(j<steps){
    if(Math.abs(sin)>1e-8){
     const u=Math.sin((1-fraction)*angle)/sin,v=Math.sin(fraction*angle)/sin;
     p=globeCoordinate({x:av[0]*u+bv[0]*v,y:av[1]*u+bv[1]*v,z:av[2]*u+bv[2]*v});
    }else{const delta=((b.lng-a.lng+540)%360)-180;p={lat:a.lat+(b.lat-a.lat)*fraction,lng:((a.lng+delta*fraction+540)%360)-180};}
   }
   const h=elevation(p),previous=profile.at(-1);if(!previous)continue;
   const change=h-previous.elevation,run=length/steps;
   ascent+=Math.max(0,change);descent+=Math.max(0,-change);
   steepestSlope=Math.max(steepestSlope,Math.atan2(Math.abs(change),run*1000)*180/Math.PI);
   km+=run;profile.push({km,elevation:h});
  }
 }
 return {km,ascent,descent,elevationChange:(profile.at(-1)?.elevation??0)-(profile[0]?.elevation??0),steepestSlope,profile};
}