import { prisma } from "@/lib/prisma";
import { estimatedOneRepMax, markPersonalRecords } from "@/lib/pr";
import type { LoggedExerciseInput } from "@/types";

// Turns the exercises/sets a user submitted into data ready for
// `prisma.workoutLog.create`/`update`, with `isPR` computed for every set.
//
// `excludeLogId` is used when editing an existing log, so its own
// (soon-to-be-replaced) sets aren't counted as "prior history" for
// themselves.
export async function buildLoggedExercisesWithPR(
  exercises: LoggedExerciseInput[],
  excludeLogId?: string
) {
  const result = [];

  for (const exercise of exercises) {
    const priorSets = await prisma.loggedSet.findMany({
      where: {
        loggedExercise: {
          exerciseName: exercise.exerciseName,
          ...(excludeLogId ? { logId: { not: excludeLogId } } : {}),
        },
      },
      select: { reps: true, weight: true },
    });

    const priorBest = priorSets.reduce(
      (best, set) => Math.max(best, estimatedOneRepMax(set.weight, set.reps)),
      0
    );

    const setsWithPR = markPersonalRecords(
      exercise.sets.map((set, index) => ({
        setNumber: index + 1,
        reps: set.reps,
        weight: set.weight,
      })),
      priorBest
    );

    result.push({ exerciseName: exercise.exerciseName, sets: setsWithPR });
  }

  return result;
}
