export interface DietEntryTotals {
  calories: number;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
}

export interface DailyTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export function dailyTotals(entries: DietEntryTotals[]): DailyTotals {
  return entries.reduce<DailyTotals>(
    (totals, entry) => ({
      calories: totals.calories + entry.calories,
      protein: totals.protein + (entry.protein ?? 0),
      carbs: totals.carbs + (entry.carbs ?? 0),
      fat: totals.fat + (entry.fat ?? 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
}
