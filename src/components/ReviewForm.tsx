import {useState} from 'react';
import {Link} from '@tanstack/react-router';
import {useServerFn} from '@tanstack/react-start';
import {Button} from '@/components/ui/button';
import {ExplorerNavigation} from '@/components/ExplorerNavigation';
import {MadeInAzerbaijan} from '@/components/MadeInAzerbaijan';
import {useLanguage} from '@/components/LanguageProvider';
import {reviewSchema} from '@/lib/reviews/schema';
import {submitReview} from '@/lib/reviews/reviews.functions';

const fields=[
 {id:'first_name',label:'First name',max:60},
 {id:'last_name',label:'Last name',max:60},
 {id:'country',label:'Country',max:80},
 {id:'age',label:'Age',type:'number'},
 {id:'work_or_education',label:'Place of work or education',max:150},
] as const;

export function ReviewForm(){
 const {t}=useLanguage();
 const send=useServerFn(submitReview);
 const [state,setState]=useState<'idle'|'sending'|'done'|'error'>('idle');
 const [error,setError]=useState('');
 return <div className="tracker-page review-page">
  <header className="tracker-header"><div style={{display:'flex',alignItems:'center'}}><Link to="/" className="tracker-brand">Synergy Labs</Link><MadeInAzerbaijan/></div><ExplorerNavigation page="review"/></header>
  <main className="review-main">
   <h1>{t("Write a review")}</h1>
   <p>{t("Tell us what you think of Synergy Labs. All fields are required.")}</p>
   {state==='done'?<div className="review-done" role="status"><h2>{t("Thank you for your review!")}</h2><Button asChild variant="map"><Link to="/">{t("Back to the map")}</Link></Button></div>:
   <form className="review-form" onSubmit={async e=>{e.preventDefault();const raw=Object.fromEntries(new FormData(e.currentTarget));const parsed=reviewSchema.safeParse(raw);if(!parsed.success){setError(t("Please fill in every field correctly."));return;}setError('');setState('sending');try{const r=await send({data:parsed.data});setState(r.ok?'done':'error');}catch{setState('error');}}}>
    <div className="review-grid">{fields.map(f=><label key={f.id}><span>{t(f.label)}</span><input name={f.id} required type={'type' in f?f.type:'text'} min={'type' in f?5:undefined} max={'type' in f?120:undefined} maxLength={'max' in f?f.max:undefined}/></label>)}</div>
    <label><span>{t("What do you like about the site?")}</span><textarea name="likes" required maxLength={2000} rows={4}/></label>
    <label><span>{t("What can we improve?")}</span><textarea name="improvements" required maxLength={2000} rows={4}/></label>
    {error&&<p className="review-error" role="alert">{error}</p>}
    {state==='error'&&<p className="review-error" role="alert">{t("Your review couldn't be sent. Please try again.")}</p>}
    <Button type="submit" variant="map" disabled={state==='sending'}>{state==='sending'?t("Sending…"):t("Send review")}</Button>
   </form>}
  </main>
 </div>;
}
