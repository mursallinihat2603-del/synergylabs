import {useLanguage} from '@/components/LanguageProvider';
import {provenanceLabels,type DataProvenance} from '@/lib/data-provenance';
export function SourceBadge({source}:{source:DataProvenance}){
 const {t}=useLanguage();
 return <span className={`source-badge source-${source}`}>{t(provenanceLabels[source])}</span>;
}