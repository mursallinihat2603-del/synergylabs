import {useEffect,useMemo,useRef,useState,type ComponentRef} from 'react';
import {Canvas,useFrame,useThree} from '@react-three/fiber';
import {OrbitControls,Html,Line,Environment,Lightformer} from '@react-three/drei';
import {BufferGeometry,Float32BufferAttribute,CanvasTexture,SRGBColorSpace,Vector2,Vector3,ShapeUtils,DoubleSide} from 'three';
import {Plus,Minus,LocateFixed} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {landmarks,hazards,modeledElevation,type Coordinate} from '@/lib/mars';
import {globePosition,globeCoordinate,surfaceLine} from '@/lib/mars-globe';
import type {MarsMapProps} from './MarsMap';
import backup from '@/assets/mars-backup.asset.json';

const products:Record<string,string>={Viking:'Mars_Viking_MDIM21_ClrMosaic_global_232m',MOLA:'Mars_MGS_MOLA_ClrShade_merge_global_463m',THEMIS:'THEMIS_DayIR_ControlledMosaics_100m_v2_oct2018'};
function loadImage(url:string):Promise<HTMLImageElement>{return new Promise((resolve,reject)=>{const image=new Image();image.crossOrigin='anonymous';image.onload=()=>resolve(image);image.onerror=()=>reject(new Error('Imagery unavailable'));image.src=url;});}

function useImagery(layer:string){
 const [texture,setTexture]=useState<CanvasTexture|null>(null),[status,setStatus]=useState('Loading Mars imagery…');
 useEffect(()=>{let alive=true;let owned:CanvasTexture|null=null;setStatus('Loading Mars imagery…');
  void (async()=>{
   const canvas=document.createElement('canvas');canvas.width=2048;canvas.height=1024;const context=canvas.getContext('2d');if(!context)return;
   const base=await loadImage(backup.url);context.drawImage(base,0,0,2048,1024);
   if(layer!=='Viking'){
    try{const images=await Promise.all(Array.from({length:8},(_,i)=>loadImage(`https://trek.nasa.gov/tiles/Mars/EQ/${products[layer]}/1.0.0/default/default028mm/1/${Math.floor(i/4)}/${i%4}.${layer==='THEMIS'?'png':'jpg'}`)));images.forEach((image,i)=>context.drawImage(image,(i%4)*512,Math.floor(i/4)*512,512,512));if(alive)setStatus('');}
    catch{if(alive)setStatus('Layer unavailable · USGS Viking backup');}
   }else if(alive)setStatus('');
   if(!alive)return;owned=new CanvasTexture(canvas);owned.colorSpace=SRGBColorSpace;setTexture(owned);
  })().catch(()=>{if(alive)setStatus('Mars imagery could not load. Choose 2D to retry.');});
  return()=>{alive=false;owned?.dispose();};
 },[layer]);return {texture,status};
}

function HazardZone({coordinates,color,onClick}:{coordinates:number[][];color:string;onClick:()=>void}){
 const geometry=useMemo(()=>{
  const ring=coordinates.slice(0,-1).map(c=>new Vector2(c[0]??0,c[1]??0));const positions:number[]=[];
  for(const indices of ShapeUtils.triangulateShape(ring,[])){
   const a=ring[indices[0]??0],b=ring[indices[1]??0],c=ring[indices[2]??0];if(!a||!b||!c)continue;
   const n=12;const point=(i:number,j:number)=>globePosition({lng:a.x+(b.x-a.x)*i/n+(c.x-a.x)*j/n,lat:a.y+(b.y-a.y)*i/n+(c.y-a.y)*j/n},2.009);
   for(let i=0;i<n;i++)for(let j=0;j<n-i;j++){positions.push(...point(i,j),...point(i+1,j),...point(i,j+1));if(i+j<n-1)positions.push(...point(i+1,j),...point(i+1,j+1),...point(i,j+1));}
  }
  const g=new BufferGeometry();g.setAttribute('position',new Float32BufferAttribute(positions,3));g.computeVertexNormals();return g;
 },[coordinates]);
 useEffect(()=>()=>geometry.dispose(),[geometry]);
 return <group><mesh geometry={geometry} onClick={e=>{e.stopPropagation();onClick();}}><meshBasicMaterial color={color??''} transparent opacity={0.2} depthWrite={false} side={DoubleSide}/></mesh><Line points={surfaceLine(coordinates.map(c=>({lng:c[0]??0,lat:c[1]??0})))} color={color??''} lineWidth={1.5}/></group>;
}

