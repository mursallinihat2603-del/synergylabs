import {it,expect} from 'vitest';
import {freshStation,stationAct} from '@/lib/station-actions';
it('eating takes one food item',()=>expect(stationAct(freshStation(),'eat').food).toBe(4));
it('drinking takes one drink',()=>expect(stationAct(freshStation(),'drink').drinks).toBe(2));
it('cannot eat when no food is left',()=>expect(stationAct({action:'sit',food:0,drinks:3},'eat').action).toBe('sit'));
it('sleeping keeps food',()=>{const s=stationAct(freshStation(),'sleep');expect([s.action,s.food]).toEqual(['sleep',5]);});
