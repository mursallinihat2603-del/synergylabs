import {lazy,Suspense,useState} from 'react';
import {ClientOnly} from '@tanstack/react-router';
import {useSuspenseQuery,queryOptions} from '@tanstack/react-query';
import {getRoverStatus} from '@/lib/tracker/rovers.functions';
import {ExplorerNavigation} from '@/components/ExplorerNavigation';
import {useLanguage} from '@/components/LanguageProvider';
import {Button} from '@/components/ui/button';
import {RefreshCw,LocateFixed} from 'lucide-react';
const TrackerMap=lazy(()=>import('@/components/TrackerMap'));
export const roverStatusQuery=queryOptions({queryKey:['rover-status'],queryFn:()=>getRoverStatus(),staleTime:5*60_000,refetchInterval:10*60_000});
export function MissionTracker(){
 const {t}=useLanguage();const q=useSuspenseQuery(roverStatusQuery);const [focus,setFocus]=useState<string|null>(null);
 const {rovers,fetchedAt}=q.data;
 return <div className="tracker-page">
  <header className="tracker-header"><a href="/" className="tracker-brand">Synergy Labs</a><ExplorerNavigation page="tracker"/></header>
  <main className="tracker-layout">
   <section className="tracker-panel">
    <h1>{t('Live Mars Mission Tracker')}</h1>
    <p className="tracker-muted">{t('Latest positions from NASA/JPL rover waypoint feeds. NASA updates these after drives are processed, usually every few days.')}</p>
    {rovers.map(r=><article key={r.id} className="tracker-card">
     <div className="tracker-card-head"><h2>{r.name}</h2><span className={`source-badge ${r.live?'source-nasa':'source-illustrative'}`}>{r.live?t('Active · live NASA data'):t('Feed unavailable')}</span></div>
     <p className="tracker-muted">{r.mission} · {r.site}</p>
     <dl className="tracker-stats">
      <div><dt>{t('Latest sol')}</dt><dd>{r.live?r.sol:'—'}</dd></div>
      <div><dt>{t('Last drive')}</dt><dd>{r.live?`${r.lastDriveM.toFixed(1)} m`:'—'}</dd></div>
      <div><dt>{t('Total driven')}</dt><dd>{r.live?`${r.totalKm.toFixed(2)} km`:'—'}</dd></div>
      <div><dt>{t('Position')}</dt><dd>{Math.abs(r.lat).toFixed(4)}°{r.lat<0?'S':'N'} {Math.abs(r.lng).toFixed(4)}°E</dd></div>
      {r.elevation!==null&&<div><dt>{t('Elevation')}</dt><dd>{r.elevation.toLocaleString()} m</dd></div>}
     </dl>
     {r.note&&<p className="tracker-note">{t('Latest update')}: {r.note}</p>}
     <div className="tracker-actions"><Button size="sm" variant="secondary" onClick={()=>setFocus(r.id)}><LocateFixed/>{t('Show on map')}</Button><a href={r.source} target="_blank" rel="noreferrer" className="tracker-muted">{t('Source')}</a></div>
    </article>)}
    <div className="tracker-actions"><Button size="sm" variant="outline" disabled={q.isFetching} onClick={()=>void q.refetch()}><RefreshCw/>{t('Refresh')}</Button><span className="tracker-muted">{t('Checked')} {new Date(fetchedAt).toLocaleString()}</span></div>
   </section>
   <section className="tracker-map-wrap"><ClientOnly fallback={<div className="tracker-map"/>}><Suspense fallback={<div className="tracker-map"/>}><TrackerMap rovers={rovers} focus={focus}/></Suspense></ClientOnly></section>
  </main>
 </div>;
}
