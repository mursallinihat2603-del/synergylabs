export type DataProvenance = 'scientific' | 'historic' | 'illustrative' | 'reported';
export const provenanceLabels: Record<DataProvenance, string> = {
 scientific: 'NASA / USGS data',
 historic: 'NASA history · approx.',
 illustrative: 'Illustrative',
 reported: 'User report · unverified',
};
export function hazardProvenance(category: string): DataProvenance {
 return category === 'historic' ? 'historic' : 'illustrative';
}