"use client";

import { useCallback, useEffect, useState } from "react";
import { apiGet, apiPut } from "@/lib/api";
import type { Profile, ProfileInput } from "@/types";

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const data = await apiGet<Profile | null>("/api/profile");
    setProfile(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function saveProfile(input: ProfileInput) {
    const saved = await apiPut<Profile>("/api/profile", input);
    setProfile(saved);
    return saved;
  }

  return { profile, loading, refresh, saveProfile };
}
