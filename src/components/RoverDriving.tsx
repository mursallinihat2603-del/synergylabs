import {Suspense,useEffect,useRef,useState} from 'react';
import {Canvas,useFrame} from '@react-three/fiber';
import {Physics,RigidBody,CuboidCollider,type RapierRigidBody} from '@react-three/rapier';
import {Quaternion,Vector3,type Group} from 'three';
import {ArrowLeft,ArrowUp,ArrowDown,RotateCcw,RotateCw,LocateFixed,Pause,Play} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {useLanguage} from '@/components/LanguageProvider';
import {roverInput} from '@/lib/rover-driving';
type Palette={ground:string;rock:string;body:string;wheel:string;metal:string;sky:string};
const rocks=Array.from({length:42},(_,i)=>({x:Math.sin(i*17.3)*65,z:-8-Math.abs(Math.cos(i*8.7))*110,size:.4+(i%5)*.35}));
function Rover({keys,paused,reset,palette,host}:{keys:React.RefObject<Set<string>>;paused:boolean;reset:number;palette:Palette;host:React.RefObject<HTMLDivElement|null>}){
 const body=useRef<RapierRigidBody>(null),visual=useRef<Group>(null),heading=useRef(0),speed=useRef(0),wheelTurn=useRef(0);
 useEffect(()=>{body.current?.setTranslation({x:0,y:1,z:0},true);body.current?.setLinvel({x:0,y:0,z:0},true);heading.current=0;speed.current=0;},[reset]);
 useFrame(({camera},dt)=>{
  const b=body.current;if(!b)return;const delta=Math.min(dt,.05),input=roverInput(keys.current);
  const target=paused?0:input.throttle*5;speed.current+=(target-speed.current)*Math.min(1,delta*4);
  if(!paused)heading.current+=input.steer*delta*.85*(speed.current<-.1?-1:1);
  b.setRotation(new Quaternion().setFromAxisAngle(new Vector3(0,1,0),heading.current),true);
  b.setLinvel({x:-Math.sin(heading.current)*speed.current,y:b.linvel().y,z:-Math.cos(heading.current)*speed.current},true);
  const position=b.translation();wheelTurn.current+=speed.current*delta;
  visual.current?.children.forEach(child=>{if(child.name==='wheel')child.rotation.x=wheelTurn.current;});
  const offset=new Vector3(Math.sin(heading.current)*8,5,Math.cos(heading.current)*8);camera.position.lerp(new Vector3(position.x,position.y,position.z).add(offset),1-Math.exp(-delta*5));camera.lookAt(position.x,position.y+1,position.z-1);
  host.current?.setAttribute('data-rover-position',`${position.x.toFixed(3)},${position.z.toFixed(3)}`);host.current?.setAttribute('data-rover-heading',heading.current.toFixed(3));host.current?.setAttribute('data-scene-ready','true');
 });
 return <RigidBody ref={body} colliders={false} position={[0,1,0]} enabledRotations={[false,true,false]} linearDamping={1} friction={1}><CuboidCollider args={[1,.55,1.5]} position={[0,.7,0]}/><group ref={visual}>
  <mesh position={[0,.8,0]} castShadow><boxGeometry args={[1.8,.8,2.8]}/><meshStandardMaterial color={palette.body} metalness={.4} roughness={.5}/></mesh>
  <mesh position={[0,1.35,-.3]} castShadow><boxGeometry args={[1.5,.3,1.8]}/><meshStandardMaterial color={palette.metal}/></mesh>
  <mesh position={[.5,2,-.6]}><cylinderGeometry args={[.07,.07,1.3]}/><meshStandardMaterial color={palette.metal}/></mesh><mesh position={[.5,2.7,-.6]}><boxGeometry args={[.65,.28,.28]}/><meshStandardMaterial color={palette.body}/></mesh>
  {[-1.05,1.05].flatMap(x=>[-1,0,1].map(z=><group name="wheel" key={`${x}:${z}`} position={[x,.45,z]}><mesh rotation={[0,0,Math.PI/2]} castShadow><cylinderGeometry args={[.5,.5,.4,16]}/><meshStandardMaterial color={palette.wheel} roughness={.9}/></mesh><mesh rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[.22,.22,.42,12]}/><meshStandardMaterial color={palette.metal}/></mesh></group>))}
 </group></RigidBody>;
}
export default function RoverDriving({onClose,onPhotos}:{onClose:()=>void;onPhotos:()=>void}){
 const {language,t}=useLanguage(),keys=useRef(new Set<string>()),host=useRef<HTMLDivElement>(null);const [paused,setPaused]=useState(false),[reset,setReset]=useState(0),[palette,setPalette]=useState<Palette|null>(null);
 const label=(en:string,ru:string,az:string)=>language==='ru'?ru:language==='az'?az:en;
 useEffect(()=>{const css=getComputedStyle(document.documentElement),canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');if(!ctx)return;const color=(token:string)=>{ctx.fillStyle=css.getPropertyValue(token).trim();ctx.fillRect(0,0,1,1);const p=ctx.getImageData(0,0,1,1).data;return `rgb(${p[0]},${p[1]},${p[2]})`;};setPalette({ground:color('--rover-ground'),rock:color('--rover-rock'),sky:color('--rover-sky'),body:color('--foreground'),wheel:color('--background'),metal:color('--muted-foreground')});},[]);
 useEffect(()=>{const down=(e:KeyboardEvent)=>{if(e.code==='Escape'){onClose();return;}if(!['KeyW','KeyA','KeyS','KeyD'].includes(e.code)||e.ctrlKey||e.metaKey)return;const target=e.target;if(target instanceof HTMLElement&&target.closest('input,textarea,select,[contenteditable=true]'))return;e.preventDefault();keys.current.add(e.code);};const up=(e:KeyboardEvent)=>keys.current.delete(e.code),clear=()=>keys.current.clear();window.addEventListener('keydown',down);window.addEventListener('keyup',up);window.addEventListener('blur',clear);document.addEventListener('visibilitychange',clear);return()=>{clear();window.removeEventListener('keydown',down);window.removeEventListener('keyup',up);window.removeEventListener('blur',clear);document.removeEventListener('visibilitychange',clear);};},[onClose]);
 return <div className="rover-driving" role="dialog" aria-label={label('Rover driving','Вождение марсохода','Rover sürmə')} ref={host}><header className="driving-header"><Button variant="map" onClick={onClose}><ArrowLeft/>{t('Back to map')}</Button><div><h1>{label('Rover driving','Вождение марсохода','Rover sürmə')}</h1><small>{t('SIMULATION')} · {label('Illustrative terrain, not NASA photography','Условная местность, не снимки NASA','Nümunə ərazi, NASA fotoşəkli deyil')}</small></div><Button variant="map" onClick={onPhotos}>{label('NASA panorama','Панорама NASA','NASA panoraması')}</Button></header>
 <div className="driving-scene">{palette&&<Canvas shadows camera={{position:[0,5,9],fov:55}} dpr={[1,1.5]}><color attach="background" args={[palette.sky]}/><fog attach="fog" args={[palette.sky,70,160]}/><ambientLight intensity={1.5}/><directionalLight position={[20,40,20]} intensity={3} castShadow shadow-mapSize={[1024,1024]}/><Suspense fallback={null}><Physics gravity={[0,-3.71,0]} paused={paused}>
 <RigidBody type="fixed" colliders="cuboid"><mesh rotation={[-Math.PI/2,0,0]} receiveShadow><boxGeometry args={[300,300,.5]}/><meshStandardMaterial color={palette.ground} roughness={1}/></mesh></RigidBody>
 {rocks.map((r,i)=><RigidBody key={i} type="fixed" colliders="hull" position={[r.x,r.size/2,r.z]}><mesh scale={[r.size,r.size*.65,r.size*.9]} castShadow receiveShadow><dodecahedronGeometry args={[1,0]}/><meshStandardMaterial color={palette.rock} roughness={1}/></mesh></RigidBody>)}
 {Array.from({length:14},(_,i)=><mesh key={i} position={[(i-7)*22,5,-135]} scale={[22,9+(i%3)*6,12]}><coneGeometry args={[1,1,6]}/><meshStandardMaterial color={palette.rock}/></mesh>)}
 <Rover keys={keys} paused={paused} reset={reset} palette={palette} host={host}/></Physics></Suspense></Canvas>}</div>
 <div className="driving-actions"><Button variant="map" size="icon" title={t('Recenter')} onClick={()=>{keys.current.clear();setReset(r=>r+1);}}><LocateFixed/></Button><Button variant="map" size="icon" title={paused?t('Resume trip'):t('Pause trip')} onClick={()=>{keys.current.clear();setPaused(v=>!v);}}>{paused?<Play/>:<Pause/>}</Button></div>
 <div className="driving-pad" role="group" aria-label="WASD">{[{code:'KeyW',icon:ArrowUp,name:label('Forward','Вперёд','İrəli')},{code:'KeyA',icon:RotateCcw,name:label('Steer left','Руль влево','Sola dön')},{code:'KeyS',icon:ArrowDown,name:label('Reverse','Назад','Geri')},{code:'KeyD',icon:RotateCw,name:label('Steer right','Руль вправо','Sağa dön')}].map(control=><Button key={control.code} variant="map" aria-label={control.name} title={control.name} onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);keys.current.add(control.code);}} onPointerUp={()=>keys.current.delete(control.code)} onPointerCancel={()=>keys.current.delete(control.code)}><control.icon/><kbd>{control.code.slice(-1)}</kbd></Button>)}</div></div>;
}