import {useLanguage} from '@/components/LanguageProvider';

export function AzerbaijanFlag({className='az-flag'}:{className?:string}){
 return <svg className={className} viewBox="0 0 24 16" aria-hidden="true" focusable="false">
  <rect width="24" height="16" fill="#00B5E2"/>
  <rect y="5.33" width="24" height="5.34" fill="#EF3340"/>
  <rect y="10.67" width="24" height="5.33" fill="#509E2F"/>
  <circle cx="10.5" cy="8" r="2.15" fill="#fff"/>
  <circle cx="11.45" cy="8" r="1.8" fill="#EF3340"/>
  <g fill="#fff"><rect x="13.3" y="6.9" width="2.2" height="2.2"/><rect x="13.3" y="6.9" width="2.2" height="2.2" transform="rotate(45 14.4 8)"/></g>
 </svg>;
}

export function MadeInAzerbaijan(){
 const {t}=useLanguage();
 return <span className="made-in-az" title={t("Made in Azerbaijan")}><AzerbaijanFlag/><span className="made-in-az-label">{t("Made in Azerbaijan")}</span></span>;
}