function Scene({props,texture,compareTexture,colors,controls,ready,onCursor}:{props:MarsMapProps;texture:CanvasTexture;compareTexture:CanvasTexture|null;colors:Record<string,string>;controls:React.RefObject<ComponentRef<typeof OrbitControls>|null>;ready:()=>void;onCursor:(p:Coordinate)=>void}){
 const {camera,size,invalidate}=useThree();const signaled=useRef(false);
 useFrame(()=>{if(!signaled.current){signaled.current=true;requestAnimationFrame(ready);}});
 useEffect(()=>{
  const points=props.route?.length?props.route:[props.selected];const direction=new Vector3();points.forEach(p=>direction.add(new Vector3(...globePosition(p,1))));if(direction.length()<0.01)direction.set(...globePosition(props.selected,1));
  const distance=Math.max(7.4,5.3/(size.width/size.height));camera.position.copy(direction.normalize().multiplyScalar(distance));camera.lookAt(0,0,0);controls.current?.target.set(0,0,0);controls.current?.update();invalidate();
 },[props.selected,props.route,camera,size.width,size.height,controls,invalidate]);
 const selectHazard=(h:typeof hazards[number],p:Coordinate)=>props.onSelect({id:h.properties.id,name:h.properties.name,...p,elevation:modeledElevation(p),size:'Illustrative zone',type:'Hazard · '+h.properties.source,rating:h.properties.rating,description:h.properties.source});
 return <>
  <ambientLight intensity={1.1}/><directionalLight position={[5,4,6]} intensity={2}/>
  <Environment resolution={64}><Lightformer intensity={1} position={[0,5,0]} scale={[10,10,1]}/></Environment>
  <mesh onPointerMove={e=>onCursor(globeCoordinate(e.point))} onClick={e=>{e.stopPropagation();props.onPoint(globeCoordinate(e.point));}}><sphereGeometry args={[2,96,48]}/><meshStandardMaterial map={texture} roughness={1}/></mesh>
  {props.compare&&compareTexture&&props.swipe>0&&<mesh rotation={[0,0,0]}><sphereGeometry args={[2.003,96,48,Math.PI,Math.PI*2*props.swipe/100]}/><meshStandardMaterial map={compareTexture} roughness={1}/></mesh>}
  {hazards.filter(h=>props.active.includes(h.properties.category)).map(h=>{
   const color=colors[`hazard-${h.properties.category}`]??(colors['primary']??'');
   if(h.geometry.type==='Polygon'){const ring=h.geometry.coordinates[0] as number[][];const first=ring[0];if(!first)return null;return <HazardZone key={h.properties.id} coordinates={ring} color={color??''} onClick={()=>selectHazard(h,{lng:first[0]??0,lat:first[1]??0})}/>;}
   const [lng,lat]=h.geometry.coordinates as number[];const p={lng:lng??0,lat:lat??0};return <mesh key={h.properties.id} position={globePosition(p,2.027)} onClick={e=>{e.stopPropagation();selectHazard(h,p);}}><octahedronGeometry args={[0.025]}/><meshBasicMaterial color={color??''}/></mesh>;
  })}
  {landmarks.map(p=><mesh key={p.id} position={globePosition(p,2.032)} onClick={e=>{e.stopPropagation();props.onSelect(p);}}><sphereGeometry args={[p.id===props.selected.id?0.025:0.014,10,8]}/><meshBasicMaterial color={p.id===props.selected.id?(colors['primary']??''):(colors['cyan']??'')}/>{(p.id===props.selected.id||p.type!=='Landing site')&&<Html center distanceFactor={8} occlude zIndexRange={[2,0]}><span className="globe-label">{p.name}</span></Html>}</mesh>)}
  {!landmarks.some(p=>p.id===props.selected.id)&&<mesh position={globePosition(props.selected,2.035)}><sphereGeometry args={[0.025,10,8]}/><meshBasicMaterial color={(colors['primary']??'')}/><Html center distanceFactor={8} occlude zIndexRange={[2,0]}><span className="globe-label">{props.selected.name}</span></Html></mesh>}
  {props.reports.map((p,i)=><mesh key={`${p.name}-${i}`} position={globePosition(p,2.04)} onClick={e=>{e.stopPropagation();props.onPoint(p);}}><octahedronGeometry args={[0.025]}/><meshBasicMaterial color={(colors['cyan']??'')}/><Html center distanceFactor={8} occlude zIndexRange={[2,0]}><span className="globe-label">⚑ {p.name}</span></Html></mesh>)}
  {props.fastRoute&&<Line points={surfaceLine(props.fastRoute,2.025)} color={colors['muted-foreground']??''} lineWidth={2} dashed dashSize={0.06} gapSize={0.04}/>}
  {props.route&&<Line points={surfaceLine(props.route,2.03)} color={(colors['primary']??'')} lineWidth={3}/>}
  <OrbitControls ref={controls} enablePan={false} minDistance={2.6} maxDistance={28} enableDamping={false}/>
 </>;
}

