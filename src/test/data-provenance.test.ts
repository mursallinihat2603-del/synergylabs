import {describe,it,expect} from 'vitest';
import {hazards} from '@/lib/mars';
import {hazardProvenance} from '@/lib/data-provenance';
describe('Hazard provenance',()=>{
 it('classifies every sample polygon as illustrative, never NASA observations',()=>{
  const zones=hazards.filter(h=>h.geometry.type==='Polygon');
  expect(zones).toHaveLength(6);
  for(const zone of zones)expect(hazardProvenance(zone.properties.category)).toBe('illustrative');
 });
 it('distinguishes the two approximate NASA historical events from sample zones',()=>{
  for(const id of ['purgatory','troy']){
   const event=hazards.find(h=>h.properties.id===id);
   expect(event?.geometry.type).toBe('Point');
   expect(hazardProvenance(event?.properties.category??'')).toBe('historic');
  }
 });
 it('does not certify unknown categories as scientific',()=>expect(hazardProvenance('unknown')).toBe('illustrative'));
});