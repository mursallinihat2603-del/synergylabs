import {distance,type Coordinate} from './mars';
import {translate,type Language} from './i18n';
export function bearing(a:Coordinate,b:Coordinate){const r=Math.PI/180,d=(b.lng-a.lng)*r;return (Math.atan2(Math.sin(d)*Math.cos(b.lat*r),Math.cos(a.lat*r)*Math.sin(b.lat*r)-Math.sin(a.lat*r)*Math.cos(b.lat*r)*Math.cos(d))*180/Math.PI+360)%360;}
export function navigationSteps(points:Coordinate[]){
 const last=points.at(-1);if(!last)return [];
 const stride=Math.max(1,Math.ceil((points.length-1)/8));const reduced=points.filter((_,i)=>i%stride===0);if(reduced.at(-1)!==last)reduced.push(last);
 return reduced.slice(0,-1).map((p,i)=>{const next=reduced[i+1]??last;const heading=bearing(p,next);const direction=['north','northeast','east','southeast','south','southwest','west','northwest'][Math.round(heading/45)%8]??'north';const previous=reduced[i-1];const turn=previous?((heading-bearing(previous,p)+540)%360)-180:0;return {point:p,next,km:distance(p,next),heading,direction,turn:Math.abs(turn)<25?'straight':turn>0?'right':'left',angle:turn,maneuver:maneuver(turn)};});
}
export type Maneuver='straight'|'slight left'|'slight right'|'left'|'right'|'sharp left'|'sharp right'|'u-turn';
export function maneuver(angle:number):Maneuver{const a=Math.abs(angle),side=angle>0?'right':'left';if(a<20)return 'straight';if(a<45)return `slight ${side}`;if(a<135)return side;if(a<165)return `sharp ${side}`;return 'u-turn';}
export function maneuverPhrase(m:Maneuver){return m==='straight'?'continue straight':m==='u-turn'?'make a U-turn':`turn ${m}`;}
function dist(km:number){return km<1?`${Math.round(km*1000/50)*50} meters`:`${km<10?km.toFixed(1):Math.round(km)} kilometers`;}
export function spokenInstruction(steps:ReturnType<typeof navigationSteps>,index:number,destination:string,language:Language='en'){
 if(language!=='en'){
  const step=steps[index],name=translate(destination,language);
  if(!step)return language==='ru'?`Вы прибыли: ${name}.`:`${name} təyinatına çatdınız.`;
  const phrase=translate(index===0?'continue straight':maneuverPhrase(step.maneuver),language),direction=translate(step.direction,language);
  const now=language==='ru'?`${phrase}, двигайтесь ${direction}.`:`${phrase}, ${direction} hərəkət edin.`;
  const distance=step.km<1?`${Math.round(step.km*1000/50)*50} ${language==='ru'?'метров':'metr'}`:`${step.km<10?step.km.toFixed(1):Math.round(step.km)} ${language==='ru'?'километров':'kilometr'}`;
  const next=steps[index+1];
  return now+' '+(next?(language==='ru'?`Через ${distance}, ${translate(maneuverPhrase(next.maneuver),language)}.`:`${distance} sonra ${translate(maneuverPhrase(next.maneuver),language)}.`):(language==='ru'?`Через ${distance} впереди будет ${name}.`:`${distance} sonra ${name} qarşınızda olacaq.`));
 }
 const step=steps[index];if(!step)return `You have arrived at ${destination}.`;
 const now=index===0?`Head ${step.direction}`:step.maneuver==='straight'?`Continue straight ${step.direction}`:`${maneuverPhrase(step.maneuver).replace(/^./,c=>c.toUpperCase())} now, heading ${step.direction}`;
 const next=steps[index+1];const then=next?`In ${dist(step.km)}, ${maneuverPhrase(next.maneuver)}.`:`In ${dist(step.km)}, your destination ${destination} will be ahead.`;
 return `${now}. ${then}`;
}
