export const VEHICLE_HANDLING={acceleration:2.4,braking:4.5,grip:5,turnRate:1.4};
export const GLOBE_SENSITIVITY={rotation:.9,closeRotation:.07,zoom:1.15};
export function vehicleMass(vehicle:string){return vehicle==='Walking EVA'?120:vehicle==='Heavy Rover'?450:300;}
export function driveVelocityChange(current:number,target:number,seconds:number){
 const limit=(target===0?VEHICLE_HANDLING.braking:VEHICLE_HANDLING.acceleration)*Math.min(seconds,.05);
 return Math.max(-limit,Math.min(limit,target-current));
}
export function steeringRate(steer:number,speed:number){return steer*VEHICLE_HANDLING.turnRate*Math.min(1,Math.abs(speed)/.8)*Math.sign(speed);}