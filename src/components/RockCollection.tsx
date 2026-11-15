import {Suspense,useEffect,useState,type RefObject} from 'react';
import {Canvas} from '@react-three/fiber';
import {OrbitControls} from '@react-three/drei';
import {Gem,ScanSearch,Check,ExternalLink,X} from 'lucide-react';
import {Dialog,DialogPortal,DialogOverlay,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import {Button} from '@/components/ui/button';
import {useLanguage} from '@/components/LanguageProvider';
import {MARS_ROCKS,type MarsRock} from '@/data/mars-rocks';
import {ROCK_COLLECTION_KEY,readRockCollection,collectRock,nearbyRock,type RockId} from '@/lib/rock-collection';
import type {VehiclePalette} from '@/components/VehicleAppearance';
import MarsRockReplica from '@/components/MarsRockReplica';

export default function RockCollection({position,palette,onInspect}:{position:RefObject<{x:number;z:number}>;palette:VehiclePalette|null;onInspect:(open:boolean)=>void}) {
 const {language}=useLanguage();const label=(en:string,ru:string,az:string)=>language==='ru'?ru:language==='az'?az:en;
 const [collection,setCollection]=useState<RockId[]>([]),[near,setNear]=useState<RockId|undefined>(),[open,setOpen]=useState(false),[selected,setSelected]=useState<MarsRock|undefined>();
 useEffect(()=>{try{setCollection(readRockCollection(localStorage.getItem(ROCK_COLLECTION_KEY)));}catch{/* Collection works for this session. */}},[]);
 useEffect(()=>{const timer=setInterval(()=>setNear(nearbyRock(position.current)),250);return()=>clearInterval(timer);},[position]);
 const changeOpen=(next:boolean)=>{setOpen(next);onInspect(next);};
 const inspect=(rock:MarsRock)=>{setSelected(rock);changeOpen(true);};
 const nearby=MARS_ROCKS.find(r=>r.id===near);
 const save=(id:RockId)=>{const next=collectRock(collection,id);setCollection(next);try{localStorage.setItem(ROCK_COLLECTION_KEY,JSON.stringify(next));}catch{/* Session-only on restricted devices. */}};
 return <><div className="rock-tools">
 {nearby&&<Button variant="map" onClick={()=>inspect(nearby)}><ScanSearch/>{label('Inspect','Осмотреть','Baxış')} · {nearby.name}</Button>}
 <Button variant="map" aria-label={label('Rock collection','Коллекция камней','Qaya kolleksiyası')} onClick={()=>{setSelected(undefined);changeOpen(true);}}><Gem/>{collection.length}/{MARS_ROCKS.length}</Button>
 </div><Dialog open={open} onOpenChange={changeOpen}><DialogPortal><DialogOverlay className="rock-overlay"/><DialogPrimitive.Content className="rock-dialog" onEscapeKeyDown={e=>e.stopPropagation()}>
 <div className="rock-dialog-heading"><DialogTitle>{selected?.name??label('Rock collection','Коллекция камней','Qaya kolleksiyası')}</DialogTitle><Button variant="ghost" size="icon" aria-label={label('Close inspection','Закрыть осмотр','Baxışı bağla')} onClick={()=>changeOpen(false)}><X/></Button></div>
 <DialogDescription>{label('Photo-based replicas · not exact scans. Exhibit locations and scale are simulated. Collection stays on this device.','Реплики по фотографиям · не точные сканы. Расположение и масштаб условны. Коллекция сохраняется на этом устройстве.','Foto əsasında replikalar · dəqiq skanlar deyil. Yer və miqyas simulyasiyadır. Kolleksiya bu cihazda saxlanılır.')}</DialogDescription>
 {selected?<><div className="rock-inspection-media"><figure><div className="rock-preview">{palette&&<Canvas camera={{position:[2,1.7,2.5],fov:45}} dpr={[1,1.5]}><color attach="background" args={[palette.sky]}/><ambientLight intensity={2}/><directionalLight position={[3,5,4]} intensity={3}/><Suspense fallback={null}><group position={[0,-.3,0]}><MarsRockReplica id={selected.id} palette={palette}/></group></Suspense><OrbitControls target={[0,.15,0]} enablePan={false} minDistance={1.5} maxDistance={6}/></Canvas>}</div><figcaption>{label('3D replica','3D-реплика','3D replika')}</figcaption></figure><figure><img src={selected.image} alt={selected.name+' · NASA'} /><figcaption>{label('NASA reference photo','Эталонное фото NASA','NASA istinad fotosu')} · {selected.credit}</figcaption></figure></div>
 <div className="rock-facts"><small>{selected.mission} · {selected.site}</small><p>{selected.form[language]}</p><p>{selected.facts[language]}</p></div>
 <div className="rock-footer"><Button variant="map" onClick={()=>setSelected(undefined)}><Gem/>{label('Collection','Коллекция','Kolleksiya')}</Button><a href={selected.source} target="_blank" rel="noreferrer">NASA <ExternalLink size={14}/></a><Button disabled={collection.includes(selected.id)||near!==selected.id} onClick={()=>save(selected.id)}>{collection.includes(selected.id)?<Check/>:<Gem/>}{collection.includes(selected.id)?label('Collected','Собрано','Toplanıb'):label('Collect replica','Собрать реплику','Replikanı topla')}</Button></div></>
 :<div className="rock-collection-list">{MARS_ROCKS.map(rock=><article key={rock.id}><img src={rock.image} alt={rock.name}/><div><h3>{rock.name}</h3><small>{rock.mission} · {rock.site}</small><p>{rock.form[language]}</p><Button variant="map" disabled={!collection.includes(rock.id)&&near!==rock.id} onClick={()=>setSelected(rock)}>{collection.includes(rock.id)?<Check/>:<ScanSearch/>}{collection.includes(rock.id)?label('Inspect','Осмотреть','Baxış'):near===rock.id?label('Nearby','Рядом','Yaxınlıqda'):label('Not collected','Не собрано','Toplanmayıb')}</Button></div></article>)}</div>}
 </DialogPrimitive.Content></DialogPortal></Dialog></>;
}