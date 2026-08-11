"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useProfile } from "@/hooks/useProfile";
import { Card, CardContent } from "@/components/ui/Card";
import { Input, Label, Textarea } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import type { Unit } from "@/types";

export default function ProfilePage() {
  const { profile, loading, saveProfile } = useProfile();

  const [name, setName] = useState("");
  const [unit, setUnit] = useState<Unit>("kg");
  const [goal, setGoal] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setUnit(profile.unit);
      setGoal(profile.goal ?? "");
    }
  }, [profile]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      await saveProfile({ name: name.trim() || "Me", unit, goal: goal.trim() || undefined });
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading...</p>;
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          This app is single-user and local - these settings just personalize the display.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="profile-name">Name</Label>
              <Input id="profile-name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="profile-unit">Weight unit</Label>
              <Select
                id="profile-unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value as Unit)}
                className="max-w-[10rem]"
              >
                <option value="kg">kg</option>
                <option value="lb">lb</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="profile-goal">Goal (optional)</Label>
              <Textarea
                id="profile-goal"
                rows={3}
                placeholder="e.g. Bench 100kg by December"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3">
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save profile"}
              </Button>
              {saved && <span className="text-sm text-muted-foreground">Saved.</span>}
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
