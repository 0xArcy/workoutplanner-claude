// Personal-record detection.
//
// We estimate a "one rep max" (the heaviest weight you could theoretically
// lift once) from any reps x weight set using the Epley formula. That lets
// us compare sets with different rep counts on a level playing field, e.g.
// 100kg x 5 reps vs 90kg x 8 reps.
export function estimatedOneRepMax(weight: number, reps: number): number {
  return weight * (1 + reps / 30);
}

export interface SetInput {
  setNumber: number;
  reps: number;
  weight: number;
}

export interface SetWithPR extends SetInput {
  isPR: boolean;
}

// Walks through a list of sets (in the order they were performed) and flags
// each one as a PR if it beats the best estimated 1RM seen so far, starting
// from `priorBest` (the best estimated 1RM for this exercise before today).
export function markPersonalRecords(
  sets: SetInput[],
  priorBest: number
): SetWithPR[] {
  let best = priorBest;
  return sets.map((set) => {
    const oneRepMax = estimatedOneRepMax(set.weight, set.reps);
    const isPR = oneRepMax > best;
    if (isPR) best = oneRepMax;
    return { ...set, isPR };
  });
}
