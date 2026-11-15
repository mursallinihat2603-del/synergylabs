import {useLanguage} from '@/components/LanguageProvider';
import {useState} from 'react';
import {Layers,Shield,Check,Mountain,Wind,Waves,Circle,Radiation,Snowflake,Orbit,X} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Popover,PopoverContent,PopoverTrigger} from '@/components/ui/popover';
import {categories} from '@/lib/mars';
import {SourceBadge} from '@/components/SourceBadge';
import {hazardProvenance} from '@/lib/data-provenance';

const icons=[Mountain,Wind,Waves,Circle,Radiation,Snowflake,Orbit];
export function MapTools({layer,onLayer,active,onActive,compare,onCompare,swipe,onSwipe}:{layer:string;onLayer:(s:string)=>void;active:string[];onActive:(s:string[])=>void;compare:boolean;onCompare:(s:boolean)=>void;swipe:number;onSwipe:(s:number)=>void}){
 const {t}=useLanguage();
 const [open,setOpen]=useState<'layers'|'hazards'|null>(null);
 return <div className="map-tools">
  <Popover open={open==='layers'} onOpenChange={v=>setOpen(v?'layers':null)}><PopoverTrigger asChild><Button variant="map" aria-label={t("Map layers")}><Layers/><span>{t("Layers")}</span></Button></PopoverTrigger><PopoverContent className="map-settings" side="top" align="start" sideOffset={8}><div className="panel-heading"><Layers/>{t("Map layers")}<Button variant="ghost" size="icon" aria-label={t("Close map layers")} onClick={()=>setOpen(null)}><X/></Button></div>{([['Viking','Viking color mosaic'],['MOLA','MOLA elevation'],['THEMIS','THEMIS day IR']] as const).map(([id,name])=><Button key={id} className="layer-option" variant={layer===id?'layerActive':'layer'} aria-pressed={layer===id} onClick={()=>onLayer(id)}><span className={`layer-thumb layer-${id.toLowerCase()}`}/><span className="layer-option-copy">{t(name)}<SourceBadge source="scientific"/></span>{layer===id&&<Check/>}</Button>)}<label className="compare-row">{t("Compare layers")}<input type="checkbox" checked={compare} onChange={e=>onCompare(e.target.checked)}/></label>{compare&&<input aria-label={t("Layer comparison slider")} type="range" min={0} max={100} value={swipe} onChange={e=>onSwipe(Number(e.target.value))}/>}</PopoverContent></Popover>
  <Popover open={open==='hazards'} onOpenChange={v=>setOpen(v?'hazards':null)}><PopoverTrigger asChild><Button variant="map" aria-label={t("Hazard overlays")}><Shield/><span>{t("Hazards")}</span><span className="tool-count">{active.length}</span></Button></PopoverTrigger><PopoverContent className="map-settings" side="top" align="start" sideOffset={8}><div className="panel-heading"><Shield/>{t("Hazard overlays")}<Button variant="ghost" size="icon" aria-label={t("Close hazard overlays")} onClick={()=>setOpen(null)}><X/></Button></div>{categories.map((c,i)=>{const Icon=icons[i]??Mountain;return <label key={c.id} className={`hazard-row hazard-${c.id}`}><Icon/><span>{t(c.name)}<small>{t(c.detail)}</small><SourceBadge source={hazardProvenance(c.id)}/></span><input type="checkbox" checked={active.includes(c.id)} onChange={()=>onActive(active.includes(c.id)?active.filter(v=>v!==c.id):[...active,c.id])}/></label>;})}<p className="sample-label">{t("Sample zones · not live alerts")}</p></PopoverContent></Popover>
 </div>;
}