"use client";
import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import { type AppointmentChartData } from "@/lib/analytics-admin";

interface AppointmentChartProps {
  data: AppointmentChartData[];
  loading?: boolean;
}

export function AppointmentChart({ data, loading = false }: AppointmentChartProps) {
  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-neutral-500">
        No hay datos disponibles
      </div>
    );
  }

  // Format data for the chart
  const chartData = data.map((item) => ({
    ...item,
    date: new Date(item.date).toLocaleDateString("es-CO", {
      month: "short",
      day: "numeric",
    }),
  }));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={60} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip
            labelFormatter={(value) => `Fecha: ${value}`}
            formatter={(value, name) => [value, name === "confirmed" ? "Confirmadas" : "Total"]}
          />
          <Legend
            formatter={(value) => (value === "confirmed" ? "Citas Confirmadas" : "Total Citas")}
          />
          <Line
            type="monotone"
            dataKey="total"
            stroke="#8884d8"
            strokeWidth={2}
            name="total"
            dot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="confirmed"
            stroke="#82ca9d"
            strokeWidth={2}
            name="confirmed"
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
