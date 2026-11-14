import {describe,it,expect} from 'vitest';
import {navigationVoice,speechLocales} from '@/lib/navigation-voice';
describe('Navigation speech language',()=>{
 it('chooses an Azerbaijani voice even when English is first',()=>{expect(navigationVoice([{lang:'en-US'},{lang:'az-AZ'}],'az')).toEqual({lang:'az-AZ'});});
 it('never falls back to an English voice for Azerbaijani',()=>expect(navigationVoice([{lang:'en-US'},{lang:'ru-RU'}],'az')).toBeUndefined());
 it('sets Azerbaijani speech locale',()=>expect(speechLocales.az).toBe('az-AZ'));
 it('chooses Russian for Russian navigation',()=>expect(navigationVoice([{lang:'en-US'},{lang:'ru-RU'}],'ru')).toEqual({lang:'ru-RU'}));
});