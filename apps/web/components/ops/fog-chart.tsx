"use client";

import type { FogHourly } from "@aerly/shared";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function FogChart({ hourly }: { hourly: FogHourly[] }) {
  const data = hourly.map((h) => ({
    label: `${h.time.slice(8, 10)}.${h.time.slice(5, 7)} ${h.time.slice(11, 16)}`,
    short: h.time.slice(11, 16),
    prob: Math.round(h.probability * 100),
  }));

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="fog" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgb(249 115 22)" stopOpacity={0.35} />
              <stop offset="100%" stopColor="rgb(249 115 22)" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis
            dataKey="short"
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            interval={Math.max(0, Math.floor(data.length / 8))}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            tickFormatter={(v) => `${v}%`}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            formatter={(v: number) => [`${v}%`, "Risc ceață"]}
            labelFormatter={(l, p) => p?.[0]?.payload?.label ?? l}
            contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }}
          />
          <ReferenceLine
            y={65}
            stroke="rgb(249 115 22)"
            strokeDasharray="4 4"
            label={{ value: "Risc ridicat", position: "insideTopRight", fontSize: 10, fill: "rgb(249 115 22)" }}
          />
          <Area
            type="monotone"
            dataKey="prob"
            stroke="rgb(37 99 235)"
            strokeWidth={2}
            fill="url(#fog)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
