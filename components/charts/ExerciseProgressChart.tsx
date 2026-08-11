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

export interface ProgressPoint {
  date: string;
  oneRepMax: number;
  isPR: boolean;
  reps: number;
  weight: number;
}

interface ExerciseProgressChartProps {
  data: ProgressPoint[];
  unit: string;
}

const tooltipStyle = {
  background: "var(--color-card)",
  border: "1px solid var(--color-border)",
  borderRadius: 8,
  fontSize: 13,
  color: "var(--color-foreground)",
};

export function ExerciseProgressChart({ data, unit }: ExerciseProgressChartProps) {
  return (
    <ResponsiveContainer width="100%" height={280}>
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
          tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          width={44}
        />
        <Tooltip
          contentStyle={tooltipStyle}
          labelStyle={{ color: "var(--color-muted-foreground)" }}
          labelFormatter={(value) => formatDisplayDate(String(value))}
          formatter={(value, _name, item) => {
            const point = item.payload as ProgressPoint;
            return [
              `${point.weight}${unit} x ${point.reps} reps (est. 1RM ${Math.round(Number(value))}${unit})`,
              point.isPR ? "Best set - PR" : "Best set",
            ];
          }}
        />
        <Line
          type="monotone"
          dataKey="oneRepMax"
          stroke="var(--color-primary)"
          strokeWidth={2}
          dot={({ cx, cy, payload, index }) => (
            <circle
              key={`dot-${index}`}
              cx={cx}
              cy={cy}
              r={payload.isPR ? 5 : 3}
              fill={payload.isPR ? "var(--color-pr)" : "var(--color-primary)"}
              stroke="var(--color-card)"
              strokeWidth={1}
            />
          )}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
