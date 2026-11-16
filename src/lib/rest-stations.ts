/** Illustrative fictional habitat rest stops in the simulated driving terrain. */
export const REST_STATIONS=[{id:'alpha',name:'Habitat Alpha',x:-14,z:-22},{id:'bravo',name:'Habitat Bravo',x:30,z:-90}] as const;
export const ARROW_KEYS:Record<string,string>={ArrowUp:'KeyW',ArrowDown:'KeyS',ArrowLeft:'KeyA',ArrowRight:'KeyD'};
export function nearStation(x:number,z:number,range=5){return REST_STATIONS.find(s=>Math.hypot(x-s.x,z-(s.z+4))<range)??null;}
