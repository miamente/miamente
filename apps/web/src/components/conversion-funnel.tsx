"use client";
import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface ConversionFunnelData {
  signups: number;
  profileCompletions: number;
  slotCreations: number;
  appointmentConfirmations: number;
}

interface ConversionFunnelProps {
  data: ConversionFunnelData | null;
  loading?: boolean;
}

export function ConversionFunnel({ data, loading = false }: ConversionFunnelProps) {
  if (loading || !data) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Transform data for the chart
  const chartData = [
    {
      step: "Registros",
      count: data.signups,
      percentage: 100,
    },
    {
      step: "Perfil Completo",
      count: data.profileCompletions,
      percentage: data.signups > 0 ? (data.profileCompletions / data.signups) * 100 : 0,
    },
    {
      step: "Slots Creados",
      count: data.slotCreations,
      percentage: data.signups > 0 ? (data.slotCreations / data.signups) * 100 : 0,
    },
    {
      step: "Citas Confirmadas",
      count: data.appointmentConfirmations,
      percentage: data.signups > 0 ? (data.appointmentConfirmations / data.signups) * 100 : 0,
    },
  ];

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="step" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={80} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip
            formatter={(value, name) => [
              name === "count" ? `${value} eventos` : `${(value as number).toFixed(1)}%`,
              name === "count" ? "Cantidad" : "Porcentaje",
            ]}
            labelFormatter={(value) => `Paso: ${value}`}
          />
          <Legend />
          <Bar dataKey="count" fill="#8884d8" name="count" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
