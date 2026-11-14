import {Suspense,useEffect,useMemo,useRef,useState} from 'react';
import {Canvas,useFrame} from '@react-three/fiber';
import {Physics,RigidBody,CuboidCollider,useRapier,useBeforePhysicsStep,type RapierRigidBody} from '@react-three/rapier';
import {Environment,Lightformer,useGLTF,useTexture,Line} from '@react-three/drei';
import type {Coordinate} from '@/lib/mars';
import {Quaternion,Vector3,Box3,Mesh,PlaneGeometry,RepeatWrapping,SRGBColorSpace,type Group} from 'three';
import {clone} from 'three/examples/jsm/utils/SkeletonUtils.js';
import roverAsset from '@/assets/models/perseverance.glb.asset.json';
import terrainAsset from '@/assets/rover-ground.asset.json';
import {ArrowLeft,ArrowUp,ArrowDown,RotateCcw,RotateCw,LocateFixed,Pause,Play} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {useLanguage} from '@/components/LanguageProvider';
import {roverInput,roverTargetSpeed,roverTerrainHeight,ROVER_PHYSICS} from '@/lib/rover-driving';
type Palette={ground:string;rock:string;body:string;wheel:string;metal:string;sky:string};
const rocks=Array.from({length:42},(_,i)=>({x:Math.sin(i*17.3)*65,z:-8-Math.abs(Math.cos(i*8.7))*110,size:.4+(i%5)*.35}));
function DetailedRover({suspension}:{suspension:React.RefObject<number[]>}){
 const gltf=useGLTF(roverAsset.url),group=useRef<Group>(null);
 const model=useMemo(()=>{const scene=clone(gltf.scene);const box=new Box3().setFromObject(scene),size=box.getSize(new Vector3()),center=box.getCenter(new Vector3());const scale=3/Math.max(size.x,size.z);scene.scale.setScalar(scale);scene.position.set(-center.x*scale,-box.min.y*scale-.55,-center.z*scale);scene.traverse(o=>{if(o instanceof Mesh){o.castShadow=true;o.receiveShadow=true;}});return scene;},[gltf.scene]);
 useFrame(()=>{const wheel=model.getObjectByName('Wheels_objs');if(wheel){const average=suspension.current.reduce((s,v)=>s+v,0)/6;wheel.position.y=.263746+(.55-average);}if(group.current){group.current.rotation.z=(suspension.current.slice(0,3).reduce((s,v)=>s+v,0)-suspension.current.slice(3).reduce((s,v)=>s+v,0))*.08;}});
 return <group ref={group} rotation={[0,Math.PI,0]}><primitive object={model}/></group>;
}
function Terrain({palette}:{palette:Palette}){
 const original=useTexture(terrainAsset.url);const texture=useMemo(()=>{const t=original.clone();t.wrapS=t.wrapT=RepeatWrapping;t.repeat.set(45,45);t.colorSpace=SRGBColorSpace;return t;},[original]);
 const geometry=useMemo(()=>{const g=new PlaneGeometry(300,300,180,180);g.rotateX(-Math.PI/2);const positions=g.attributes['position'];if(positions)for(let i=0;i<positions.count;i++)positions.setY(i,roverTerrainHeight(positions.getX(i),positions.getZ(i)));g.computeVertexNormals();return g;},[]);
 useEffect(()=>()=>{texture.dispose();geometry.dispose();},[texture,geometry]);
 return <RigidBody type="fixed" colliders="trimesh"><mesh geometry={geometry} receiveShadow><meshStandardMaterial map={texture} color={palette.ground} roughness={1}/></mesh></RigidBody>;
}
function Rover({keys,paused,reset,host,vehicle}:{keys:React.RefObject<Set<string>>;paused:boolean;reset:number;palette:Palette;host:React.RefObject<HTMLDivElement|null>;vehicle:string}){
 const body=useRef<RapierRigidBody>(null),heading=useRef(0),speed=useRef(0),suspension=useRef(Array(6).fill(.55));
 const {world,rapier}=useRapier(),controller=useRef<ReturnType<typeof world.createVehicleController>|null>(null);
 const setupController=()=>{const b=body.current;if(!b||controller.current)return;const c=world.createVehicleController(b);c.indexUpAxis=1;c.setIndexForwardAxis=2;
  for(const x of [-1,1])for(const z of [-1,0,1]){const i=c.numWheels();c.addWheel({x,y:0,z},{x:0,y:-1,z:0},{x:-1,y:0,z:0},ROVER_PHYSICS.suspensionLength,.3);c.setWheelSuspensionStiffness(i,ROVER_PHYSICS.stiffness);c.setWheelSuspensionCompression(i,ROVER_PHYSICS.compression);c.setWheelSuspensionRelaxation(i,ROVER_PHYSICS.relaxation);c.setWheelMaxSuspensionTravel(i,ROVER_PHYSICS.maxTravel);c.setWheelMaxSuspensionForce(i,15000);c.setWheelFrictionSlip(i,3);}
  controller.current=c;
 };
 useEffect(()=>()=>{const c=controller.current;if(c)world.removeVehicleController(c);controller.current=null;},[world]);
 useEffect(()=>{body.current?.setTranslation({x:0,y:1.1,z:0},true);body.current?.setLinvel({x:0,y:0,z:0},true);body.current?.setAngvel({x:0,y:0,z:0},true);body.current?.setRotation(new Quaternion(),true);heading.current=0;speed.current=0;},[reset]);
 useBeforePhysicsStep(()=>{if(paused)return;setupController();const c=controller.current,b=body.current;if(!c||!b)return;const input=roverInput(keys.current),target=roverTargetSpeed(vehicle,keys.current);const forward=new Vector3(0,0,-1).applyQuaternion(b.rotation());const velocity=b.linvel(),longitudinal=new Vector3(velocity.x,velocity.y,velocity.z).dot(forward);for(let i=0;i<6;i++){c.setWheelEngineForce(i,Math.abs(longitudinal)<target?-input.throttle*250:0);c.setWheelBrake(i,input.throttle?0:4);c.setWheelSteering(i,-input.steer*(i%3===0?.35:i%3===2?-.35:0));}c.updateVehicle(1/60,rapier.QueryFilterFlags.EXCLUDE_DYNAMIC);for(let i=0;i<6;i++)suspension.current[i]=c.wheelSuspensionLength(i)??.55;host.current?.setAttribute('data-suspension',suspension.current.map(v=>v.toFixed(3)).join(','));});
 useFrame(({camera},dt)=>{
  const b=body.current;if(!b)return;const delta=Math.min(dt,.05),input=roverInput(keys.current);if(input.throttle||input.steer)b.wakeUp();
  const target=paused?0:input.throttle*roverTargetSpeed(vehicle,keys.current);speed.current+=(target-speed.current)*(1-Math.exp(-delta*3));
  if(!paused){const r=b.rotation(),q=new Quaternion(r.x,r.y,r.z,r.w);q.multiply(new Quaternion().setFromAxisAngle(new Vector3(0,1,0),input.steer*delta*.7));b.setRotation(q,true);const direction=new Vector3(0,0,-1).applyQuaternion(q);b.setLinvel({x:direction.x*speed.current,y:b.linvel().y,z:direction.z*speed.current},true);}
  const position=b.translation(),rotation=b.rotation();const forward=new Vector3(0,0,-1).applyQuaternion(rotation);heading.current=Math.atan2(-forward.x,-forward.z);
  const offset=new Vector3(0,3.3,6).applyQuaternion(rotation);camera.position.lerp(new Vector3(position.x,position.y,position.z).add(offset),1-Math.exp(-delta*5));const look=new Vector3(position.x,position.y+.65,position.z).addScaledVector(forward,2);camera.lookAt(look);
  host.current?.setAttribute('data-rover-position',`${position.x.toFixed(3)},${position.z.toFixed(3)}`);host.current?.setAttribute('data-rover-heading',heading.current.toFixed(3));host.current?.setAttribute('data-scene-ready','true');
 });
 return <RigidBody ref={body} colliders={false} position={[0,1.1,0]} linearDamping={.2} angularDamping={2} friction={1}><CuboidCollider args={[.8,.3,1.2]} position={[0,.2,0]} mass={vehicle==='Heavy Rover'?450:300}/><Suspense fallback={null}><DetailedRover suspension={suspension}/></Suspense></RigidBody>;
}
export default function RoverDriving({onClose,onPhotos,vehicle,route}:{onClose:()=>void;onPhotos:()=>void;vehicle:string;route?:Coordinate[]|undefined}){
 const {language,t}=useLanguage(),keys=useRef(new Set<string>()),host=useRef<HTMLDivElement>(null);const [paused,setPaused]=useState(false),[reset,setReset]=useState(0),[palette,setPalette]=useState<Palette|null>(null);
 const label=(en:string,ru:string,az:string)=>language==='ru'?ru:language==='az'?az:en;
 const drivingRoute=useMemo(()=>{const first=route?.[0];if(!first)return [];const last=route?.at(-1);const bearing=last?Math.atan2(last.lng-first.lng,last.lat-first.lat):0;return route.map(p=>{const x=(p.lng-first.lng)*Math.cos(first.lat*Math.PI/180),z=-(p.lat-first.lat);const rx=x*Math.cos(bearing)+z*Math.sin(bearing),rz=-x*Math.sin(bearing)+z*Math.cos(bearing);return [rx*60,roverTerrainHeight(rx*60,rz*60)+.08,rz*60] as [number,number,number];});},[route]);
 useEffect(()=>{const css=getComputedStyle(document.documentElement),canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');if(!ctx)return;const color=(token:string)=>{ctx.fillStyle=css.getPropertyValue(token).trim();ctx.fillRect(0,0,1,1);const p=ctx.getImageData(0,0,1,1).data;return `rgb(${p[0]},${p[1]},${p[2]})`;};setPalette({ground:color('--rover-ground'),rock:color('--rover-rock'),sky:color('--rover-sky'),body:color('--foreground'),wheel:color('--background'),metal:color('--muted-foreground')});},[]);
 useEffect(()=>{const down=(e:KeyboardEvent)=>{if(e.code==='Escape'){onClose();return;}if(!['KeyW','KeyA','KeyS','KeyD','ShiftLeft','ShiftRight'].includes(e.code)||e.ctrlKey||e.metaKey)return;const target=e.target;if(target instanceof HTMLElement&&target.closest('input,textarea,select,[contenteditable=true]'))return;e.preventDefault();keys.current.add(e.code);};const up=(e:KeyboardEvent)=>keys.current.delete(e.code),clear=()=>keys.current.clear();window.addEventListener('keydown',down);window.addEventListener('keyup',up);window.addEventListener('blur',clear);document.addEventListener('visibilitychange',clear);return()=>{clear();window.removeEventListener('keydown',down);window.removeEventListener('keyup',up);window.removeEventListener('blur',clear);document.removeEventListener('visibilitychange',clear);};},[onClose]);
 return <div className="rover-driving" role="dialog" aria-label={label('Rover driving','Вождение марсохода','Rover sürmə')} ref={host}><header className="driving-header"><Button variant="map" onClick={onClose}><ArrowLeft/>{t('Back to map')}</Button><div><h1>{label('Rover driving','Вождение марсохода','Rover sürmə')}</h1><small>{t('SIMULATION')} · {label('Illustrative terrain, not NASA photography','Условная местность, не снимки NASA','Nümunə ərazi, NASA fotoşəkli deyil')}</small></div><Button variant="map" onClick={onPhotos}>{label('NASA panorama','Панорама NASA','NASA panoraması')}</Button></header>
 <div className="driving-scene">{palette&&<Canvas shadows camera={{position:[0,5,9],fov:55}} dpr={[1,1.5]}><color attach="background" args={[palette.sky]}/><fog attach="fog" args={[palette.sky,70,160]}/><ambientLight intensity={1.5}/><directionalLight position={[20,40,20]} intensity={3} castShadow shadow-mapSize={[1024,1024]}/><Suspense fallback={null}><Physics gravity={[0,-3.71,0]} paused={paused}>
 <RigidBody type="fixed" position={[0,-.6,0]}><CuboidCollider args={[150,.1,150]}/></RigidBody><Suspense fallback={null}><Terrain palette={palette}/></Suspense><Environment resolution={64}><Lightformer position={[0,8,0]} intensity={2} scale={10}/></Environment>
 {rocks.map((r,i)=><RigidBody key={i} type="fixed" colliders="hull" position={[r.x,r.size/2,r.z]}><mesh scale={[r.size,r.size*.65,r.size*.9]} castShadow receiveShadow><dodecahedronGeometry args={[1,0]}/><meshStandardMaterial color={palette.rock} roughness={1}/></mesh></RigidBody>)}
 {Array.from({length:14},(_,i)=><mesh key={i} position={[(i-7)*22,5,-135]} scale={[22,9+(i%3)*6,12]}><coneGeometry args={[1,1,6]}/><meshStandardMaterial color={palette.rock}/></mesh>)}
 <>{drivingRoute.length>1&&<Line points={drivingRoute} color={palette.body} lineWidth={4}/>}</><Rover keys={keys} paused={paused} reset={reset} palette={palette} host={host} vehicle={vehicle}/></Physics></Suspense></Canvas>}</div>
 {route&&<div className="driving-route-label">{t(vehicle)} · {label('Route preview · compressed simulation scale','Маршрут · сжатый масштаб симуляции','Marşrut · sıxılmış simulyasiya miqyası')}</div>}
 <div className="driving-actions"><Button variant="map" size="icon" title={t('Recenter')} onClick={()=>{keys.current.clear();setReset(r=>r+1);}}><LocateFixed/></Button><Button variant="map" size="icon" title={paused?t('Resume trip'):t('Pause trip')} onClick={()=>{keys.current.clear();setPaused(v=>!v);}}>{paused?<Play/>:<Pause/>}</Button></div>
 <div className="driving-pad" role="group" aria-label="WASD">{[{code:'KeyW',icon:ArrowUp,name:label('Forward','Вперёд','İrəli')},{code:'KeyA',icon:RotateCcw,name:label('Steer left','Руль влево','Sola dön')},{code:'KeyS',icon:ArrowDown,name:label('Reverse','Назад','Geri')},{code:'KeyD',icon:RotateCw,name:label('Steer right','Руль вправо','Sağa dön')}].map(control=><Button key={control.code} variant="map" aria-label={control.name} title={control.name} onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);keys.current.add(control.code);}} onPointerUp={()=>keys.current.delete(control.code)} onPointerCancel={()=>keys.current.delete(control.code)}><control.icon/><kbd>{control.code.slice(-1)}</kbd></Button>)}</div></div>;
}