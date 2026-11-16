import {createServerFn} from '@tanstack/react-start';
import {createClient} from '@supabase/supabase-js';
import type {Database} from '@/integrations/supabase/types';
import {reviewSchema} from './schema';

export const submitReview=createServerFn({method:'POST'})
 .inputValidator((input:unknown)=>reviewSchema.parse(input))
 .handler(async({data})=>{
  const key=process.env['SUPABASE_PUBLISHABLE_KEY']!;
  const sb=createClient<Database>(process.env['SUPABASE_URL']!,key,{auth:{persistSession:false,autoRefreshToken:false},global:{fetch:(i,init)=>{const h=new Headers(init?.headers);if(key.startsWith('sb_')&&h.get('Authorization')===`Bearer ${key}`)h.delete('Authorization');h.set('apikey',key);return fetch(i,{...init,headers:h});}}});
  const {error}=await sb.from('site_reviews').insert(data);
  if(error){console.error('review insert failed',error);return {ok:false as const};}
  return {ok:true as const};
 });
