import {useLanguage} from '@/components/LanguageProvider';
import {useEffect,useMemo,useRef,useState} from 'react';
import {Navigation,Volume2,VolumeX,Play,Pause,Square,SkipForward,ArrowUp,CornerUpLeft,CornerUpRight,ArrowUpLeft,ArrowUpRight,Undo2,Car} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {navigationSteps,spokenInstruction,maneuverPhrase} from '@/lib/navigation';
import type {Coordinate} from '@/lib/mars';
import {navigationVoice,speechLocales,unavailableVoice} from '@/lib/navigation-voice';
import {azerbaijaniDirectionAudio} from '@/lib/azerbaijani-navigation-audio';

export function NavigationGuide({points,speed,destination,onPosition}:{points:Coordinate[];speed:number;destination:string;onPosition:(p:Coordinate|null)=>void}){
 const {t,language}=useLanguage();
 const audio=useRef<HTMLAudioElement|null>(null);
 const stopSpeech=()=>{audio.current?.pause();audio.current=null;if('speechSynthesis' in window)window.speechSynthesis.cancel();};
 const steps=useMemo(()=>navigationSteps(points),[points]);const [index,setIndex]=useState(0),[started,setStarted]=useState(false),[paused,setPaused]=useState(false),[muted,setMuted]=useState(false),[voiceAvailable,setVoiceAvailable]=useState(false),[error,setError]=useState('');
 const step=steps[index],arrived=index>=steps.length;const remaining=steps.slice(index).reduce((sum,s)=>sum+s.km,0);
 const instruction=spokenInstruction(steps,index,destination,language);const [auto,setAuto]=useState(false);
 useEffect(()=>{
  if(language==='az'){setVoiceAvailable(true);return()=>stopSpeech();}
  if(!('speechSynthesis' in window)){setVoiceAvailable(false);return;}
  const speech=window.speechSynthesis;
  const update=()=>setVoiceAvailable(!!navigationVoice(speech.getVoices(),language));
  update();speech.addEventListener('voiceschanged',update);
  return()=>{stopSpeech();speech.removeEventListener('voiceschanged',update);};
 },[language]);
 useEffect(()=>{setIndex(0);setStarted(false);setPaused(false);onPosition(null);},[points]);
 const speak=(text:string)=>{if(muted)return;stopSpeech();if(language==='az'){const clip=new Audio(azerbaijaniDirectionAudio(arrived?'arrived':index===0?'straight':step?.maneuver??'straight'));audio.current=clip;void clip.play().catch(()=>setError('Your device could not play spoken guidance.'));return;}if(!('speechSynthesis' in window))return;const voice=navigationVoice(window.speechSynthesis.getVoices(),language);if(!voice)return;const utterance=new SpeechSynthesisUtterance(text);utterance.voice=voice;utterance.lang=speechLocales[language];utterance.rate=0.95;utterance.onerror=e=>{if(e.error!=='interrupted'&&e.error!=='canceled')setError('Your device could not play spoken guidance.');};window.speechSynthesis.speak(utterance);};
 useEffect(()=>{if(!started||paused)return;onPosition(step?.point??points.at(-1)??null);speak(instruction);},[index,started,paused,language,voiceAvailable]);
 useEffect(()=>{if(!started||paused||!auto||arrived)return;const t=window.setTimeout(()=>setIndex(i=>Math.min(steps.length,i+1)),7000);return()=>window.clearTimeout(t);},[index,started,paused,auto,arrived,steps.length]);
 if(!started)return <div className="navigation-start"><Button onClick={()=>{setIndex(0);setStarted(true);setPaused(false);}}><Navigation/> {t("Start navigation")}</Button><small>{t("Simulated trip · not live GPS")}</small></div>;
 const m=index===0?'straight':step?.maneuver;const Icon=arrived?Navigation:m==='u-turn'?Undo2:m==='slight left'?ArrowUpLeft:m==='slight right'?ArrowUpRight:m?.includes('left')?CornerUpLeft:m?.includes('right')?CornerUpRight:ArrowUp;
 const next=steps[index+1];
 const action=arrived?t('Destination reached'):paused?t('Trip paused'):t(maneuverPhrase(m??'straight'));
 return <section className="navigation-guide" aria-label={t('Trip navigation')}>
  <div className="direction-banner" aria-live="polite"><Icon/><div><span className="direction-distance">{arrived?t('Destination reached'):step?`${step.km.toFixed(1)} ${t('km')}`:''}</span><h3>{action}</h3><small>{t(destination)}</small></div><span className="direction-simulation">{t('SIMULATION')}</span></div>
  {next&&!arrived&&<div className="next-direction"><ArrowUp/><span>{t('Next waypoint')} · {t(maneuverPhrase(next.maneuver))}</span></div>}
  <p className="turn-detail">{instruction}</p>
  <div className="trip-summary"><div><b>{Math.round(remaining/speed*60).toLocaleString()} <small>{language==='ru'?'мин':language==='az'?'dəq':'min'}</small></b><span>{remaining.toFixed(1)} {t('km')} · {t(destination)}</span></div><Button variant="outline" size="icon" title={t('End navigation')} aria-label={t('End navigation')} onClick={()=>{setStarted(false);onPosition(null);stopSpeech();}}><Square/></Button></div>
  <progress aria-label={t('Trip progress')} max={Math.max(1,steps.length)} value={index}/>
  <div className="navigation-actions"><Button variant="map" size="icon" title={muted?t('Unmute guidance'):t('Mute guidance')} disabled={!voiceAvailable} onClick={()=>{setMuted(!muted);stopSpeech();}}>{muted?<VolumeX/>:<Volume2/>}</Button><Button variant="map" size="icon" title={t('Repeat direction')} disabled={!voiceAvailable||muted} onClick={()=>speak(instruction)}><Volume2/></Button><Button variant="map" size="icon" title={paused?t('Resume trip'):t('Pause trip')} disabled={arrived} onClick={()=>{setPaused(!paused);stopSpeech();}}>{paused?<Play/>:<Pause/>}</Button><Button variant={auto?'layerActive':'map'} title={auto?t('Stop auto drive'):t('Auto drive')} aria-pressed={auto} disabled={arrived} onClick={()=>setAuto(!auto)}><Car/>{t('Auto')}</Button><Button variant="map" title={t('Advance to next waypoint')} disabled={arrived||paused} onClick={()=>setIndex(i=>Math.min(steps.length,i+1))}><SkipForward/>{t('Next waypoint')}</Button></div>
  {!voiceAvailable&&<p role="status">{unavailableVoice[language]}</p>}{error&&<p className="error-text">{t(error)}</p>}<small>{t('Manual waypoint simulation · sample hazards · not mission guidance')}</small>
 </section>;
}
