import {createServerFn} from '@tanstack/react-start';
import {reviewSchema} from './schema';

// Reviews are validated here and inserted server-side only; the table has no public write access.
export const submitReview=createServerFn({method:'POST'})
 .inputValidator((input:unknown)=>reviewSchema.parse(input))
 .handler(async({data})=>{
  const {supabaseAdmin}=await import('@/integrations/supabase/client.server');
  const {error}=await supabaseAdmin.from('site_reviews').insert(data);
  if(error){console.error('review insert failed',error);return {ok:false as const};}
  return {ok:true as const};
 });
