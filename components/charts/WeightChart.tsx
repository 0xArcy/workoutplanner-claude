"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatDisplayDate } from "@/lib/dateUtils";

export interface WeightPoint {
  date: string;
  weight: number;
}

interface WeightChartProps {
  data: WeightPoint[];
  unit: string;
}

export function WeightChart({ data, unit }: WeightChartProps) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid stroke="var(--color-border)" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={(value) => formatDisplayDate(value)}
          tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
          axisLine={{ stroke: "var(--color-border)" }}
          tickLine={false}
        />
        <YAxis
          domain={["auto", "auto"]}
          tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          width={44}
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
          formatter={(value) => [`${value} ${unit}`, "Body weight"]}
        />
        <Line
          type="monotone"
          dataKey="weight"
          stroke="var(--color-primary)"
          strokeWidth={2}
          dot={{ r: 3, fill: "var(--color-primary)", stroke: "var(--color-card)", strokeWidth: 1 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
