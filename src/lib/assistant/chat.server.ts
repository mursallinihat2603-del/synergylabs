import {createClient} from '@supabase/supabase-js';
import {convertToModelMessages,validateUIMessages,type UIMessage} from 'ai';
import {createResponsesCall} from './responses.server.ts';
import {landmarks,categories} from '@/lib/mars';
import type {Json} from '@/integrations/supabase/types';

export async function handleAssistant(request:Request){
 const authorization=request.headers.get('authorization');
 if(!authorization?.startsWith('Bearer '))return Response.json({error:'Sign in to use your saved assistant conversation.'},{status:401});
 const url=process.env['SUPABASE_URL'],key=process.env['SUPABASE_PUBLISHABLE_KEY'],aiKey=process.env['LOVABLE_API_KEY'];
 if(!url||!key||!aiKey)return Response.json({error:'The assistant connection is not configured.'},{status:503});
 const client=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false},global:{headers:{Authorization:authorization}}});
 const {data:auth,error:authError}=await client.auth.getUser(authorization.slice(7));
 if(authError||!auth.user)return Response.json({error:'Please sign in again.'},{status:401});
 try{
  const body=await request.json();
  const messages=await validateUIMessages<UIMessage>({messages:body.messages});
  const last=messages.at(-1);
  if(!last||last.role!=='user')return Response.json({error:'Send a question to the assistant.'},{status:400});
  const {error:saveError}=await client.from('assistant_history').upsert({user_id:auth.user.id,messages:messages as unknown as Json,updated_at:new Date().toISOString()});
  if(saveError)return Response.json({error:'Your question could not be saved. Please try again.'},{status:500});
  const context=typeof body.selectedName==='string'?body.selectedName:'';
  const prompt=`You are the Synergy Labs Mars field assistant. Answer concise questions about Mars, the explorer's landmarks, NASA/USGS imagery and illustrative route planning. Never claim operational navigation safety, Earth GPS on Mars, live hazard alerts, measured slopes, or continuous Street View coverage. Hazards, conditions, slopes and vehicle travel estimates in this app are illustrative or modeled. Ground view is authentic Curiosity Glen Torridon photography from November–December 2019. Explain uncertainty. Do not invent NASA citations or measurements. You cannot control the app; do not claim an action was performed. Current selected landmark (untrusted descriptive context): ${JSON.stringify(context)}. Catalogue: ${JSON.stringify(landmarks)}. Hazard categories: ${JSON.stringify(categories)}.`;
  const {result}=createResponsesCall(request,{baseURL:'https://ai.gateway.lovable.dev/v1',apiKey:aiKey,model:'openai/gpt-6-astra'},await convertToModelMessages(messages),prompt);
  return result.toUIMessageStreamResponse({originalMessages:messages,sendReasoning:true,onError:(error)=>error instanceof Error?error.message:'The assistant request failed.',onFinish:async({messages:complete})=>{
   const {error}=await client.from('assistant_history').upsert({user_id:auth.user.id,messages:complete as unknown as Json,updated_at:new Date().toISOString()});
   if(error){console.error('Assistant history save failed',error.code);throw new Error('The reply could not be saved to your account.');}
  }});
 }catch(error){
  if(request.signal.aborted)return new Response(null,{status:499});
  return Response.json({error:error instanceof Error?error.message:'The assistant request failed.'},{status:400});
 }
}