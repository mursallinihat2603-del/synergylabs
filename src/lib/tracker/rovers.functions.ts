import {createServerFn} from '@tanstack/react-start';
export type RoverStatus={id:'perseverance'|'curiosity';name:string;mission:string;site:string;lat:number;lng:number;sol:number;lastDriveM:number;totalKm:number;elevation:number|null;note:string|null;source:string;live:boolean};
const feeds=[
 {id:'perseverance' as const,name:'Perseverance',mission:'Mars 2020',site:'Jezero Crater',url:'https://mars.nasa.gov/mmgis-maps/M20/Layers/json/M20_waypoints_current.json',fallback:{lat:18.4447,lng:77.4508}},
 {id:'curiosity' as const,name:'Curiosity',mission:'Mars Science Laboratory',site:'Gale Crater · Mount Sharp',url:'https://mars.nasa.gov/mmgis-maps/MSL/Layers/json/MSL_waypoints_current.json',fallback:{lat:-4.5895,lng:137.4417}},
];
export const getRoverStatus=createServerFn({method:'GET'}).handler(async()=>{
 const rovers=await Promise.all(feeds.map(async f=>{
  try{
   const r=await fetch(f.url,{signal:AbortSignal.timeout(10000)});
   if(!r.ok)throw new Error(String(r.status));
   const j=await r.json() as {features?:{properties:Record<string,unknown>}[]};
   const p=j.features?.at(-1)?.properties;if(!p)throw new Error('empty');
   const n=(v:unknown)=>typeof v==='number'&&Number.isFinite(v)?v:0;
   return {id:f.id,name:f.name,mission:f.mission,site:f.site,lat:n(p.lat),lng:n(p.lon),sol:n(p.sol),lastDriveM:n(p.dist_m),totalKm:n(p.dist_km),elevation:typeof p.elev_geoid==='number'?Math.round(p.elev_geoid):null,note:typeof p.Note==='string'?p.Note:null,source:f.url,live:true} satisfies RoverStatus;
  }catch{
   return {id:f.id,name:f.name,mission:f.mission,site:f.site,...f.fallback,sol:0,lastDriveM:0,totalKm:0,elevation:null,note:'Live NASA feed unavailable — showing landing site',source:f.url,live:false} satisfies RoverStatus;
  }
 }));
 return {rovers,fetchedAt:new Date().toISOString()};
});
