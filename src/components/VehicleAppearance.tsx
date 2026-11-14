import {useRef, type RefObject} from 'react';
import {useFrame} from '@react-three/fiber';
import type {Group} from 'three';
import {vehicleAppearance} from '@/lib/vehicle-appearance';

export type VehiclePalette = {ground:string;rock:string;body:string;wheel:string;metal:string;sky:string;accent:string};
type Props = {vehicle:string;palette:VehiclePalette;suspension:RefObject<number[]>;speed:RefObject<number>};

function Panel({position,size,color,metalness=.35}:{position:[number,number,number];size:[number,number,number];color:string;metalness?:number}) {
  return <mesh position={position} castShadow receiveShadow><boxGeometry args={size}/><meshStandardMaterial color={color} metalness={metalness} roughness={.45}/></mesh>;
}

function Astronaut({palette,speed}:Pick<Props,'palette'|'speed'>) {
  const legs=useRef<Group>(null),arms=useRef<Group>(null),body=useRef<Group>(null),phase=useRef(0);
  useFrame((_,dt)=>{
    phase.current+=dt*Math.abs(speed.current)*5;
    const stride=Math.abs(speed.current)>.05?Math.sin(phase.current)*.42:0;
    legs.current?.children.forEach((leg,i)=>{leg.rotation.x=stride*(i===0?1:-1);});
    arms.current?.children.forEach((arm,i)=>{arm.rotation.x=-stride*(i===0?1:-1);});
    if(body.current)body.current.position.y=Math.abs(stride)*.04;
  });
  return <group ref={body} position={[0,-.55,0]}>
    <Panel position={[0,1.15,0]} size={[.65,.72,.4]} color={palette.body}/>
    <Panel position={[0,1.15,.33]} size={[.55,.65,.3]} color={palette.metal}/>
    <Panel position={[0,1.32,-.23]} size={[.42,.21,.06]} color={palette.accent}/>
    <mesh position={[0,1.8,0]} castShadow><sphereGeometry args={[.36,32,24]}/><meshStandardMaterial color={palette.body} roughness={.35}/></mesh>
    <mesh position={[0,1.8,-.18]} scale={[1,.8,.7]}><sphereGeometry args={[.29,32,20]}/><meshStandardMaterial color={palette.wheel} metalness={.9} roughness={.12}/></mesh>
    <group ref={legs} position={[0,.85,0]}>{[-1,1].map(side=><group key={side} position={[side*.19,0,0]}>
      <Panel position={[0,-.35,0]} size={[.25,.65,.27]} color={palette.body}/>
      <Panel position={[0,-.73,-.09]} size={[.3,.2,.46]} color={palette.wheel}/>
      <Panel position={[0,-.38,-.15]} size={[.22,.16,.07]} color={palette.metal}/>
    </group>)}</group>
    <group ref={arms} position={[0,1.45,0]}>{[-1,1].map(side=><group key={side} position={[side*.45,0,0]} rotation={[0,0,-side*.13]}>
      <Panel position={[0,-.25,0]} size={[.22,.5,.25]} color={palette.body}/>
      <Panel position={[0,-.56,0]} size={[.23,.17,.26]} color={palette.metal}/>
    </group>)}</group>
  </group>;
}

function Wheels({palette,suspension,speed,heavy}:Omit<Props,'vehicle'> & {heavy:boolean}) {
  const wheels=useRef<Group>(null),spin=useRef(0);
  useFrame((_,dt)=>{
    spin.current+=speed.current*dt/.36;
    wheels.current?.children.forEach((wheel,i)=>{
      wheel.position.y=-.22+(.55-(suspension.current[i]??.55));
      const tire=wheel.children[0];if(tire)tire.rotation.x=spin.current;
    });
  });
  return <group ref={wheels}>{[-1,1].flatMap((side,sideIndex)=>[-1,0,1].map((z,index)=><group key={`${side}-${z}`} position={[side*1.03,-.22,z*(heavy?1.15:1)]}>
    <group rotation={[0,0,Math.PI/2]}>
      <mesh castShadow receiveShadow><cylinderGeometry args={[.4,.4,heavy?.42:.32,24]}/><meshStandardMaterial color={palette.wheel} roughness={.95}/></mesh>
      <mesh position={[0,side*.23,0]}><cylinderGeometry args={[.22,.22,.03,16]}/><meshStandardMaterial color={palette.metal} metalness={.8} roughness={.3}/></mesh>
      {Array.from({length:16},(_,j)=><mesh key={j} position={[Math.sin(j*Math.PI/8)*.4,0,Math.cos(j*Math.PI/8)*.4]} rotation={[0,j*Math.PI/8,0]}><boxGeometry args={[.1,heavy?.43:.33,.035]}/><meshStandardMaterial color={palette.metal} roughness={.8}/></mesh>)}
    </group>
    <Panel position={[-side*.23,.15,0]} size={[.5,.09,.12]} color={palette.metal}/>
  </group>))}</group>;
}

