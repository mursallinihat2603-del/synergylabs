import {it,expect} from 'vitest';
import {stormPhase} from '@/lib/dust-storm';
it('starts calm',()=>expect(stormPhase(0).phase).toBe('calm'));
it('warns before the storm',()=>expect(stormPhase(80).phase).toBe('warning'));
it('storm arrives after 85 seconds',()=>expect(stormPhase(100).phase).toBe('storm'));
it('cycle repeats',()=>expect(stormPhase(120).phase).toBe('calm'));
import {stepEvaHealth} from '@/lib/dust-storm';
it('astronaut outside dies after 15s of full storm',()=>{let h=100;for(let i=0;i<30;i++)h=stepEvaHealth(h,.5,1,false);expect(h).toBe(0);});
it('habitat shelter keeps astronaut alive',()=>expect(stepEvaHealth(50,1,1,true)).toBe(60));
