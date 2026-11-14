import straight from '@/assets/az-straight.asset.json';
import slightLeft from '@/assets/az-slight-left.asset.json';
import slightRight from '@/assets/az-slight-right.asset.json';
import left from '@/assets/az-left.asset.json';
import right from '@/assets/az-right.asset.json';
import sharpLeft from '@/assets/az-sharp-left.asset.json';
import sharpRight from '@/assets/az-sharp-right.asset.json';
import uTurn from '@/assets/az-u-turn.asset.json';
import arrived from '@/assets/az-arrived.asset.json';
import type {Maneuver} from './navigation';
const clips:Record<Maneuver|'arrived',string>={straight:straight.url,'slight left':slightLeft.url,'slight right':slightRight.url,left:left.url,right:right.url,'sharp left':sharpLeft.url,'sharp right':sharpRight.url,'u-turn':uTurn.url,arrived:arrived.url};
export function azerbaijaniDirectionAudio(maneuver:Maneuver|'arrived'){return clips[maneuver];}