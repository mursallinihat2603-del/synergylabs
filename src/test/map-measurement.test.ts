import {describe,it,expect} from 'vitest';
import {measureLine} from '@/lib/map-measurement';

describe('drawn Mars line measurements',()=>{
 it('uses the Mars surface distance',()=>{const r=measureLine([{lat:0,lng:0},{lat:0,lng:90}],()=>100);expect(r.km).toBeCloseTo(5324.21,1);expect(r.elevationChange).toBe(0);expect(r.steepestSlope).toBe(0);});
 it('measures net elevation change and sampled steepest slope',()=>{const r=measureLine([{lat:0,lng:0},{lat:0,lng:1}],p=>p.lng*1000);expect(r.elevationChange).toBeCloseTo(1000,6);expect(r.ascent).toBeCloseTo(1000,6);expect(r.descent).toBe(0);expect(r.steepestSlope).toBeCloseTo(Math.atan2(1000,59157.934995)*180/Math.PI,5);});
 it('sums ascent and descent along a multisegment line',()=>{const r=measureLine([{lat:0,lng:0},{lat:0,lng:1},{lat:0,lng:0}],p=>p.lng*100);expect(r.elevationChange).toBe(0);expect(r.ascent).toBeCloseTo(100,6);expect(r.descent).toBeCloseTo(100,6);});
 it('takes the short path across the longitude seam',()=>{const r=measureLine([{lat:0,lng:179},{lat:0,lng:-179}],()=>0);expect(r.km).toBeCloseTo(118.31587,4);});
 it('handles empty, single-point and repeated-point lines',()=>{for(const p of [[],[{lat:0,lng:0}],[{lat:0,lng:0},{lat:0,lng:0}]]){const r=measureLine(p);expect(r.km).toBe(0);expect(r.steepestSlope).toBe(0);expect(r.elevationChange).toBe(0);}});
});