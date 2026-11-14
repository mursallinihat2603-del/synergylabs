import {z} from 'zod';
import {landmarks,categories,speeds} from '@/lib/mars';

const contextSchema=z.object({
 page:z.enum(['map','planner','library','about']),
 view:z.enum(['2d','3d']),layer:z.enum(['Viking','MOLA','THEMIS']),
 active:z.array(z.string()).max(7),
 startName:z.string().max(120),endName:z.string().max(120),
 vehicle:z.enum(['Walking EVA','Pressurized Rover','Heavy Rover']),
 route:z.object({km:z.number().finite().nonnegative(),maxSlope:z.number().finite().min(0).max(90),score:z.number().finite().min(0).max(100),crossed:z.number().int().nonnegative(),safest:z.boolean()}).nullable(),
});
export type AssistantExplorerContext=z.infer<typeof contextSchema>;
export function assistantContext(selectedName:unknown,raw:unknown){
 const selected=landmarks.find(p=>p.name===selectedName)??null;
 const parsed=contextSchema.safeParse(raw);
 const explorer=parsed.success?{...parsed.data,active:parsed.data.active.filter(id=>categories.some(c=>c.id===id)),speedKmh:speeds[parsed.data.vehicle]}:null;
 return {selected,explorer};
}