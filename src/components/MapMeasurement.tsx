import {useMemo} from 'react';
import {Ruler,Undo2,Trash2,Check,X} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {useLanguage} from '@/components/LanguageProvider';
import {SourceBadge} from '@/components/SourceBadge';
import {measureLine} from '@/lib/map-measurement';
import type {Coordinate} from '@/lib/mars';

export function MapMeasurement({points,drawing,onDrawing,onPoints,onClose}:{points:Coordinate[];drawing:boolean;onDrawing:(v:boolean)=>void;onPoints:(p:Coordinate[])=>void;onClose:()=>void}){
 const {t}=useLanguage();
 const result=useMemo(()=>measureLine(points),[points]);
 const heights=result.profile.map(p=>p.elevation),low=Math.min(...heights),high=Math.max(...heights);
 const chart=result.profile.map(p=>`${result.km?p.km/result.km*280:0},${high===low?26:48-(p.elevation-low)/(high-low)*44}`).join(' ');
 return <section className="measurement-panel" aria-label={t('Line measurement')}>
  <div className="panel-heading"><Ruler/>{t('Line measurement')}<Button variant="ghost" size="icon" aria-label={t('Close measurement')} title={t('Close measurement')} onClick={onClose}><X/></Button></div>
  <SourceBadge source="illustrative"/><small className="measurement-source">{t('Modeled terrain · not measured MOLA elevation')}</small>
  <dl className="measurement-stats" aria-live="polite">
   <div><dt>{t('Distance')}</dt><dd>{result.km.toFixed(2)} {t('km')}</dd></div>
   <div><dt>{t('Elevation change')}</dt><dd>{result.elevationChange>0?'+':''}{result.elevationChange.toFixed(0)} {t('m')}</dd></div>
   <div><dt>{t('Steepest slope')}</dt><dd>{result.steepestSlope.toFixed(2)}°</dd></div>
   <div><dt>{t('Ascent / descent')}</dt><dd>+{result.ascent.toFixed(0)} / −{result.descent.toFixed(0)} {t('m')}</dd></div>
  </dl>
  {points.length>1&&<svg className="measurement-profile" viewBox="0 0 280 52" preserveAspectRatio="none" role="img" aria-label={t('Modeled elevation profile')}><polyline points={chart}/></svg>}
  <div className="measurement-actions"><Button variant="map" size="icon" title={t('Undo point')} aria-label={t('Undo point')} disabled={!points.length} onClick={()=>onPoints(points.slice(0,-1))}><Undo2/></Button><Button variant="map" size="icon" title={t('Clear line')} aria-label={t('Clear line')} disabled={!points.length} onClick={()=>onPoints([])}><Trash2/></Button><Button variant={drawing?'layerActive':'map'} aria-pressed={drawing} onClick={()=>onDrawing(!drawing)}>{drawing?<Check/>:<Ruler/>}{t(drawing?'Finish line':'Extend line')}</Button></div>
 </section>;
}