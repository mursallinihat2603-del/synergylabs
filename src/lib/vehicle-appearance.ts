export function vehicleAppearance(vehicle: string): 'eva' | 'pressurized' | 'heavy' {
  if (vehicle === 'Walking EVA') return 'eva';
  if (vehicle === 'Heavy Rover') return 'heavy';
  return 'pressurized';
}