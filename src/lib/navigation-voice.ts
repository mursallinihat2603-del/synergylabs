import type {Language} from './i18n';
export function navigationVoice<T extends {lang:string}>(voices:readonly T[],language:Language):T|undefined{
 return voices.find(voice=>voice.lang.toLowerCase().replace('_','-').split('-')[0]===language);
}
export const speechLocales={en:'en-US',ru:'ru-RU',az:'az-AZ'} as const;
export const unavailableVoice={en:'An English voice is not installed on this device. Written directions remain available.',ru:'На устройстве нет русского голоса. Текстовые указания доступны.',az:'Bu cihazda Azərbaycan dili səsi quraşdırılmayıb. Yazılı göstərişlər mövcuddur.'} as const;