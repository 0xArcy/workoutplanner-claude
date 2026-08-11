"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Input, Label } from "@/components/ui/Input";
import { dailyTotals } from "@/lib/dietTotals";
import type { FoodEntry } from "@/types";

interface DietSummaryCardProps {
  entries: FoodEntry[];
  bodyWeight: number | null;
  unit: string;
  onBodyWeightChange: (value: number) => void;
}

export function DietSummaryCard({
  entries,
  bodyWeight,
  unit,
  onBodyWeightChange,
}: DietSummaryCardProps) {
  const totals = dailyTotals(entries);
  const [weightInput, setWeightInput] = useState(bodyWeight !== null ? String(bodyWeight) : "");

  useEffect(() => {
    setWeightInput(bodyWeight !== null ? String(bodyWeight) : "");
  }, [bodyWeight]);

  function handleBlur() {
    const value = Number(weightInput);
    if (weightInput !== "" && !Number.isNaN(value) && value !== bodyWeight) {
      onBodyWeightChange(value);
    }
  }

  return (
    <Card>
      <CardContent className="grid gap-5 sm:grid-cols-[1fr_auto]">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Calories" value={totals.calories} suffix="kcal" />
          <Stat label="Protein" value={totals.protein} suffix="g" />
          <Stat label="Carbs" value={totals.carbs} suffix="g" />
          <Stat label="Fat" value={totals.fat} suffix="g" />
        </div>
        <div>
          <Label htmlFor="body-weight">Body weight ({unit})</Label>
          <Input
            id="body-weight"
            type="number"
            step="0.1"
            min={0}
            value={weightInput}
            onChange={(e) => setWeightInput(e.target.value)}
            onBlur={handleBlur}
            className="sm:w-32"
          />
        </div>
      </CardContent>
    </Card>
  );
}

function Stat({ label, value, suffix }: { label: string; value: number; suffix: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold">
        {Math.round(value * 10) / 10}
        <span className="ml-1 text-xs font-normal text-muted-foreground">{suffix}</span>
      </p>
    </div>
  );
}
