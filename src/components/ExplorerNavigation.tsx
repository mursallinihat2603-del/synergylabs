import {useLanguage} from '@/components/LanguageProvider';
import {Link} from '@tanstack/react-router';
import {Map,Route,BookOpen,Info,Satellite,PenLine} from 'lucide-react';
import {Button} from '@/components/ui/button';

export function ExplorerNavigation({page}:{page:string}) {
 const {t}=useLanguage();
 return <nav className="explorer-nav" aria-label={t("Main navigation")}>{[
  {to:'/' as const,name:'Explore',icon:Map,id:'map'},
  {to:'/planner' as const,name:'Route planner',icon:Route,id:'planner'},
  {to:'/tracker' as const,name:'Rover tracker',icon:Satellite,id:'tracker'},
  {to:'/library' as const,name:'Field guide',icon:BookOpen,id:'library'},
  {to:'/about' as const,name:'About',icon:Info,id:'about'},
  {to:'/review' as const,name:'Write a review',icon:PenLine,id:'review'},
 ].map(item=><Button key={item.id} asChild variant="nav"><Link to={item.to} aria-current={page===item.id?'page':undefined} className={page===item.id?'nav-active':''}><item.icon/><span>{t(item.name)}</span></Link></Button>)}</nav>;
}