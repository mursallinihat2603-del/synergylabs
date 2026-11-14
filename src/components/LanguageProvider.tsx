import {createContext,useCallback,useContext,useEffect,useState,type ReactNode} from 'react';
import {isLanguage,translate,type Language} from '@/lib/i18n';
type LanguageContextValue={language:Language;setLanguage:(language:Language)=>void;t:(text:string)=>string};
const LanguageContext=createContext<LanguageContextValue>({language:'en',setLanguage:()=>{},t:text=>text});
export function LanguageProvider({children}:{children:ReactNode}){
 const [language,setCurrent]=useState<Language>('en');
 useEffect(()=>{try{const stored=localStorage.getItem('synergy-language');if(isLanguage(stored))setCurrent(stored);}catch{/* Language remains available without storage. */}},[]);
 useEffect(()=>{document.documentElement.lang=language;},[language]);
 const setLanguage=useCallback((next:Language)=>{setCurrent(next);try{localStorage.setItem('synergy-language',next);}catch{/* Session-only preference. */}},[]);
 const t=useCallback((text:string)=>translate(text,language),[language]);
 return <LanguageContext.Provider value={{language,setLanguage,t}}>{children}</LanguageContext.Provider>;
}
export const useLanguage=()=>useContext(LanguageContext);