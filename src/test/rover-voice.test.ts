import {expect,it} from 'vitest';
import {ROVER_VOICE_DEFAULT_ENABLED} from '@/lib/rover-voice';
it('enables rover voice automatically without a settings click',()=>expect(ROVER_VOICE_DEFAULT_ENABLED).toBe(true));