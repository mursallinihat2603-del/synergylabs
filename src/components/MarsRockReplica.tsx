import {useMemo,useEffect} from 'react';
import {BufferGeometry,Float32BufferAttribute} from 'three';
import {Line} from '@react-three/drei';
import type {RockId} from '@/lib/rock-collection';
import type {VehiclePalette} from '@/components/VehicleAppearance';

// Photo-informed outlines; hidden faces and fine relief are illustrative, not scans.
function rockGeometry(id:RockId) {
 const vertices = id==='jake'
  ? [[-.8,0,-.6],[.75,0,-.55],[.8,0,.65],[-.7,0,.65],[-.25,.95,-.15],[.2,.35,.6]]
  : id==='adirondack'
  ? [[-.9,0,-.5],[.85,0,-.55],[1,0,.45],[-.8,0,.65],[-.1,.55,-.1],[.65,.22,.45]]
  : [[0,0,-1],[.7,0,.6],[.25,0,.8],[-.6,0,.65],[-.2,.25,-.45],[.3,.18,.5]];
 const faces = [0,1,4,1,2,5,1,5,4,2,3,5,3,4,5,3,0,4,0,3,2,0,2,1];
 const positions=faces.flatMap(i=>vertices[i]??[0,0,0]);
 const geometry=new BufferGeometry();geometry.setAttribute('position',new Float32BufferAttribute(positions,3));geometry.computeVertexNormals();return geometry;
}
export default function MarsRockReplica({id,palette}:{id:RockId;palette:VehiclePalette}) {
 const geometry=useMemo(()=>rockGeometry(id),[id]);
 useEffect(()=>()=>geometry.dispose(),[geometry]);
 return <group><mesh geometry={geometry} castShadow receiveShadow><meshStandardMaterial color={id==='cheyava'?palette.ground:palette.rock} roughness={1} flatShading/></mesh>
 {id==='cheyava'&&<><Line points={[[-.12,.27,-.55],[-.25,.27,-.1],[-.3,.23,.25],[-.35,.19,.55]]} color={palette.body} lineWidth={4}/><Line points={[[.15,.23,-.3],[.3,.22,.1],[.4,.19,.45]]} color={palette.body} lineWidth={3}/>{Array.from({length:14},(_,i)=><mesh key={i} position={[Math.sin(i*4)*.16,.263,-.15+(i%7)*.09]} rotation={[-Math.PI/2,0,0]}><ringGeometry args={[.012,.023,7]}/><meshStandardMaterial color={palette.wheel}/></mesh>)}</>}
 </group>;
}