import {createServerFn} from '@tanstack/react-start';
import {requireSupabaseAuth} from '@/integrations/supabase/auth-middleware';
export const getAssistantHistory=createServerFn({method:'GET'}).middleware([requireSupabaseAuth]).handler(async({context})=>{
 const {data,error}=await context.supabase.from('assistant_history').select('messages').eq('user_id',context.userId).maybeSingle();
 if(error)throw new Error('Saved assistant history could not be loaded.');
 return data?.messages??[];
});