// "Volume" is a common strength-training metric: how much total weight was
// moved. It's a simple way to see whether a session or exercise is trending
// up over time, even when reps and weight vary week to week.

export interface VolumeSet {
  reps: number;
  weight: number;
}

export function exerciseVolume(sets: VolumeSet[]): number {
  return sets.reduce((total, set) => total + set.reps * set.weight, 0);
}

export function sessionVolume(exercises: { sets: VolumeSet[] }[]): number {
  return exercises.reduce(
    (total, exercise) => total + exerciseVolume(exercise.sets),
    0
  );
}
