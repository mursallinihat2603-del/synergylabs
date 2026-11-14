import {describe,it,expect} from 'vitest';
import {isLanguage,languages} from '@/lib/i18n';
describe('Language choices',()=>{
 it('supports English, Russian and Azerbaijani',()=>expect(languages).toEqual(['en','ru','az']));
 it('accepts persisted supported choices',()=>{expect(isLanguage('ru')).toBe(true);expect(isLanguage('az')).toBe(true);expect(isLanguage('en')).toBe(true);});
 it('rejects unsupported persisted choices',()=>expect(isLanguage('fr')).toBe(false));
});