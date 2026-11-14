import {describe, expect, it} from 'vitest';
import {vehicleAppearance} from '@/lib/vehicle-appearance';

describe('selected vehicle appearance', () => {
  it('Walking EVA selects an astronaut, not a rover', () => {
    expect(vehicleAppearance('Walking EVA')).toBe('eva');
  });
  it('Pressurized Rover selects an enclosed cabin rover', () => {
    expect(vehicleAppearance('Pressurized Rover')).toBe('pressurized');
  });
  it('Heavy Rover selects a cargo rover', () => {
    expect(vehicleAppearance('Heavy Rover')).toBe('heavy');
  });
});