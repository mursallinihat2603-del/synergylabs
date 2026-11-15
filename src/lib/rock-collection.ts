export const ROCK_COLLECTION_KEY = 'synergy-rock-collection-v1';
export const ROCK_IDS = ['jake', 'adirondack', 'cheyava'] as const;
export type RockId = typeof ROCK_IDS[number];
export function readRockCollection(raw: string | null): RockId[] {
  try {
    const value: unknown = JSON.parse(raw ?? '[]');
    if (!Array.isArray(value)) return [];
    return ROCK_IDS.filter(id => value.includes(id));
  } catch { return []; }
}
export function collectRock(collection: readonly RockId[], id: RockId): RockId[] {
  return Array.from(new Set([...collection, id]));
}
// Positions are exhibit placements on simulated terrain, not Mars coordinates.
export const ROCK_PLACEMENTS: {id: RockId; x: number; z: number}[] = [
  {id:'jake', x:2, z:-5}, {id:'adirondack', x:-4, z:-18}, {id:'cheyava', x:3, z:-32},
];
export function nearbyRock(position: {x:number;z:number}): RockId | undefined {
  return ROCK_PLACEMENTS.find(rock => Math.hypot(position.x-rock.x, position.z-rock.z) <= 7)?.id;
}