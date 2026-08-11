"use client";

import { useState, type FormEvent } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import type { FoodEntryInput } from "@/types";

interface FoodEntryFormProps {
  onSubmit: (entry: FoodEntryInput) => Promise<void>;
}

export function FoodEntryForm({ onSubmit }: FoodEntryFormProps) {
  const [name, setName] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (!name.trim() || calories === "") {
      setError("Give the food a name and a calorie count.");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        calories: Number(calories),
        protein: protein === "" ? undefined : Number(protein),
        carbs: carbs === "" ? undefined : Number(carbs),
        fat: fat === "" ? undefined : Number(fat),
      });
      setName("");
      setCalories("");
      setProtein("");
      setCarbs("");
      setFat("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <Label htmlFor="food-name">Food</Label>
        <Input
          id="food-name"
          placeholder="e.g. Chicken breast"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div>
          <Label htmlFor="food-calories">Calories</Label>
          <Input
            id="food-calories"
            type="number"
            min={0}
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="food-protein">Protein (g)</Label>
          <Input
            id="food-protein"
            type="number"
            min={0}
            value={protein}
            onChange={(e) => setProtein(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="food-carbs">Carbs (g)</Label>
          <Input
            id="food-carbs"
            type="number"
            min={0}
            value={carbs}
            onChange={(e) => setCarbs(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="food-fat">Fat (g)</Label>
          <Input
            id="food-fat"
            type="number"
            min={0}
            value={fat}
            onChange={(e) => setFat(e.target.value)}
          />
        </div>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={submitting}>
        <Plus size={16} />
        {submitting ? "Adding..." : "Add food"}
      </Button>
    </form>
  );
}
