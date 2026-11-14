import {useEffect,useRef,useState} from 'react';
import type OpenSeadragon from 'openseadragon';
import {ArrowLeft,Plus,Minus,LocateFixed,Maximize,ExternalLink} from 'lucide-react';
import {Button} from '@/components/ui/button';
import detail from '@/assets/glen-torridon-detail.asset.json';
import preview from '@/assets/glen-torridon-preview.asset.json';

export default function RoverPanorama({onClose}:{onClose:()=>void}){
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
    v.addTiledImage({tileSource:{type:'image',url:detail.url,buildPyramid:false},replace:true,index:0,success:()=>{if(!alive)return;setStatus('20,000 × 5,171 pixels · Original NASA photography');v.viewport.goHome(true);host.current?.setAttribute('data-detail-ready','true');},error:()=>{if(alive){setStatus('Full detail unavailable · preview shown');setFailed(true);}}});
   });
   v.addHandler('open-failed',()=>{if(alive){setStatus('Panorama could not load. Please try again.');setFailed(true);}});
  });
  const escape=(e:KeyboardEvent)=>{if(e.key==='Escape'&&!document.fullscreenElement)onClose();};
  document.addEventListener('keydown',escape);
  return()=>{alive=false;viewer.current?.destroy();viewer.current=null;document.removeEventListener('keydown',escape);};
 },[onClose]);
 const zoom=(factor:number)=>{viewer.current?.viewport.zoomBy(factor);viewer.current?.viewport.applyConstraints();};
 return <div className="rover-panorama" ref={shell} role="dialog" aria-modal="true" aria-label="Mars street view">
  <header className="panorama-header"><Button variant="map" onClick={onClose}><ArrowLeft/>Back to map</Button><div><h1>Glen Torridon</h1><span>Gale Crater · Curiosity Mastcam · November–December 2019</span></div></header>
  <div className="panorama-canvas" ref={host} aria-label="Detailed NASA rover panorama"/>
  <div className="panorama-tools"><Button variant="map" size="icon" title="Zoom in" onClick={()=>zoom(1.5)}><Plus/></Button><Button variant="map" size="icon" title="Zoom out" onClick={()=>zoom(1/1.5)}><Minus/></Button><Button variant="map" title="Recenter panorama" onClick={()=>viewer.current?.viewport.goHome()}><LocateFixed/>Recenter</Button><Button variant="map" size="icon" title="Fullscreen" onClick={()=>{if(document.fullscreenElement)void document.exitFullscreen();else void shell.current?.requestFullscreen().catch(()=>setStatus('Fullscreen is unavailable on this device.'));}}><Maximize/></Button></div>
  <footer className="panorama-footer"><div><span className={failed?'error-text':''} role="status">{status}</span><small>NASA/JPL-Caltech/MSSS · Photographed rover location only; no continuous street coverage.</small></div><Button variant="ghost" asChild><a href="https://science.nasa.gov/photojournal/curiositys-18-billion-pixel-panorama/" target="_blank" rel="noreferrer">NASA source<ExternalLink/></a></Button></footer>
 </div>;
}