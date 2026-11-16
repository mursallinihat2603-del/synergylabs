export type StationAction='stand'|'sit'|'eat'|'drink'|'sleep';
export type StationState={action:StationAction;food:number;drinks:number};
export const freshStation=():StationState=>({action:'stand',food:5,drinks:3});
/** Eating or drinking consumes one item from the table; nothing happens when it is empty. */
export function stationAct(s:StationState,action:StationAction):StationState{
 if(action==='eat')return s.food>0?{...s,action,food:s.food-1}:s;
 if(action==='drink')return s.drinks>0?{...s,action,drinks:s.drinks-1}:s;
 return {...s,action};
}
