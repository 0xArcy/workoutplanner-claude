import { Trash2 } from "lucide-react";
import type { FoodEntry } from "@/types";

interface FoodEntryListProps {
  entries: FoodEntry[];
  onDelete: (id: string) => void;
}

export function FoodEntryList({ entries, onDelete }: FoodEntryListProps) {
  if (entries.length === 0) {
    return <p className="text-sm text-muted-foreground">No food logged for this day yet.</p>;
  }

  return (
    <ul className="divide-y divide-border">
      {entries.map((entry) => (
        <li key={entry.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
          <div>
            <p className="font-medium">{entry.name}</p>
            <p className="text-xs text-muted-foreground">
              {entry.calories} kcal
              {entry.protein != null ? ` · ${entry.protein}g protein` : ""}
              {entry.carbs != null ? ` · ${entry.carbs}g carbs` : ""}
              {entry.fat != null ? ` · ${entry.fat}g fat` : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onDelete(entry.id)}
            aria-label="Delete entry"
            className="rounded-md p-2.5 text-muted-foreground transition-colors hover:bg-muted hover:text-destructive"
          >
            <Trash2 size={16} />
          </button>
        </li>
      ))}
    </ul>
  );
}