export default function MarsGlobe(props:MarsMapProps){
 const {texture,status}=useImagery(props.layer);const comparison=useImagery(props.compare?'MOLA':'Viking');const controls=useRef<ComponentRef<typeof OrbitControls>>(null);const host=useRef<HTMLDivElement>(null);const [cursor,setCursor]=useState<Coordinate>(props.selected),[colors,setColors]=useState<Record<string,string>>({}),[failed,setFailed]=useState(false);
 useEffect(()=>{const css=getComputedStyle(document.documentElement);const names=['primary','cyan','background','muted-foreground',...['slopes','dust','sand','craters','radiation','temperature','historic'].map(c=>`hazard-${c}`)];const values:Record<string,string>={};const canvas=document.createElement('canvas');const context=canvas.getContext('2d',{willReadFrequently:true});for(const name of names){if(!context)continue;context.clearRect(0,0,1,1);context.fillStyle=css.getPropertyValue(`--${name}`).trim();context.fillRect(0,0,1,1);const pixel=context.getImageData(0,0,1,1).data;values[name]=`rgb(${pixel[0]},${pixel[1]},${pixel[2]})`;}setColors(values);},[]);
 const zoom=(factor:number)=>{const orbit=controls.current;if(!orbit)return;const position=orbit.object.position;const distance=Math.max(2.6,Math.min(28,position.length()*factor));position.normalize().multiplyScalar(distance);orbit.update();};
 return <><div className="mars-map mars-globe" ref={host} aria-label="Interactive 3D Mars globe">
  {failed?<div className="map-loading">3D is unavailable on this device. Choose 2D.</div>:texture&&colors['background']?<Canvas frameloop="demand" dpr={[1,1.5]} camera={{position:[0,0,8],fov:42}} gl={{antialias:true}} fallback={<div className="map-loading">3D is unavailable on this device. Choose 2D.</div>} onCreated={({gl})=>{gl.domElement.addEventListener('webglcontextlost',()=>setFailed(true),{once:true});}}><Scene props={props} texture={texture} compareTexture={comparison.texture} colors={colors} controls={controls} ready={()=>{if(host.current)host.current.setAttribute('data-scene-ready','true');}} onCursor={setCursor}/></Canvas>:<div className="map-loading">{status||'Loading Mars…'}</div>}
 </div><div className="map-navigation"><Button variant="map" size="icon" title="Zoom in" onClick={()=>zoom(0.8)}><Plus/></Button><Button variant="map" size="icon" title="Zoom out" onClick={()=>zoom(1.25)}><Minus/></Button><Button variant="map" size="icon" title="Center selected location" onClick={()=>{const orbit=controls.current;if(!orbit)return;orbit.object.position.set(...globePosition(props.selected,7.4));orbit.update();}}><LocateFixed/></Button></div><div className="map-readout"><span>{cursor.lat.toFixed(2)}°, {cursor.lng.toFixed(2)}°</span><span>3D globe · USGS / NASA imagery</span><span>Surface relief not to scale</span></div>{status&&<div className="tile-status">{status}</div>}</>;
}