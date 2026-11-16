/** Illustrative weather cycle for the driving simulation (seconds). */
export const STORM_CYCLE={calm:75,warning:10,storm:35,damagePerSecond:1.2};
export type StormPhase='calm'|'warning'|'storm';
export function stormPhase(t:number):{phase:StormPhase;strength:number;remaining:number}{
 const {calm,warning,storm}=STORM_CYCLE,c=calm+warning+storm,x=((t%c)+c)%c;
 if(x<calm)return {phase:'calm',strength:0,remaining:calm-x};
 if(x<calm+warning)return {phase:'warning',strength:(x-calm)/warning*.3,remaining:calm+warning-x};
 const s=x-calm-warning;return {phase:'storm',strength:Math.min(1,.3+s/4,(storm-s)/4+.1),remaining:storm-s};
}
/** Seconds an unsheltered astronaut survives at full storm strength. */
export const EVA_STORM_SURVIVAL=15;
export function stepEvaHealth(health:number,dt:number,strength:number,sheltered:boolean){return sheltered?Math.min(100,health+dt*10):Math.max(0,health-dt*strength*100/EVA_STORM_SURVIVAL);}
