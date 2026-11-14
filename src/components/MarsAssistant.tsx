import {useEffect,useMemo,useRef,useState} from 'react';
import {useChat} from '@ai-sdk/react';
import {DefaultChatTransport,type UIMessage} from 'ai';
import {useServerFn} from '@tanstack/react-start';
import {useQuery,useQueryClient} from '@tanstack/react-query';
import {X,LogOut,MessageCircle} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Conversation,ConversationContent,ConversationScrollButton} from '@/components/ai-elements/conversation';
import {Message,MessageContent,MessageResponse} from '@/components/ai-elements/message';
import {PromptInput,PromptInputTextarea,PromptInputFooter,PromptInputSubmit} from '@/components/ai-elements/prompt-input';
import {Reasoning,ReasoningTrigger,ReasoningContent} from '@/components/ai-elements/reasoning';
import {Shimmer} from '@/components/ai-elements/shimmer';
import {useAccount} from './AccountProvider';
import {supabase} from '@/integrations/supabase/client';
import {lovable} from '@/integrations/lovable';
import {getAssistantHistory} from '@/lib/assistant/history.functions';
import logo from '@/assets/synergy-logo-symbol.asset.json';

function Chat({userId,initial,selectedName}:{userId:string;initial:UIMessage[];selectedName:string}){
 const input=useRef<HTMLTextAreaElement>(null);
 const transport=useMemo(()=>new DefaultChatTransport({api:'/api/assistant',body:{selectedName},headers:async()=>{
  const {data}=await supabase.auth.getSession();return data.session?{Authorization:`Bearer ${data.session.access_token}`}:{Authorization:''};
 }}),[selectedName]);
 const {messages,sendMessage,status,stop,error}=useChat({id:userId,messages:initial,transport});
 const busy=status==='submitted'||status==='streaming';
 useEffect(()=>{if(!busy)input.current?.focus();},[busy]);
 return <><Conversation className="assistant-conversation"><ConversationContent>
 {!messages.length&&<div className="assistant-empty"><img src={logo.url} alt=""/><h2>Mars field assistant</h2></div>}
 {messages.map(message=><Message key={message.id} from={message.role}><MessageContent>{message.parts.map((part,i)=>part.type==='text'?<MessageResponse key={i}>{part.text}</MessageResponse>:part.type==='reasoning'?<Reasoning key={i} defaultOpen={false} isStreaming={part.state==='streaming'}><ReasoningTrigger/><ReasoningContent>{part.text}</ReasoningContent></Reasoning>:null)}</MessageContent></Message>)}
 {busy&&<Shimmer>Thinking…</Shimmer>}
 </ConversationContent><ConversationScrollButton/></Conversation>
 {error&&<p className="assistant-error" role="alert">{error.message}</p>}
 <div className="assistant-composer"><PromptInput onSubmit={async({text})=>{if(!text.trim()||busy)return;await sendMessage({text});input.current?.focus();}}><PromptInputTextarea ref={input} autoFocus aria-label="Ask the Mars assistant" placeholder="Ask about Mars…" disabled={busy}/><PromptInputFooter className="justify-end"><PromptInputSubmit aria-label={busy?'Stop reply':'Send message'} status={status} onStop={()=>stop()}/></PromptInputFooter></PromptInput></div></>;
}

export default function MarsAssistant({selectedName,onClose}:{selectedName:string;onClose:()=>void}){
 const {user,ready}=useAccount();const queryClient=useQueryClient();const load=useServerFn(getAssistantHistory);
 const [error,setError]=useState('');
 const history=useQuery({queryKey:['assistant-history',user?.id],queryFn:()=>load(),enabled:!!user,staleTime:0});
 const signIn=async(provider:'google'|'lovable')=>{setError('');try{const result=await lovable.auth.signInWithOAuth(provider,{redirect_uri:window.location.origin});if(result.error)setError(result.error.message);}catch(e){setError(e instanceof Error?e.message:'Sign-in failed.');}};
 const signOut=async()=>{await queryClient.cancelQueries();queryClient.clear();const {error}=await supabase.auth.signOut();if(error)setError(error.message);};
 return <aside className="assistant-panel" role="dialog" aria-label="Mars AI assistant"><header className="assistant-heading"><div><img src={logo.url} alt=""/><span>Mars assistant</span></div><div>{user&&<Button variant="ghost" size="icon" title="Sign out" onClick={signOut}><LogOut/></Button>}<Button variant="ghost" size="icon" title="Close assistant" onClick={onClose}><X/></Button></div></header>
 {!ready?<div className="assistant-empty"><Shimmer>Checking account…</Shimmer></div>:!user?<div className="assistant-login"><MessageCircle/><h2>Your Mars conversation</h2><p>Sign in to save your assistant history across devices.</p><Button onClick={()=>signIn('google')}>Continue with Google</Button><Button variant="outline" onClick={()=>signIn('lovable')}>Continue with Lovable</Button><small>AI replies use workspace credits.</small></div>:history.isPending?<div className="assistant-empty"><Shimmer>Loading saved conversation…</Shimmer></div>:history.error?<div className="assistant-empty"><p role="alert">{history.error.message}</p><Button onClick={()=>history.refetch()}>Try again</Button></div>:<Chat key={user.id} userId={user.id} initial={history.data as unknown as UIMessage[]} selectedName={selectedName}/>}
 {error&&<p className="assistant-error" role="alert">{error}</p>}
 </aside>;
}