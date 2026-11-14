import {createServerFn} from '@tanstack/react-start';
import {requireSupabaseAuth} from '@/integrations/supabase/auth-middleware';
export const getAssistantHistory=createServerFn({method:'GET'}).middleware([requireSupabaseAuth]).handler(async({context})=>{
 const {data,error}=await context.supabase.from('assistant_history').select('messages').eq('user_id',context.userId).maybeSingle();
 if(error)throw new Error('Saved assistant history could not be loaded.');
 return data?.messages??[];
});
export const saveAssistantHistory=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator((d:{messages:unknown[]})=>{if(!Array.isArray(d?.messages)||d.messages.length>500)throw new Error('Invalid history');return d;}).handler(async({data,context})=>{
 const {error}=await context.supabase.from('assistant_history').upsert({user_id:context.userId,messages:data.messages as never,updated_at:new Date().toISOString()});
 if(error)throw new Error('Assistant history could not be updated.');
 return {ok:true};
});
