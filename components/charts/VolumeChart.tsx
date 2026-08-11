"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatDisplayDate } from "@/lib/dateUtils";

export interface VolumePoint {
  date: string;
  volume: number;
}

interface VolumeChartProps {
  data: VolumePoint[];
  unit: string;
}

export function VolumeChart({ data, unit }: VolumeChartProps) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid stroke="var(--color-border)" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={(value) => formatDisplayDate(value)}
          tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
          axisLine={{ stroke: "var(--color-border)" }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          width={48}
        />
        <Tooltip
          contentStyle={{
            background: "var(--color-card)",
            border: "1px solid var(--color-border)",
            borderRadius: 8,
            fontSize: 13,
            color: "var(--color-foreground)",
          }}
          labelStyle={{ color: "var(--color-muted-foreground)" }}
          labelFormatter={(value) => formatDisplayDate(String(value))}
          formatter={(value) => [`${Number(value).toLocaleString()} ${unit}`, "Volume"]}
        />
        <Bar dataKey="volume" fill="var(--color-primary)" radius={[4, 4, 0, 0]} maxBarSize={40} />
      </BarChart>
    </ResponsiveContainer>
  );
}
