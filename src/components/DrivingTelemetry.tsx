import {useEffect,useState,type RefObject} from 'react';
import {Battery,ShieldCheck,Waves,Mountain,Wrench,Flag} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {useLanguage} from '@/components/LanguageProvider';
import RoverVoiceSettings from '@/components/RoverVoiceSettings';
import {freshDriveCondition,type DriveCondition} from '@/lib/rover-challenges';
export type DriveTelemetry={condition:DriveCondition;sand:boolean;slope:number;speed:number;arrived?:boolean};
export default function DrivingTelemetry({telemetry,repair,onRepair}:{telemetry:RefObject<DriveTelemetry>;repair:boolean;onRepair:()=>void}) {
 const {language}=useLanguage(),[reading,setReading]=useState<DriveTelemetry>({condition:freshDriveCondition(),sand:false,slope:0,speed:0});
 const label=(en:string,ru:string,az:string)=>language==='ru'?ru:language==='az'?az:en;
 useEffect(()=>{const interval=setInterval(()=>setReading({...telemetry.current,condition:{...telemetry.current.condition}}),250);return()=>clearInterval(interval);},[telemetry]);
 return <section className="driving-telemetry" aria-label={label('Simulated vehicle status','Состояние транспорта · симуляция','Simulyasiya nəqliyyat vəziyyəti')}>
  {reading.arrived&&<div role="status" className="flex basis-full items-center gap-2 border-b border-border pb-2 text-sm font-semibold text-foreground"><Flag className="text-primary"/>{label('You have arrived at your destination','Вы прибыли в пункт назначения','Təyinat yerinə çatdınız')}</div>}
  <span title={label('Battery','Батарея','Batareya')}><Battery/><b>{Math.ceil(reading.condition.battery)}%</b></span>
  <span title={label('Vehicle integrity','Состояние корпуса','Nəqliyyat bütövlüyü')}><ShieldCheck/><b>{Math.round(reading.condition.integrity)}%</b></span>
  <span><Mountain/>{Math.round(reading.slope)}°</span>
  <span className={reading.sand?'driving-warning':''}><Waves/>{reading.sand?label('Soft sand','Рыхлый песок','Yumşaq qum'):label('Firm ground','Твёрдый грунт','Bərk torpaq')}</span>
  <span>{Math.abs(reading.speed).toFixed(1)} m/s</span>
  <RoverVoiceSettings arrived={!!reading.arrived}/>
  <Button variant={repair?'layerActive':'map'} size="icon" aria-pressed={repair} aria-label={label('Repair vehicle','Ремонт транспорта','Nəqliyyatı təmir et')} title={label('Repair vehicle','Ремонт транспорта','Nəqliyyatı təmir et')} onClick={onRepair}><Wrench/></Button>
  {repair&&<small>{label('Stationary repairs','Ремонт на месте','Dayanarkən təmir')}</small>}
  {reading.condition.battery<=0?<small className="driving-warning">{label('Battery empty · vehicle stopped','Батарея разряжена · транспорт остановлен','Batareya bitib · nəqliyyat dayandırılıb')}</small>:reading.condition.battery<15&&<small className="driving-warning">{label('Low battery · stop to recharge','Низкий заряд · остановитесь для зарядки','Batareya azdır · doldurmaq üçün dayanın')}</small>}
 </section>;
}