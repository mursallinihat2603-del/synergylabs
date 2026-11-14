import {Languages,Check} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Popover,PopoverContent,PopoverTrigger} from '@/components/ui/popover';
import {useLanguage} from './LanguageProvider';
import {useState} from 'react';
const choices=[{id:'en',name:'English'},{id:'ru',name:'Русский'},{id:'az',name:'Azərbaycan dili'}] as const;
export function LanguageSwitcher(){
 const {language,setLanguage,t}=useLanguage();const [open,setOpen]=useState(false);
 return <Popover open={open} onOpenChange={setOpen}><PopoverTrigger asChild><Button variant="map" className="language-trigger" aria-label={t('Language')} title={t('Language')}><Languages/><span>{language.toUpperCase()}</span></Button></PopoverTrigger><PopoverContent align="end" className="language-menu"><div className="panel-heading"><Languages/>{t('Language')}</div>{choices.map(choice=><Button key={choice.id} variant={language===choice.id?'layerActive':'layer'} lang={choice.id} aria-pressed={language===choice.id} onClick={()=>{setLanguage(choice.id);setOpen(false);}}>{choice.name}{language===choice.id&&<Check/>}</Button>)}</PopoverContent></Popover>;
}