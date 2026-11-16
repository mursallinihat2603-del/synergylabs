import {useRef,useState} from 'react';
import {stickKeys} from '@/lib/rover-driving';
export default function VirtualStick({keys,label}:{keys:React.RefObject<Set<string>>;label:string}){
 const base=useRef<HTMLDivElement>(null),[knob,setKnob]=useState({x:0,y:0});
 const apply=(x:number,y:number)=>{for(const k of ['KeyW','KeyA','KeyS','KeyD'])keys.current.delete(k);for(const k of stickKeys(x,y))keys.current.add(k);setKnob({x,y});};
 const move=(e:React.PointerEvent)=>{const r=base.current?.getBoundingClientRect();if(!r)return;const R=r.width/2;let x=(e.clientX-r.left-R)/R,y=(e.clientY-r.top-R)/R;const m=Math.hypot(x,y);if(m>1){x/=m;y/=m;}apply(x,y);};
 const end=()=>apply(0,0);
 return <div ref={base} className="virtual-stick" role="application" aria-label={label} onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);move(e);}} onPointerMove={e=>{if(e.currentTarget.hasPointerCapture(e.pointerId))move(e);}} onPointerUp={end} onPointerCancel={end}><span style={{transform:`translate(${knob.x*40}px,${knob.y*40}px)`}}/></div>;
}
