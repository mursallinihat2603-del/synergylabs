import {describe,it,expect} from 'vitest';
import {translate} from '@/lib/i18n';
describe('Made in Azerbaijan credit',()=>{
 it('shows the Russian credit text',()=>expect(translate('Made in Azerbaijan','ru')).toBe('Сделано в Азербайджане'));
 it('shows the Azerbaijani credit text',()=>expect(translate('Made in Azerbaijan','az')).toBe('Azərbaycanda hazırlanıb'));
 it('keeps the English credit unchanged',()=>expect(translate('Made in Azerbaijan','en')).toBe('Made in Azerbaijan'));
});
