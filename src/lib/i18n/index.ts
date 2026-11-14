import {translations} from './translations';
export type Language='en'|'ru'|'az';
export const languages:readonly Language[]=['en','ru','az'];
export function isLanguage(value:unknown):value is Language{return languages.some(language=>language===value);}
export function translate(text:string,language:Language):string{
 if(language==='en')return text;
 const direct=translations[text]?.[language==='ru'?0:1];
 if(direct)return direct;
 const landing=text.match(/^Landing site · (\d{4})$/);
 if(landing)return `${translate('Landing site',language)} · ${landing[1]}`;
 const size=text.match(/^([\d,]+) km (long|wide)$/);
 if(size)return language==='ru'?`${size[1]} км ${size[2]==='long'?'в длину':'в ширину'}`:`${size[1]} km ${size[2]==='long'?'uzunluq':'en'}`;
 return text;
}