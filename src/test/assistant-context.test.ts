import {describe,it,expect} from 'vitest';
import {assistantContext} from '@/lib/assistant/context';

const explorer={page:'planner',view:'2d',layer:'Viking',active:['slopes','invented'],startName:'Jezero Crater',endName:'Perseverance',vehicle:'Pressurized Rover',route:{km:8.1,maxSlope:3,score:97,crossed:0,safest:true}};
describe('Assistant grounding',()=>{
 it('resolves Jezero from the real catalogue rather than trusting supplied facts',()=>{
  const result=assistantContext('Jezero Crater',explorer);
  expect(result.selected?.id).toBe('jezero');
  expect(result.explorer?.speedKmh).toBe(12);
  expect(result.explorer?.route?.km).toBe(8.1);
 });
 it('filters unknown hazard categories',()=>expect(assistantContext('Jezero Crater',explorer).explorer?.active).toEqual(['slopes']));
 it('does not accept invalid route measurements',()=>expect(assistantContext('Jezero Crater',{...explorer,route:{...explorer.route,km:-1}}).explorer).toBeNull());
 it('does not pretend an unknown place is in the catalogue',()=>expect(assistantContext('Not a real catalogue entry',explorer).selected).toBeNull());
});