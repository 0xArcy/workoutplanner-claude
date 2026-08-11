import { PRBadge } from "./PRBadge";
import type { LoggedSet } from "@/types";

interface SetRowProps {
  set: LoggedSet;
  unit: string;
}

export function SetRow({ set, unit }: SetRowProps) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border/60 py-2 text-sm last:border-0">
      <span className="text-muted-foreground">Set {set.setNumber}</span>
      <span className="font-medium">
        {set.reps} reps &times; {set.weight} {unit}
      </span>
      {set.isPR && <PRBadge />}
    </div>
  );
}
