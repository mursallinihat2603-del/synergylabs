import {useCallback,useEffect,useRef,useState} from 'react';
import {Volume2,VolumeX} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Popover,PopoverTrigger,PopoverContent} from '@/components/ui/popover';
import {Slider} from '@/components/ui/slider';
import {Switch} from '@/components/ui/switch';
import {useLanguage} from '@/components/LanguageProvider';
import {navigationVoice,speechLocales,unavailableVoice} from '@/lib/navigation-voice';
import {azerbaijaniDirectionAudio} from '@/lib/azerbaijani-navigation-audio';

export default function RoverVoiceSettings({arrived}:{arrived:boolean}) {
 const {language,t}=useLanguage();
 const [enabled,setEnabled]=useState(false),[volume,setVolume]=useState(80),[available,setAvailable]=useState(false),[error,setError]=useState('');
 const audio=useRef<HTMLAudioElement|null>(null),lastArrival=useRef(false);
 const label=(en:string,ru:string,az:string)=>language==='ru'?ru:language==='az'?az:en;
 const stop=useCallback(()=>{audio.current?.pause();audio.current=null;window.speechSynthesis?.cancel();},[]);
 const arrival=label('You have arrived at your destination','Вы прибыли в пункт назначения','Təyinat yerinə çatdınız');
 const speak=useCallback(()=>{
  stop();setError('');if(!enabled||volume===0)return;
  if(language==='az'){
   const clip=new Audio(azerbaijaniDirectionAudio('arrived'));clip.volume=volume/100;audio.current=clip;
   void clip.play().catch(()=>setError(t('Your device could not play spoken guidance.')));return;
  }
  const voice=navigationVoice(window.speechSynthesis?.getVoices()??[],language);if(!voice)return;
  const utterance=new SpeechSynthesisUtterance(arrival);utterance.lang=speechLocales[language];utterance.voice=voice;utterance.volume=volume/100;utterance.rate=.95;
  utterance.onerror=e=>{if(e.error!=='canceled'&&e.error!=='interrupted')setError(t('Your device could not play spoken guidance.'));};
  window.speechSynthesis.speak(utterance);
 },[enabled,volume,language,arrival,stop,t]);
 useEffect(()=>{
  const update=()=>setAvailable(language==='az'||!!navigationVoice(window.speechSynthesis?.getVoices()??[],language));
  update();window.speechSynthesis?.addEventListener('voiceschanged',update);
  return()=>{stop();window.speechSynthesis?.removeEventListener('voiceschanged',update);};
 },[language,stop]);
 useEffect(()=>{if(arrived&&!lastArrival.current)speak();lastArrival.current=arrived;},[arrived,speak]);
 useEffect(()=>{if(!enabled||volume===0)stop();},[enabled,volume,stop]);
 return <Popover><PopoverTrigger asChild><Button variant="map" size="icon" aria-label={label('Voice settings','Настройки голоса','Səs parametrləri')} title={label('Voice settings','Настройки голоса','Səs parametrləri')}>{enabled&&volume>0?<Volume2/>:<VolumeX/>}</Button></PopoverTrigger>
  <PopoverContent className="z-[90] max-w-[calc(100vw-24px)] space-y-4" align="start" onEscapeKeyDown={e=>{e.stopPropagation();}}>
   <h2 className="text-base">{label('Voice settings','Настройки голоса','Səs parametrləri')}</h2>
   <div className="flex items-center justify-between gap-3"><label htmlFor="rover-voice-enabled">{label('Spoken arrival','Озвучивать прибытие','Səsli çatma bildirişi')}</label><Switch id="rover-voice-enabled" checked={enabled} onCheckedChange={setEnabled}/></div>
   <div className="flex justify-between text-muted-foreground"><span>{label('Volume','Громкость','Səs səviyyəsi')}</span><span>{volume}%</span></div>
   <Slider aria-label={label('Volume','Громкость','Səs səviyyəsi')} min={0} max={100} step={5} value={[volume]} onValueChange={v=>setVolume(v[0]??80)}/>
   <div className="flex justify-between items-center"><span className="text-muted-foreground">{language==='az'?'Azərbaycan dili':language==='ru'?'Русский':'English'}</span><Button variant="outline" disabled={!enabled||volume===0||!available} onClick={speak}><Volume2/>{label('Test voice','Проверить голос','Səsi yoxla')}</Button></div>
   {!available&&<p role="status" className="text-xs">{unavailableVoice[language]}</p>}
   {error&&<p role="alert" className="text-xs text-destructive">{error}</p>}
  </PopoverContent></Popover>;
}