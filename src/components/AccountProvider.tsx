import {createContext,useContext,useEffect,useState,type ReactNode} from 'react';
import type {User} from '@supabase/supabase-js';
import {useQueryClient} from '@tanstack/react-query';
import {useRouter} from '@tanstack/react-router';
import {supabase} from '@/integrations/supabase/client';
const AccountContext=createContext<{user:User|null;ready:boolean}>({user:null,ready:false});
export const useAccount=()=>useContext(AccountContext);
export function AccountProvider({children}:{children:ReactNode}){
 const [user,setUser]=useState<User|null>(null),[ready,setReady]=useState(false);
 const router=useRouter(),queryClient=useQueryClient();
 useEffect(()=>{
  let alive=true;
  const {data:{subscription}}=supabase.auth.onAuthStateChange((event,session)=>{
   if(event==='INITIAL_SESSION'||event==='SIGNED_IN'||event==='SIGNED_OUT'||event==='USER_UPDATED'){
    setUser(session?.user??null);setReady(true);
    if(event!=='INITIAL_SESSION'){void router.invalidate();if(event!=='SIGNED_OUT')void queryClient.invalidateQueries();}
   }
  });
  void supabase.auth.getUser().then(({data})=>{if(alive){setUser(data.user);setReady(true);}});
  return()=>{alive=false;subscription.unsubscribe();};
 },[router,queryClient]);
 return <AccountContext.Provider value={{user,ready}}>{children}</AccountContext.Provider>;
}