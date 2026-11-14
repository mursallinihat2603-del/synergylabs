import {DoubleSide} from 'three';
import type {VehiclePalette} from './VehicleAppearance';
export default function RouteFinishFlag({point,palette}:{point:[number,number,number];palette:VehiclePalette}) {
 return <group position={point}>
  <mesh position={[0,2.5,0]} castShadow><cylinderGeometry args={[.055,.055,5,12]}/><meshStandardMaterial color={palette.metal} metalness={.8} roughness={.3}/></mesh>
  {Array.from({length:24},(_,i)=>{const col=i%6,row=Math.floor(i/6);return <mesh key={i} position={[.2+col*.4,4.7-row*.4,0]}><planeGeometry args={[.4,.4]}/><meshBasicMaterial color={(col+row)%2?palette.wheel:palette.body} side={DoubleSide}/></mesh>;})}
  <mesh rotation={[-Math.PI/2,0,0]} position={[0,.05,0]}><ringGeometry args={[1.3,1.5,48]}/><meshBasicMaterial color={palette.accent} side={DoubleSide}/></mesh>
 </group>;
}