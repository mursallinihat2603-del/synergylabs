import {useLanguage} from '@/components/LanguageProvider';
import {useEffect,useRef,useState} from 'react';
import type OpenSeadragon from 'openseadragon';
import {ArrowLeft,Plus,Minus,LocateFixed,Maximize,ExternalLink} from 'lucide-react';
import {Button} from '@/components/ui/button';
import section0 from '@/assets/glen-detail-0.asset.json';
import section1 from '@/assets/glen-detail-1.asset.json';
import section2 from '@/assets/glen-detail-2.asset.json';
import section3 from '@/assets/glen-detail-3.asset.json';
import section4 from '@/assets/glen-detail-4.asset.json';
import section5 from '@/assets/glen-detail-5.asset.json';
import section6 from '@/assets/glen-detail-6.asset.json';
import section7 from '@/assets/glen-detail-7.asset.json';
import section8 from '@/assets/glen-detail-8.asset.json';
import section9 from '@/assets/glen-detail-9.asset.json';
import preview from '@/assets/glen-torridon-preview.asset.json';
const sections=[section0,section1,section2,section3,section4,section5,section6,section7,section8,section9];

export default function RoverPanorama({onClose}:{onClose:()=>void}){
 const {t,language}=useLanguage();
 const host=useRef<HTMLDivElement>(null),viewer=useRef<OpenSeadragon.Viewer|null>(null),shell=useRef<HTMLDivElement>(null);
 const [status,setStatus]=useState('Loading rover panorama…');
 const [failed,setFailed]=useState(false);
 useEffect(()=>{
  let alive=true;
  void import('openseadragon').then(({default:OSD})=>{
   if(!alive||!host.current)return;
   const previewSource={type:'image',url:preview.url,buildPyramid:false};
   const v=OSD({element:host.current,showNavigationControl:false,showNavigator:false,maxZoomPixelRatio:2,visibilityRatio:0.7,constrainDuringPan:true,animationTime:0.3,gestureSettingsTouch:{pinchToZoom:true},tileSources:previewSource});
   viewer.current=v;
   v.addOnceHandler('open',()=>{
    if(!alive)return;
    setStatus('Loading 20,000-pixel detail…');
    let loaded=0;
    sections.forEach((section,i)=>v.addTiledImage({tileSource:{type:'image',url:section.url,buildPyramid:false},x:i/10,y:0,width:0.1,success:()=>{if(!alive)return;loaded++;if(loaded===sections.length){setStatus('20,000 × 5,171 pixels · Original NASA photography');v.viewport.goHome(true);host.current?.setAttribute('data-detail-ready','true');}},error:()=>{if(alive){setStatus('Some detail unavailable · preview remains visible');setFailed(true);}}}));
   });
   v.addHandler('open-failed',()=>{if(alive){setStatus('Panorama could not load. Please try again.');setFailed(true);}});
  });
  const escape=(e:KeyboardEvent)=>{if(e.key==='Escape'&&!document.fullscreenElement)onClose();};
  document.addEventListener('keydown',escape);
  return()=>{alive=false;viewer.current?.destroy();viewer.current=null;document.removeEventListener('keydown',escape);};
 },[onClose]);
 const zoom=(factor:number)=>{viewer.current?.viewport.zoomBy(factor);viewer.current?.viewport.applyConstraints();};
 return <div className="rover-panorama" ref={shell} role="dialog" aria-modal="true" aria-label={t("Mars street view")}>
  <header className="panorama-header"><Button variant="map" onClick={onClose}><ArrowLeft/>{t("Back to map")}</Button><div><h1>Glen Torridon</h1><span>{t("Gale Crater · Curiosity Mastcam · November–December 2019")}</span></div></header>
  <div className="panorama-canvas" ref={host} aria-label={t("Detailed NASA rover panorama")}/>
  <div className="panorama-tools"><Button variant="map" size="icon" title={t("Zoom in")} onClick={()=>zoom(1.5)}><Plus/></Button><Button variant="map" size="icon" title={t("Zoom out")} onClick={()=>zoom(1/1.5)}><Minus/></Button><Button variant="map" title={t("Recenter panorama")} onClick={()=>viewer.current?.viewport.goHome()}><LocateFixed/>{t("Recenter")}</Button><Button variant="map" size="icon" title={t("Fullscreen")} onClick={()=>{if(document.fullscreenElement)void document.exitFullscreen();else void shell.current?.requestFullscreen().catch(()=>setStatus('Fullscreen is unavailable on this device.'));}}><Maximize/></Button></div>
  <footer className="panorama-footer"><div><span className={failed?'error-text':''} role="status">{status}</span><small>{t("NASA/JPL-Caltech/MSSS · Photographed rover location only; no continuous street coverage.")}</small></div><Button variant="ghost" asChild><a href="https://science.nasa.gov/photojournal/curiositys-18-billion-pixel-panorama/" target="_blank" rel="noreferrer">{t("NASA source")}<ExternalLink/></a></Button></footer>
 </div>;
}