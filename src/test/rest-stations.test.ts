import {it,expect} from 'vitest';
import {ARROW_KEYS,nearStation,REST_STATIONS} from '@/lib/rest-stations';
it('arrow keys steer like WASD',()=>expect([ARROW_KEYS['ArrowLeft'],ARROW_KEYS['ArrowRight'],ARROW_KEYS['ArrowUp'],ARROW_KEYS['ArrowDown']]).toEqual(['KeyA','KeyD','KeyW','KeyS']));
it('standing at a station door allows entry',()=>{const s=REST_STATIONS[0];expect(nearStation(s.x,s.z+4)?.id).toBe('alpha');});
it('far away cannot enter',()=>expect(nearStation(0,0)).toBeNull());
