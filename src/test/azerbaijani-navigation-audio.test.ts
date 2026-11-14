import {it,expect} from 'vitest';
import {azerbaijaniDirectionAudio} from '@/lib/azerbaijani-navigation-audio';
it('uses Azerbaijani recordings for left, right, straight and arrival',()=>{
 expect(azerbaijaniDirectionAudio('left')).toContain('/az-left.mp3');
 expect(azerbaijaniDirectionAudio('right')).toContain('/az-right.mp3');
 expect(azerbaijaniDirectionAudio('straight')).toContain('/az-straight.mp3');
 expect(azerbaijaniDirectionAudio('arrived')).toContain('/az-arrived.mp3');
});