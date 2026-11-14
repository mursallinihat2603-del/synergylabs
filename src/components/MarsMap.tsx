import {useLanguage} from '@/components/LanguageProvider';
import {useEffect,useRef,useState} from 'react';
import type {Map as LeafletMap,LayerGroup,TileLayer} from 'leaflet';
import {landmarks,hazards,distance,type Place,type Coordinate,modeledElevation} from '@/lib/mars';
import backup from '@/assets/mars-backup.asset.json';
import {Button} from '@/components/ui/button';
import {Plus,Minus,LocateFixed} from 'lucide-react';
export type MarsMapProps={layer:string;active:string[];selected:Place;onSelect:(p:Place)=>void;onPoint:(p:Coordinate)=>void;route?:Coordinate[]|undefined;fastRoute?:Coordinate[]|undefined;compare:boolean;swipe:number;reports:{lat:number;lng:number;name:string}[]};
const products:Record<string,string>={Viking:'Mars_Viking_MDIM21_ClrMosaic_global_232m',MOLA:'Mars_MGS_MOLA_ClrShade_merge_global_463m',THEMIS:'THEMIS_DayIR_ControlledMosaics_100m_v2_oct2018'};
export default function MarsMap(props:MarsMapProps) {
 const {t,language}=useLanguage();
 const host=useRef<HTMLDivElement>(null),map=useRef<LeafletMap|null>(null),overlays=useRef<LayerGroup|null>(null),tiles=useRef<TileLayer|null>(null),compareTiles=useRef<TileLayer|null>(null);
 const current=useRef(props);current.current=props;
 const [ready,setReady]=useState(false),[status,setStatus]=useState('Loading NASA imagery…'),[cursor,setCursor]=useState<Coordinate>({lat:-13.9,lng:-59.2}),[scale,setScale]=useState(500);
 useEffect(()=>{let alive=true;
  void import('leaflet').then(L=>{
   if(!host.current||!alive)return;
   const crs={...L.CRS.EPSG4326,distance:(a:Coordinate,b:Coordinate)=>distance(a,b)*1000};
   const m=L.map(host.current,{crs,zoomControl:false,attributionControl:true,minZoom:1,maxZoom:8,zoomSnap:0.25,maxBounds:[[-90,-180],[90,180]],maxBoundsViscosity:1}).setView([-9,-63],3.25);map.current=m;
   L.imageOverlay(backup.url,[[-90,-180],[90,180]],{opacity:1}).addTo(m);
   m.attributionControl.addAttribution('NASA / USGS · Mars equirectangular');
   overlays.current=L.layerGroup().addTo(m);
   m.on('mousemove',e=>setCursor({lat:e.latlng.lat,lng:e.latlng.lng}));
   m.on('click',e=>current.current.onPoint({lat:e.latlng.lat,lng:e.latlng.lng}));
   const updateScale=()=>{const c=m.getCenter(),p=m.latLngToContainerPoint(c);const b=m.containerPointToLatLng([p.x+100,p.y]);setScale(Math.round(distance(c,b)));};
   m.on('zoomend',updateScale);updateScale();
   const resize=new ResizeObserver(()=>{m.invalidateSize({pan:false});updateScale();});
   resize.observe(host.current);
   m.on('unload',()=>resize.disconnect());
   setReady(true);
  });return()=>{alive=false;map.current?.remove();map.current=null;};
 },[]);
 useEffect(()=>{if(!ready||!map.current)return;const m=map.current;let cancelled=false;setStatus('Loading NASA imagery…');
  void import('leaflet').then(L=>{
   tiles.current?.remove();compareTiles.current?.remove();
   const extension=props.layer==='THEMIS'?'png':'jpg';
   const layer=L.tileLayer(`https://trek.nasa.gov/tiles/Mars/EQ/${products[props.layer]}/1.0.0/default/default028mm/{z}/{y}/{x}.${extension}`,{tileSize:256,noWrap:true,bounds:[[-90,-180],[90,180]],maxNativeZoom:8}).addTo(m);tiles.current=layer;
   layer.on('tileerror',()=>{if(!cancelled){setStatus('NASA tiles unavailable · USGS backup mosaic');layer.remove();}});
   layer.on('load',()=>{if(!cancelled)setStatus(s=>s.includes('unavailable')?s:'');});
   if(props.compare){const w=L.tileLayer.wms('https://planetarymaps.usgs.gov/cgi-bin/mapserv?map=/maps/mars/mars_simp_cyl.map',{layers:'MOLA_color',format:'image/png',transparent:true,version:'1.1.1',crs:L.CRS.EPSG4326});w.addTo(m);compareTiles.current=w;const el=w.getContainer();if(el)el.style.clipPath=`inset(0 ${100-current.current.swipe}% 0 0)`; w.on('tileerror',()=>{setStatus('Comparison imagery unavailable · Viking backup remains visible');w.remove();});}
  });return()=>{cancelled=true;};
 },[props.layer,props.compare,ready]);
 useEffect(()=>{const el=compareTiles.current?.getContainer();if(el)el.style.clipPath=`inset(0 ${100-props.swipe}% 0 0)`;},[props.swipe,props.compare,ready]);
 useEffect(()=>{if(!ready||!map.current)return;const m=map.current;void import('leaflet').then(L=>{const group=overlays.current;if(!group)return;group.clearLayers();
   const css=getComputedStyle(document.documentElement);
   for(const h of hazards){if(!props.active.includes(h.properties.category))continue;const color=css.getPropertyValue(`--hazard-${h.properties.category}`).trim();
    if(h.geometry.type==='Polygon') {const coords=h.geometry.coordinates[0] as [number,number][];const first=coords[0];if(!first)continue;L.polygon(coords.map(c=>[c[1],c[0]] as [number,number]),{color,weight:1.5,fillOpacity:.19,dashArray:'5 5'}).bindTooltip(`${t(h.properties.name)} · ${t(h.properties.source)}`).on('click',()=>current.current.onSelect({id:h.properties.id,name:h.properties.name,lat:first[1],lng:first[0],elevation:modeledElevation({lat:first[1],lng:first[0]}),size:'Illustrative zone',type:'Hazard · '+h.properties.source,rating:h.properties.rating,description:h.properties.source})).addTo(group);
    }else{const coords=h.geometry.coordinates as [number,number];L.marker([coords[1],coords[0]],{icon:L.divIcon({className:'hazard-marker',html:'⚠',iconSize:[27,27]})}).bindTooltip(t(h.properties.name)+' · '+t(h.properties.source)).addTo(group);}}
   for(const p of landmarks){L.marker([p.lat,p.lng],{icon:L.divIcon({className:`landmark-marker ${p.type==='Landing site'?'landing-marker':''} ${p.id===props.selected.id?'selected-marker':''}`,html:p.type==='Landing site'?'✦':'',iconSize:[12,12]})}).bindTooltip(t(p.name),{permanent:true,direction:'top',className:'feature-label',offset:[0,-8]}).on('click',e=>{L.DomEvent.stopPropagation(e);current.current.onSelect(p);}).addTo(group);}
   props.reports.forEach(p=>L.marker([p.lat,p.lng],{icon:L.divIcon({className:'reported-marker',html:'⚑',iconSize:[24,24]})}).bindTooltip(`${p.name} · ${t("User reported · unverified")}`).addTo(group));
   if(props.fastRoute)L.polyline(props.fastRoute.map(p=>[p.lat,p.lng] as [number,number]),{color:css.getPropertyValue('--muted-foreground').trim(),weight:3,dashArray:'8 8'}).addTo(group);
   if(props.route){const line=L.polyline(props.route.map(p=>[p.lat,p.lng] as [number,number]),{color:css.getPropertyValue('--primary').trim(),weight:4}).addTo(group);}
  });
 },[ready,props.active,props.selected,props.route,props.fastRoute,props.reports,t]);
 const routeKey=props.route?.map(p=>`${p.lat.toFixed(3)},${p.lng.toFixed(3)}`).join('|')??'';const selectedKey=`${props.selected.id}:${props.selected.lat}:${props.selected.lng}`;
 useEffect(()=>{const m=map.current;if(!ready||!m||!routeKey)return;const pts=routeKey.split('|').map(x=>x.split(',').map(Number) as [number,number]);void import('leaflet').then(L=>m.fitBounds(L.latLngBounds(pts),{padding:[90,100],maxZoom:6}));},[routeKey,ready]);
 useEffect(()=>{if(ready)map.current?.panTo([props.selected.lat,props.selected.lng],{animate:true});// eslint-disable-next-line react-hooks/exhaustive-deps
 },[selectedKey,ready]);
 return <><div ref={host} className="mars-map" aria-label={t("Interactive Mars map")}/><div className="map-navigation"><Button variant="map" size="icon" title={t("Zoom in")} onClick={()=>map.current?.zoomIn()}><Plus/></Button><Button variant="map" size="icon" title={t("Zoom out")} onClick={()=>map.current?.zoomOut()}><Minus/></Button><Button variant="map" className="recenter-button" title={t("Recenter map")} onClick={()=>map.current?.setView([props.selected.lat,props.selected.lng],5)}><LocateFixed/><span>{t("Recenter")}</span></Button></div><div className="map-readout"><span>{Math.abs(cursor.lat).toFixed(2)}° {cursor.lat<0?'S':'N'} &nbsp; {Math.abs(cursor.lng).toFixed(2)}° {cursor.lng<0?'W':'E'}</span><span>{modeledElevation(cursor).toLocaleString()} {t("m · modeled elevation")}</span><div className="scale-bar">{scale.toLocaleString()} {t("km")}</div></div>{status&&<div className="tile-status">{t(status)}</div>}</>;
}
