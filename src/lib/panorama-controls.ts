export function panoramaDirection(keys:ReadonlySet<string>){
 const x=Number(keys.has('KeyD'))-Number(keys.has('KeyA'));
 const y=Number(keys.has('KeyS'))-Number(keys.has('KeyW'));
 const length=Math.hypot(x,y);
 return length?{x:x/length,y:y/length}:{x:0,y:0};
}
export function isPanoramaKey(code:string){return ['KeyW','KeyA','KeyS','KeyD'].includes(code);}