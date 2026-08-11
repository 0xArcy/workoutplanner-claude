// Shared types used by the frontend (components/hooks).
// These mirror prisma/schema.prisma but are plain TS types, so client
// components never need to import anything from the generated Prisma client.

export type Unit = "kg" | "lb";

export interface Profile {
  id: string;
  name: string;
  unit: Unit;
  goal: string | null;
}

export interface TemplateExercise {
  id: string;
  name: string;
  targetSets: number;
  targetReps: string;
  notes: string | null;
  order: number;
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  category: string | null;
  createdAt: string;
  exercises: TemplateExercise[];
}

export interface LoggedSet {
  id: string;
  setNumber: number;
  reps: number;
  weight: number;
  isPR: boolean;
}

export interface LoggedExercise {
  id: string;
  exerciseName: string;
  order: number;
  sets: LoggedSet[];
}

export interface WorkoutLog {
  id: string;
  date: string;
  templateId: string | null;
  templateName: string;
  exercises: LoggedExercise[];
}

export interface FoodEntry {
  id: string;
  name: string;
  calories: number;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  time: string | null;
}

export interface DailyDietLog {
  id: string;
  date: string;
  bodyWeight: number | null;
  entries: FoodEntry[];
}

// ---- Payloads used when creating/updating records from the frontend ----

export interface TemplateExerciseInput {
  name: string;
  targetSets: number;
  targetReps: string;
  notes?: string;
}

export interface TemplateInput {
  name: string;
  category?: string;
  exercises: TemplateExerciseInput[];
}

export interface LoggedSetInput {
  reps: number;
  weight: number;
}

export interface LoggedExerciseInput {
  exerciseName: string;
  sets: LoggedSetInput[];
}

export interface WorkoutLogInput {
  date: string;
  templateId?: string;
  templateName: string;
  exercises: LoggedExerciseInput[];
}

export interface FoodEntryInput {
  name: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  time?: string;
}

export interface DailyDietLogInput {
  date: string;
  bodyWeight?: number;
  entries: FoodEntryInput[];
}

export interface ProfileInput {
  name: string;
  unit: Unit;
  goal?: string;
}