export default function VehicleAppearance({vehicle,palette,suspension,speed}:Props) {
  const kind=vehicleAppearance(vehicle),chassis=useRef<Group>(null);
  useFrame(()=>{if(chassis.current)chassis.current.rotation.z=(suspension.current.slice(0,3).reduce((s,v)=>s+v,0)-suspension.current.slice(3).reduce((s,v)=>s+v,0))*.08;});
  if(kind==='eva')return <Astronaut palette={palette} speed={speed}/>;
  const heavy=kind==='heavy';
  return <group>
    <Wheels palette={palette} suspension={suspension} speed={speed} heavy={heavy}/>
    <group ref={chassis}>
      <Panel position={[0,.1,0]} size={[1.75,.38,heavy?3.05:2.8]} color={palette.metal}/>
      {heavy?<>
        <Panel position={[0,.48,-.95]} size={[1.62,.7,.92]} color={palette.accent}/>
        <Panel position={[0,.58,-1.43]} size={[1.3,.36,.04]} color={palette.wheel}/>
        <Panel position={[0,.38,.45]} size={[1.8,.16,1.8]} color={palette.metal}/>
        {[-.53,.53].map(x=><group key={x}><Panel position={[x,.72,.55]} size={[.85,.52,1.3]} color={palette.rock}/>{[-.05,.95].map(z=><Panel key={z} position={[x,.73,z]} size={[.87,.54,.045]} color={palette.metal}/>)}</group>)}
        <Panel position={[.65,1.14,.9]} size={[.13,1.4,.13]} color={palette.accent}/>
        <Panel position={[.18,1.76,.9]} size={[1.05,.13,.13]} color={palette.accent}/>
        <mesh position={[-.3,1.53,.9]}><cylinderGeometry args={[.04,.04,.4,12]}/><meshStandardMaterial color={palette.metal} metalness={.8}/></mesh>
      </>:<>
        <mesh position={[0,.74,-.12]} castShadow receiveShadow><boxGeometry args={[1.65,1.12,2.2]}/><meshStandardMaterial color={palette.body} metalness={.3} roughness={.4}/></mesh>
        <Panel position={[0,.95,-1.24]} size={[1.4,.52,.035]} color={palette.wheel} metalness={.9}/>
        {[-1,1].map(side=><group key={side}>
          <Panel position={[side*.84,.96,-.3]} size={[.025,.48,1.25]} color={palette.wheel} metalness={.9}/>
          <Panel position={[side*.84,.52,0]} size={[.03,.11,2]} color={palette.accent}/>
          <Panel position={[side*.76,.28,.8]} size={[.28,.09,.75]} color={palette.metal}/>
        </group>)}
        <Panel position={[0,1.37,.15]} size={[1.3,.1,1.5]} color={palette.accent}/>
        <mesh position={[.5,1.7,.65]} castShadow><cylinderGeometry args={[.025,.025,.55,12]}/><meshStandardMaterial color={palette.metal}/></mesh>
        <mesh position={[.5,1.98,.65]} rotation={[-.6,0,0]}><sphereGeometry args={[.22,20,12,0,Math.PI*2,0,Math.PI/2]}/><meshStandardMaterial color={palette.body} side={2}/></mesh>
      </>}
      {[-.6,.6].map(x=><Panel key={x} position={[x,.32,heavy?-1.55:-1.42]} size={[.23,.14,.08]} color={palette.body}/>)}
    </group>
  </group>;
}