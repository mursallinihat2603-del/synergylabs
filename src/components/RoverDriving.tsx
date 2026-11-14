import {Suspense,useEffect,useMemo,useRef,useState} from 'react';
import {Canvas,useFrame} from '@react-three/fiber';
import {Physics,RigidBody,CuboidCollider,useRapier,useBeforePhysicsStep,type RapierRigidBody} from '@react-three/rapier';
import {Environment,Lightformer,useTexture,Line} from '@react-three/drei';
import type {Coordinate} from '@/lib/mars';
import {Quaternion,Vector3,PlaneGeometry,RepeatWrapping,SRGBColorSpace} from 'three';
import VehicleAppearance, {type VehiclePalette} from '@/components/VehicleAppearance';
import {vehicleAppearance} from '@/lib/vehicle-appearance';
import DrivingTelemetry,{type DriveTelemetry} from '@/components/DrivingTelemetry';
import RouteFinishFlag from '@/components/RouteFinishFlag';
import {roverGuidance,type DrivingPoint} from '@/lib/rover-guidance';
import {driveVelocityChange,vehicleMass,steeringRate,VEHICLE_HANDLING} from '@/lib/vehicle-physics';
import {SAND_ZONES,terrainCondition,mobilityFactor,freshDriveCondition,stepDriveCondition,impactDamage,drivingRoutePoints,poweredDriveInput,reachedRouteFinish} from '@/lib/rover-challenges';
import terrainAsset from '@/assets/rover-ground.asset.json';
import {ArrowLeft,ArrowUp,ArrowDown,RotateCcw,RotateCw,LocateFixed,Pause,Play} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {useLanguage} from '@/components/LanguageProvider';
import {roverInput,roverTargetSpeed,roverTerrainHeight,ROVER_PHYSICS} from '@/lib/rover-driving';
type Palette=VehiclePalette;
const rocks=Array.from({length:42},(_,i)=>({x:Math.sin(i*17.3)*65,z:-8-Math.abs(Math.cos(i*8.7))*110,size:.4+(i%5)*.35}));
function Terrain({palette}:{palette:Palette}){
 const original=useTexture(terrainAsset.url);const texture=useMemo(()=>{const t=original.clone();t.wrapS=t.wrapT=RepeatWrapping;t.repeat.set(45,45);t.colorSpace=SRGBColorSpace;return t;},[original]);
 const geometry=useMemo(()=>{const g=new PlaneGeometry(300,300,180,180);g.rotateX(-Math.PI/2);const positions=g.attributes['position'];if(positions)for(let i=0;i<positions.count;i++)positions.setY(i,roverTerrainHeight(positions.getX(i),positions.getZ(i)));g.computeVertexNormals();return g;},[]);
 useEffect(()=>()=>{texture.dispose();geometry.dispose();},[texture,geometry]);
 return <RigidBody type="fixed" colliders="trimesh"><mesh geometry={geometry} receiveShadow><meshStandardMaterial map={texture} color={palette.ground} roughness={1}/></mesh></RigidBody>;
}
function Rover({keys,paused,reset,host,vehicle,palette,telemetry,repair,finish,route}:{keys:React.RefObject<Set<string>>;paused:boolean;reset:number;palette:Palette;host:React.RefObject<HTMLDivElement|null>;vehicle:string;telemetry:React.RefObject<DriveTelemetry>;repair:boolean;finish:[number,number,number]|undefined;route:readonly DrivingPoint[]}){
 const body=useRef<RapierRigidBody>(null),heading=useRef(0),speed=useRef(0),suspension=useRef(Array(6).fill(.55));
 const {world,rapier}=useRapier(),controller=useRef<ReturnType<typeof world.createVehicleController>|null>(null);
 const setupController=()=>{const b=body.current;if(!b||controller.current)return;const c=world.createVehicleController(b);c.indexUpAxis=1;c.setIndexForwardAxis=2;
  for(const x of [-1,1])for(const z of [-1,0,1]){const i=c.numWheels();c.addWheel({x,y:0,z},{x:0,y:-1,z:0},{x:-1,y:0,z:0},ROVER_PHYSICS.suspensionLength,.3);c.setWheelSuspensionStiffness(i,ROVER_PHYSICS.stiffness);c.setWheelSuspensionCompression(i,ROVER_PHYSICS.compression);c.setWheelSuspensionRelaxation(i,ROVER_PHYSICS.relaxation);c.setWheelMaxSuspensionTravel(i,ROVER_PHYSICS.maxTravel);c.setWheelMaxSuspensionForce(i,15000);c.setWheelFrictionSlip(i,3);}
  controller.current=c;
 };
 useEffect(()=>()=>{const c=controller.current;if(c)world.removeVehicleController(c);controller.current=null;},[world]);
 useEffect(()=>{telemetry.current.arrived=false;},[reset,finish,telemetry]);
 useEffect(()=>{
  if(!import.meta.env.DEV)return;
  const debugWindow=window as Window & {__rover?:{state:()=>DriveTelemetry;teleport:(x:number,z:number)=>void;sim:(seconds:number,boost?:boolean)=>void}};
  debugWindow.__rover={state:()=>({...telemetry.current,condition:{...telemetry.current.condition}}),teleport:(x,z)=>{body.current?.setTranslation({x,y:roverTerrainHeight(x,z)+1.1,z},true);body.current?.setLinvel({x:0,y:0,z:0},true);},sim:(seconds,boost=false)=>{for(let elapsed=0;elapsed<seconds;elapsed+=1/60){const p=body.current?.translation();if(!p)return;const ground=terrainCondition(p.x,p.z);telemetry.current.condition=stepDriveCondition(telemetry.current.condition,Math.min(1/60,seconds-elapsed),{moving:!repair,boost,sand:ground.sand,slope:ground.slope,speed:speed.current,repair});}}};
  return()=>{delete debugWindow.__rover;};
 },[telemetry,repair]);
 useEffect(()=>{body.current?.setTranslation({x:0,y:1.1,z:0},true);body.current?.setLinvel({x:0,y:0,z:0},true);body.current?.setAngvel({x:0,y:0,z:0},true);body.current?.setRotation(new Quaternion(),true);heading.current=0;speed.current=0;},[reset]);
 useBeforePhysicsStep(()=>{if(paused)return;setupController();const c=controller.current,b=body.current;if(!c||!b)return;const input=roverInput(keys.current),target=roverTargetSpeed(vehicle,keys.current);const forward=new Vector3(0,0,-1).applyQuaternion(b.rotation());const velocity=b.linvel(),longitudinal=new Vector3(velocity.x,velocity.y,velocity.z).dot(forward);for(let i=0;i<6;i++){c.setWheelEngineForce(i,0);c.setWheelBrake(i,input.throttle?0:4);c.setWheelSteering(i,0);}c.updateVehicle(1/60,rapier.QueryFilterFlags.EXCLUDE_DYNAMIC);for(let i=0;i<6;i++)suspension.current[i]=c.wheelSuspensionLength(i)??.55;host.current?.setAttribute('data-suspension',suspension.current.map(v=>v.toFixed(3)).join(','));});
 useFrame(({camera},dt)=>{
  const b=body.current;if(!b)return;const delta=Math.min(dt,.05),input=roverInput(keys.current);if(input.throttle||input.steer)b.wakeUp();
  const location=b.translation(),terrain=terrainCondition(location.x,location.z);
  telemetry.current.guidance=roverGuidance(route,location);
  if(!paused&&reachedRouteFinish(location,finish))telemetry.current.arrived=true;
  if(!paused)telemetry.current.condition=stepDriveCondition(telemetry.current.condition,delta,{moving:!!input.throttle||!!input.steer,boost:keys.current.has('ShiftLeft')||keys.current.has('ShiftRight'),sand:terrain.sand,slope:terrain.slope,speed:speed.current,repair});
  telemetry.current.sand=terrain.sand;telemetry.current.slope=terrain.slope;telemetry.current.speed=speed.current;
  host.current?.setAttribute('data-battery',telemetry.current.condition.battery.toFixed(2));host.current?.setAttribute('data-integrity',telemetry.current.condition.integrity.toFixed(2));host.current?.setAttribute('data-surface',terrain.sand?'sand':'firm');
  const powered=poweredDriveInput(telemetry.current.condition.battery,input);
  const target=paused?0:powered.throttle*roverTargetSpeed(vehicle,keys.current)*mobilityFactor(telemetry.current.condition,terrain.sand,terrain.slope);speed.current=telemetry.current.condition.battery<=0?0:speed.current+(target-speed.current)*(1-Math.exp(-delta*3));
  const shutdown=telemetry.current.condition.battery<=0;
  b.setEnabledTranslations(!shutdown,true,!shutdown,true);b.setEnabledRotations(!shutdown,!shutdown,!shutdown,true);
  if(shutdown){b.setLinvel({x:0,y:b.linvel().y,z:0},true);b.setAngvel({x:0,y:0,z:0},true);}
  telemetry.current.speed=speed.current;
  if(!paused&&!shutdown){
   const direction=new Vector3(0,0,-1).applyQuaternion(b.rotation());direction.y=0;direction.normalize();
   const velocity=b.linvel(),longitudinal=velocity.x*direction.x+velocity.z*direction.z;
   const mass=b.mass(),dv=driveVelocityChange(longitudinal,target,delta),lateralX=velocity.x-direction.x*longitudinal,lateralZ=velocity.z-direction.z*longitudinal;
   const grip=1-Math.exp(-VEHICLE_HANDLING.grip*(terrain.sand?.38:1)*delta);
   b.applyImpulse({x:mass*(direction.x*dv-lateralX*grip),y:0,z:mass*(direction.z*dv-lateralZ*grip)},true);
   const angular=b.angvel(),turn=steeringRate(powered.steer,longitudinal),r=b.rotation();
   if(powered.steer){const q=new Quaternion(r.x,r.y,r.z,r.w);q.premultiply(new Quaternion().setFromAxisAngle(new Vector3(0,1,0),turn*delta));b.setRotation(q,true);}
   b.setAngvel({x:angular.x,y:0,z:angular.z},true);
   speed.current=longitudinal;telemetry.current.speed=longitudinal;
  }
  const position=b.translation(),rotation=b.rotation();const forward=new Vector3(0,0,-1).applyQuaternion(rotation);heading.current=Math.atan2(-forward.x,-forward.z);
  const offset=new Vector3(0,3.3,6).applyQuaternion(rotation);camera.position.lerp(new Vector3(position.x,position.y,position.z).add(offset),1-Math.exp(-delta*5));const look=new Vector3(position.x,position.y+.65,position.z).addScaledVector(forward,2);camera.lookAt(look);
  host.current?.setAttribute('data-rover-position',`${position.x.toFixed(3)},${position.z.toFixed(3)}`);host.current?.setAttribute('data-rover-heading',heading.current.toFixed(3));host.current?.setAttribute('data-scene-ready','true');
 });
 return <RigidBody ref={body} colliders={false} position={[0,1.1,0]} linearDamping={.2} angularDamping={2} friction={1} ccd onCollisionEnter={({other})=>{if(other.rigidBodyObject?.name==='driving-rock')telemetry.current.condition=impactDamage(telemetry.current.condition,speed.current);}}><CuboidCollider args={vehicle==='Walking EVA'?[.3,.75,.3]:[.8,.3,1.2]} position={[0,vehicle==='Walking EVA'?.3:.2,0]} mass={vehicleMass(vehicle)}/><VehicleAppearance vehicle={vehicle} palette={palette} suspension={suspension} speed={speed}/></RigidBody>;
}
export default function RoverDriving({onClose,onPhotos,vehicle,route}:{onClose:()=>void;onPhotos:()=>void;vehicle:string;route?:Coordinate[]|undefined}){
 const {language,t}=useLanguage(),keys=useRef(new Set<string>()),host=useRef<HTMLDivElement>(null);const [paused,setPaused]=useState(false),[reset,setReset]=useState(0),[palette,setPalette]=useState<Palette|null>(null);
 const [repair,setRepair]=useState(false),telemetry=useRef<DriveTelemetry>({condition:freshDriveCondition(),sand:false,slope:0,speed:0});
 const label=(en:string,ru:string,az:string)=>language==='ru'?ru:language==='az'?az:en;
 const drivingRoute=useMemo(()=>drivingRoutePoints(route??[]),[route]);
 useEffect(()=>{const css=getComputedStyle(document.documentElement),canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');if(!ctx)return;const color=(token:string)=>{ctx.fillStyle=css.getPropertyValue(token).trim();ctx.fillRect(0,0,1,1);const p=ctx.getImageData(0,0,1,1).data;return `rgb(${p[0]},${p[1]},${p[2]})`;};setPalette({ground:color('--rover-ground'),rock:color('--rover-rock'),sky:color('--rover-sky'),body:color('--foreground'),wheel:color('--background'),metal:color('--muted-foreground'),accent:color('--primary')});},[]);
 useEffect(()=>{const down=(e:KeyboardEvent)=>{if(e.code==='Escape'){onClose();return;}if(!['KeyW','KeyA','KeyS','KeyD','ShiftLeft','ShiftRight'].includes(e.code)||e.ctrlKey||e.metaKey)return;const target=e.target;if(target instanceof HTMLElement&&target.closest('input,textarea,select,[contenteditable=true]'))return;e.preventDefault();keys.current.add(e.code);};const up=(e:KeyboardEvent)=>keys.current.delete(e.code),clear=()=>keys.current.clear();window.addEventListener('keydown',down);window.addEventListener('keyup',up);window.addEventListener('blur',clear);document.addEventListener('visibilitychange',clear);return()=>{clear();window.removeEventListener('keydown',down);window.removeEventListener('keyup',up);window.removeEventListener('blur',clear);document.removeEventListener('visibilitychange',clear);};},[onClose]);
 return <div className="rover-driving" role="dialog" aria-label={label('Rover driving','Вождение марсохода','Rover sürmə')} data-vehicle-appearance={vehicleAppearance(vehicle)} ref={host}><header className="driving-header"><Button variant="map" onClick={onClose}><ArrowLeft/>{t('Back to map')}</Button><div><h1>{t(vehicle)}</h1><small>{t('SIMULATION')} · {label('Illustrative terrain, not NASA photography','Условная местность, не снимки NASA','Nümunə ərazi, NASA fotoşəkli deyil')}</small></div><Button variant="map" onClick={onPhotos}>{label('NASA panorama','Панорама NASA','NASA panoraması')}</Button></header>
 <div className="driving-scene">{palette&&<Canvas shadows camera={{position:[0,5,9],fov:55}} dpr={[1,1.5]}><color attach="background" args={[palette.sky]}/><fog attach="fog" args={[palette.sky,70,160]}/><ambientLight intensity={1.5}/><directionalLight position={[20,40,20]} intensity={3} castShadow shadow-mapSize={[1024,1024]}/><Suspense fallback={null}><Physics gravity={[0,-3.71,0]} paused={paused}>
 <RigidBody type="fixed" position={[0,-.6,0]}><CuboidCollider args={[150,.1,150]}/></RigidBody><Suspense fallback={null}><Terrain palette={palette}/></Suspense><Environment resolution={64}><Lightformer position={[0,8,0]} intensity={2} scale={10}/></Environment>
 {rocks.map((r,i)=><RigidBody name="driving-rock" key={i} type="fixed" colliders="hull" position={[r.x,roverTerrainHeight(r.x,r.z)+r.size/2,r.z]}><mesh scale={[r.size,r.size*.65,r.size*.9]} castShadow receiveShadow><dodecahedronGeometry args={[1,0]}/><meshStandardMaterial color={palette.rock} roughness={1}/></mesh></RigidBody>)}
 {SAND_ZONES.map((zone,i)=><mesh key={`sand-${i}`} position={[zone.x,roverTerrainHeight(zone.x,zone.z)+.08,zone.z]} rotation={[-Math.PI/2,0,0]}><circleGeometry args={[zone.radius,48]}/><meshStandardMaterial color={palette.accent} roughness={1} transparent opacity={.35} depthWrite={false}/></mesh>)}
 {Array.from({length:14},(_,i)=><mesh key={i} position={[(i-7)*22,5,-135]} scale={[22,9+(i%3)*6,12]}><coneGeometry args={[1,1,6]}/><meshStandardMaterial color={palette.rock}/></mesh>)}
 <>{drivingRoute.length>1&&<><Line points={drivingRoute} color={palette.wheel} lineWidth={11} depthTest={false}/><Line points={drivingRoute} color={palette.accent} lineWidth={5} depthTest={false}/>{drivingRoute.filter((_,i)=>i%40===0).map((point,i)=><mesh key={`route-${i}`} position={[point[0],point[1]+.4,point[2]]}><coneGeometry args={[.18,.7,8]}/><meshStandardMaterial color={palette.body}/></mesh>)}{drivingRoute.at(-1)&&<RouteFinishFlag point={drivingRoute.at(-1)??[0,0,0]} palette={palette}/>}</>}</><Rover keys={keys} paused={paused} reset={reset} palette={palette} host={host} vehicle={vehicle} telemetry={telemetry} repair={repair} finish={drivingRoute.at(-1)} route={drivingRoute}/></Physics></Suspense></Canvas>}</div>
 <DrivingTelemetry telemetry={telemetry} repair={repair} onRepair={()=>setRepair(v=>!v)}/>
 {route&&<div className="driving-route-label">{t(vehicle)} · {label('Route preview · compressed simulation scale','Маршрут · сжатый масштаб симуляции','Marşrut · sıxılmış simulyasiya miqyası')}</div>}
 <div className="driving-actions"><Button variant="map" title={label('Hold to boost','Удерживайте для ускорения','Sürətləndirmək üçün saxlayın')} aria-label="Boost" onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);keys.current.add('ShiftLeft');}} onPointerUp={()=>keys.current.delete('ShiftLeft')} onPointerCancel={()=>keys.current.delete('ShiftLeft')}>⇧</Button><Button variant="map" size="icon" title={t('Recenter')} onClick={()=>{keys.current.clear();setReset(r=>r+1);}}><LocateFixed/></Button><Button variant="map" size="icon" title={paused?t('Resume trip'):t('Pause trip')} onClick={()=>{keys.current.clear();setPaused(v=>!v);}}>{paused?<Play/>:<Pause/>}</Button></div>
 <div className="driving-pad" role="group" aria-label="WASD">{[{code:'KeyW',icon:ArrowUp,name:label('Forward','Вперёд','İrəli')},{code:'KeyA',icon:RotateCcw,name:label('Steer left','Руль влево','Sola dön')},{code:'KeyS',icon:ArrowDown,name:label('Reverse','Назад','Geri')},{code:'KeyD',icon:RotateCw,name:label('Steer right','Руль вправо','Sağa dön')}].map(control=><Button key={control.code} variant="map" aria-label={control.name} title={control.name} onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);keys.current.add(control.code);}} onPointerUp={()=>keys.current.delete(control.code)} onPointerCancel={()=>keys.current.delete(control.code)}><control.icon/><kbd>{control.code.slice(-1)}</kbd></Button>)}</div></div>;
}