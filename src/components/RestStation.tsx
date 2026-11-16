import {Canvas,useFrame} from '@react-three/fiber';
import {useRef,useState} from 'react';
import type {Group} from 'three';
import {Html} from '@react-three/drei';
import {freshStation,stationAct,type StationAction,type StationState} from '@/lib/station-actions';
import {OrbitControls,Environment,Lightformer} from '@react-three/drei';
import {RigidBody,CuboidCollider} from '@react-three/rapier';
import {X} from 'lucide-react';
import {Button} from '@/components/ui/button';
import type {VehiclePalette} from '@/components/VehicleAppearance';
import {roverTerrainHeight} from '@/lib/rover-driving';
export function StationBuilding({x,z,palette}:{x:number;z:number;palette:VehiclePalette}){
 return <RigidBody type="fixed" position={[x,roverTerrainHeight(x,z),z]}><CuboidCollider args={[3,2,3]} position={[0,2,0]}/>
  <mesh position={[0,1.6,0]} castShadow receiveShadow><cylinderGeometry args={[3,3.2,3.2,24]}/><meshStandardMaterial color={palette.body} roughness={.6}/></mesh>
  <mesh position={[0,3.2,0]} castShadow><sphereGeometry args={[3,24,12,0,Math.PI*2,0,Math.PI/2]}/><meshStandardMaterial color={palette.metal} metalness={.4} roughness={.5}/></mesh>
  <mesh position={[0,1.1,3.05]}><boxGeometry args={[1.4,2.2,.3]}/><meshStandardMaterial color={palette.accent} emissive={palette.accent} emissiveIntensity={.4}/></mesh>
  <mesh position={[2.4,4.4,0]}><cylinderGeometry args={[.04,.04,2]}/><meshStandardMaterial color={palette.metal}/></mesh>
 </RigidBody>;
}
function Chair({p,r,c}:{p:[number,number,number];r:number;c:string}){return <group position={p} rotation={[0,r,0]}><mesh position={[0,.45,0]}><boxGeometry args={[.5,.08,.5]}/><meshStandardMaterial color={c}/></mesh><mesh position={[0,.8,-.22]}><boxGeometry args={[.5,.7,.06]}/><meshStandardMaterial color={c}/></mesh>{([[-.2,-.2],[.2,-.2],[-.2,.2],[.2,.2]] as const).map(([a,b],i)=><mesh key={i} position={[a,.22,b]}><boxGeometry args={[.05,.44,.05]}/><meshStandardMaterial color={c}/></mesh>)}</group>;}
function Person({action,palette}:{action:StationAction;palette:VehiclePalette}){
 const arm=useRef<Group>(null),head=useRef<Group>(null);
 useFrame(({clock})=>{const t=clock.elapsedTime;if(arm.current)arm.current.rotation.x=action==='eat'||action==='drink'?-2.2+Math.sin(t*3)*.35:action==='sleep'?0:-.1;if(head.current)head.current.position.y=1.72+(action==='sleep'?Math.sin(t*1.2)*.02:0);});
 const seated=action!=='stand'&&action!=='sleep';
 // stand: near the table; sit: on the chair at z=1.5 facing the table; sleep: lying flat on the bunk bed
 const pose:{p:[number,number,number];r:[number,number,number]}=action==='sleep'?{p:[3.5,.72,.3],r:[-Math.PI/2,0,0]}:seated?{p:[0,-.25,1.5],r:[0,Math.PI,0]}:{p:[0,0,2.8],r:[0,0,0]};
 const legs=seated?[-Math.PI/2,-Math.PI/2]:[0,0];
 return <group position={pose.p} rotation={pose.r}>
  <group ref={head} position={[0,1.72,0]}><mesh position={[0,0,0]}><sphereGeometry args={[.24,20,14]}/><meshStandardMaterial color={palette.body}/></mesh><mesh position={[0,0,-.18]}><sphereGeometry args={[.15,16,10]}/><meshStandardMaterial color={palette.wheel} metalness={.6} roughness={.2}/></mesh></group>
  <mesh position={[0,1.05,0]}><boxGeometry args={[.5,.65,.32]}/><meshStandardMaterial color={palette.body}/></mesh>
  <mesh position={[0,1.1,.2]}><boxGeometry args={[.4,.5,.12]}/><meshStandardMaterial color={palette.metal}/></mesh>
  <group ref={arm} position={[.32,1.3,0]}><mesh position={[0,-.28,0]}><boxGeometry args={[.13,.56,.13]}/><meshStandardMaterial color={palette.body}/></mesh>
   {(action==='eat'||action==='drink')&&<mesh position={[0,-.6,0]}>{action==='eat'?<sphereGeometry args={[.08,12,8]}/>:<cylinderGeometry args={[.07,.06,.16,12]}/>}<meshStandardMaterial color={action==='eat'?palette.rock:palette.accent}/></mesh>}</group>
  <mesh position={[-.32,1.02,0]}><boxGeometry args={[.13,.56,.13]}/><meshStandardMaterial color={palette.body}/></mesh>
  {[-.13,.13].map((x,i)=><group key={x} position={[x,.72,0]} rotation={[legs[i]??0,0,0]}><mesh position={[0,-.36,0]}><boxGeometry args={[.17,.72,.17]}/><meshStandardMaterial color={palette.body}/></mesh></group>)}
 </group>;
}
function SleepZzz(){return <Html position={[3.5,1.6,.3]} center><span className="station-zzz">Z z z</span></Html>;
}
function Room({palette,state}:{palette:VehiclePalette;state:StationState}){
 return <>
  <mesh rotation={[-Math.PI/2,0,0]} receiveShadow><circleGeometry args={[5,48]}/><meshStandardMaterial color={palette.metal} roughness={.8}/></mesh>
  <mesh position={[0,1.8,0]}><cylinderGeometry args={[5,5,3.6,48,1,true]}/><meshStandardMaterial color={palette.body} side={1} roughness={.7}/></mesh>
  <mesh position={[0,1.6,-4.9]}><circleGeometry args={[.8,32]}/><meshStandardMaterial color={palette.ground} emissive={palette.ground} emissiveIntensity={.6}/></mesh>
  <mesh position={[0,3.6,0]} rotation={[Math.PI/2,0,0]}><circleGeometry args={[5,48]}/><meshStandardMaterial color={palette.metal}/></mesh>
  {/* table with food and drinks */}
  <mesh position={[0,.75,0]} castShadow><cylinderGeometry args={[1,1,.08,32]}/><meshStandardMaterial color={palette.wheel}/></mesh>
  <mesh position={[0,.37,0]}><cylinderGeometry args={[.08,.2,.74]}/><meshStandardMaterial color={palette.metal}/></mesh>
  {[0,1,2,3].map(i=>{const a=i*Math.PI/2;return <Chair key={i} p={[Math.sin(a)*1.5,0,Math.cos(a)*1.5]} r={a+Math.PI} c={palette.accent}/>;})}
  {Array.from({length:state.drinks},(_,i)=><mesh key={`cup${i}`} position={[Math.cos(i*2.1)*.55,.86,Math.sin(i*2.1)*.55]}><cylinderGeometry args={[.07,.06,.16,16]}/><meshStandardMaterial color={palette.accent}/></mesh>)}
  <mesh position={[0,.8,0]}><cylinderGeometry args={[.32,.25,.05,24]}/><meshStandardMaterial color={palette.body}/></mesh>
  {Array.from({length:state.food},(_,i)=><mesh key={`f${i}`} position={[Math.cos(i*1.3)*.15,.87,Math.sin(i*1.3)*.15]}><sphereGeometry args={[.07,12,8]}/><meshStandardMaterial color={i%2?palette.rock:palette.ground}/></mesh>)}
  {/* fridge, counter, sofa, plant */}
  <mesh position={[3.4,1,-2.4]} rotation={[0,-.6,0]}><boxGeometry args={[.9,2,.8]}/><meshStandardMaterial color={palette.body} metalness={.3}/></mesh>
  <mesh position={[-3.2,.5,-2.6]} rotation={[0,.7,0]}><boxGeometry args={[2.2,1,.7]}/><meshStandardMaterial color={palette.metal}/></mesh>
  {[0,1,2].map(i=><mesh key={`b${i}`} position={[-3.2+Math.cos(.7)*(i-1)*.5,1.15,-2.6-Math.sin(.7)*(i-1)*.5]}><cylinderGeometry args={[.06,.06,.3,12]}/><meshStandardMaterial color={palette.accent} transparent opacity={.8}/></mesh>)}
  <group position={[-2.6,0,2.6]} rotation={[0,2.3,0]}><mesh position={[0,.35,0]}><boxGeometry args={[2,.4,.8]}/><meshStandardMaterial color={palette.accent}/></mesh><mesh position={[0,.75,-.35]}><boxGeometry args={[2,.6,.15]}/><meshStandardMaterial color={palette.accent}/></mesh></group>
  <group position={[3,0,2.8]}><mesh position={[0,.25,0]}><cylinderGeometry args={[.25,.2,.5]}/><meshStandardMaterial color={palette.wheel}/></mesh><mesh position={[0,.8,0]}><sphereGeometry args={[.45,12,10]}/><meshStandardMaterial color={palette.ground}/></mesh></group>
  {/* bunk bed */}<group position={[3.5,0,.3]}><mesh position={[0,.35,0]}><boxGeometry args={[1,.5,2.2]}/><meshStandardMaterial color={palette.metal}/></mesh><mesh position={[0,.68,0]}><boxGeometry args={[.95,.16,2.1]}/><meshStandardMaterial color={palette.body}/></mesh><mesh position={[0,.8,-.85]}><boxGeometry args={[.7,.12,.35]}/><meshStandardMaterial color={palette.accent}/></mesh></group>
  <Person action={state.action} palette={palette}/>
  {state.action==='sleep'&&<SleepZzz/>}
  <pointLight position={[0,3,0]} intensity={25} castShadow/>
 </>;
}
export default function StationInterior({name,palette,onLeave,label}:{name:string;palette:VehiclePalette;onLeave:()=>void;label:(en:string,ru:string,az:string)=>string}){
 const [state,setState]=useState(freshStation);
 const actions:{id:StationAction;text:string;off?:boolean}[]=[{id:'eat',text:label('Eat','Поесть','Ye'),off:!state.food},{id:'drink',text:label('Drink','Попить','İç'),off:!state.drinks},{id:'sit',text:label('Sit down','Сесть','Otur')},{id:'sleep',text:label('Sleep','Спать','Yat')},{id:'stand',text:label('Stand up','Встать','Ayağa qalx')}];
 return <div className="station-interior" role="dialog" aria-label={name}><header><div><strong>{name}</strong><small>{label('Rest area · illustrative habitat, not a real NASA facility','Зона отдыха · условный модуль, не объект NASA','İstirahət zonası · nümunə modul, real NASA obyekti deyil')}</small></div><Button variant="map" onClick={onLeave}><X/>{label('Go outside','Выйти наружу','Çölə çıx')}</Button></header>
  <Canvas shadows camera={{position:[0,2.2,4.2],fov:60}} dpr={[1,1.5]}><color attach="background" args={[palette.wheel]}/><ambientLight intensity={.8}/><Environment resolution={32}><Lightformer position={[0,5,0]} intensity={1.5} scale={8}/></Environment><Room palette={palette} state={state}/><OrbitControls target={[0,.9,0]} maxDistance={4.6} minDistance={1.5} maxPolarAngle={Math.PI/2.05}/></Canvas>
  <div className="station-actions" role="group">{actions.map(a=><Button key={a.id} variant={state.action===a.id?'default':'map'} disabled={a.off} aria-pressed={state.action===a.id} onClick={()=>setState(s=>stationAct(s,a.id))}>{a.text}</Button>)}<small>{label(`Food ${state.food} · Drinks ${state.drinks}`,`Еда ${state.food} · Напитки ${state.drinks}`,`Yemək ${state.food} · İçki ${state.drinks}`)}</small></div>
 </div>;
}
