import places from '@/data/landmarks.json';
import hazardData from '@/data/hazards.json';
import pathfinding from 'javascript-astar';
const { Graph, astar } = pathfinding;
export type Place = (typeof places)[number];
export type Coordinate = { lat: number; lng: number };
export const landmarks = places;
export const hazards = hazardData.features;
export const categories = [
 {id:'slopes',name:'Steep slopes',detail:'Above 25°',icon:'mountain'},
 {id:'dust',name:'Dust storms',detail:'Seasonal activity',icon:'wind'},
 {id:'sand',name:'Dunes & soft sand',detail:'Entrapment risk',icon:'waves'},
 {id:'craters',name:'Craters & boulders',detail:'Uneven terrain',icon:'circle'},
 {id:'radiation',name:'High radiation',detail:'Low shielding',icon:'radiation'},
 {id:'temperature',name:'Extreme cold',detail:'Thermal risk',icon:'snowflake'},
 {id:'historic',name:'Rover trouble spots',detail:'Recorded events',icon:'rover'},
];
export function distance(a: Coordinate,b: Coordinate) {
 const r=Math.PI/180, dlat=(b.lat-a.lat)*r, dlng=(b.lng-a.lng)*r;
 const h=Math.sin(dlat/2)**2+Math.cos(a.lat*r)*Math.cos(b.lat*r)*Math.sin(dlng/2)**2;
 return 3389.5*2*Math.asin(Math.min(1,Math.sqrt(h)));
}
export function inside(point: Coordinate, coordinates: number[][]) {
 let yes=false;
 for(let i=0,j=coordinates.length-1;i<coordinates.length;j=i++) {
  const a=coordinates[i],b=coordinates[j];
  if(!a||!b)continue;
  const [ax,ay]=a,[bx,by]=b;
  if(ax===undefined||ay===undefined||bx===undefined||by===undefined)continue;
  if((ay>point.lat)!==(by>point.lat)&&point.lng<(bx-ax)*(point.lat-ay)/(by-ay)+ax) yes=!yes;
 }
 return yes;
}
export function localHazards(p: Coordinate) { return hazards.filter(h=>h.geometry.type==='Polygon' ? inside(p,h.geometry.coordinates[0] as number[][]) : distance(p,{lng:h.geometry.coordinates[0] as number,lat:h.geometry.coordinates[1] as number})<150); }
export function modeledElevation(p: Coordinate) { return Math.round(-2500+2200*Math.sin(p.lng*Math.PI/70)*Math.cos(p.lat*Math.PI/55)); }
export function routeBetween(start: Coordinate,end: Coordinate,safest=true) {
 const n=65, pad=8, minLat=Math.max(-89,Math.min(start.lat,end.lat)-pad),maxLat=Math.min(89,Math.max(start.lat,end.lat)+pad), minLng=Math.min(start.lng,end.lng)-pad,maxLng=Math.max(start.lng,end.lng)+pad;
 const coord=(x:number,y:number)=>({lat:minLat+(maxLat-minLat)*y/(n-1),lng:minLng+(maxLng-minLng)*x/(n-1)});
 const grid=Array.from({length:n},(_,x)=>Array.from({length:n},(_,y)=>{
  const hs=localHazards(coord(x,y));
  if(safest&&hs.some(h=>h.properties.slope>25)) return 0;
  return 1+hs.length*(safest?18:0.5);
 }));
 const ix=(p:Coordinate):[number,number]=>[Math.max(0,Math.min(n-1,Math.round((p.lng-minLng)/(maxLng-minLng)*(n-1)))),Math.max(0,Math.min(n-1,Math.round((p.lat-minLat)/(maxLat-minLat)*(n-1))))];
 const [sx,sy]=ix(start),[ex,ey]=ix(end); const sr=grid[sx],er=grid[ex];if(!sr||!er)return null;sr[sy]=1;er[ey]=1;
 const graph=new Graph(grid,{diagonal:true}); const a=graph.grid[sx]?.[sy],b=graph.grid[ex]?.[ey];if(!a||!b)return null;const path=astar.search(graph,a,b);
 if(!path.length&&a!==b&&distance(start,end)>1) return null;
 const points=[start,...path.map(p=>coord(p.x,p.y)),end];
 const crossed=[...new Set(points.flatMap(p=>localHazards(p).map(h=>h.properties.id)))];
 const km=points.slice(1).reduce((sum,p,i)=>sum+distance(points[i]??start,p),0);
 const maxSlope=Math.max(3,...hazards.filter(h=>crossed.includes(h.properties.id)).map(h=>h.properties.slope));
 return {points,km,crossed,maxSlope,score:Math.max(0,100-crossed.length*12-maxSlope),profile:points.filter((_,i)=>i%Math.max(1,Math.floor(points.length/25))===0).map(p=>modeledElevation(p))};
}
export const speeds = {'Walking EVA':3,'Pressurized Rover':12,'Heavy Rover':6};
export function marsTime(ms:number) { const jd=ms/86400000+2440587.5;const sol=(jd-2405522.0028779)/1.0274912517;const seconds=Math.floor(((sol%1+1)%1)*86400); return {sol:Math.floor(sol),time:[Math.floor(seconds/3600),Math.floor(seconds%3600/60),seconds%60].map(v=>String(v).padStart(2,'0')).join(':')}; }
