import {useEffect,useRef} from 'react';
import type {RoverStatus} from '@/lib/tracker/rovers.functions';
import backup from '@/assets/mars-backup.asset.json';
export default function TrackerMap({rovers,focus}:{rovers:RoverStatus[];focus:string|null}){
 const host=useRef<HTMLDivElement>(null),map=useRef<import('leaflet').Map|null>(null);
 useEffect(()=>{let alive=true;void import('leaflet').then(L=>{if(!alive||!host.current)return;
  const m=L.map(host.current,{crs:L.CRS.EPSG4326,minZoom:1,maxZoom:12}).setView([5,105],3);map.current=m;
  L.imageOverlay(backup.url,[[-90,-180],[90,180]]).addTo(m);
  L.tileLayer('https://trek.nasa.gov/tiles/Mars/EQ/Mars_Viking_MDIM21_ClrMosaic_global_232m/1.0.0/default/default028mm/{z}/{y}/{x}.jpg',{noWrap:true,maxNativeZoom:8,bounds:[[-90,-180],[90,180]]}).addTo(m);
  m.attributionControl.addAttribution('NASA/JPL-Caltech rover waypoints · NASA/USGS imagery');
  for(const r of rovers)L.marker([r.lat,r.lng],{icon:L.divIcon({className:'landing-marker landmark-marker selected-marker',html:'✦',iconSize:[14,14]})}).bindTooltip(`${r.name}${r.live?` · Sol ${r.sol}`:''}`,{permanent:true,direction:'top',className:'feature-label',offset:[0,-8]}).addTo(m);
 });return()=>{alive=false;map.current?.remove();map.current=null;};},[rovers]);
 useEffect(()=>{const r=rovers.find(x=>x.id===focus);if(r)map.current?.setView([r.lat,r.lng],9);},[focus,rovers]);
 return <div ref={host} className="tracker-map" aria-label="Rover location map"/>;
}
