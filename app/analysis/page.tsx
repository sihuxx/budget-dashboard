"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Doughnut, Bar, Line } from "react-chartjs-2";
import PeriodSelector from "@/components/PeriodSelector";
import { getPeriodRange, formatCurrency } from "@/lib/date-utils";
import type { PeriodFilter, CategorySummary } from "@/lib/types";
import { useTheme } from "@/components/ThemeProvider";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend
);

interface AnalysisData {
  expense: CategorySummary[];
  income: CategorySummary[];
  totalExpense: number;
  totalIncome: number;
}

export default function AnalysisPage() {
  const { isDark } = useTheme();
  const [period, setPeriod] = useState<PeriodFilter>("month");
  const [reference, setReference] = useState(new Date());
  const [data, setData] = useState<AnalysisData | null>(null);

  const fetchData = useCallback(async () => {
    const { start, end } = getPeriodRange(period, reference);
    const res = await fetch(
      `/api/analysis?start=${start.toISOString()}&end=${end.toISOString()}`
    );
    setData(await res.json());
  }, [period, reference]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const textColor = isDark ? "#9c9b95" : "#6b6a65";
  const gridColor = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)";

  const doughnutData = {
    labels: data?.expense.map((e) => e.categoryName) || [],
    datasets: [
      {
        data: data?.expense.map((e) => e.total) || [],
        backgroundColor: data?.expense.map((e) => e.color) || [],
        borderWidth: 0,
        hoverOffset: 8,
      },
    ],
  };

  const barData = {
    labels: data?.expense.map((e) => e.categoryName) || [],
    datasets: [
      {
        label: "지출",
        data: data?.expense.map((e) => e.total) || [],
        backgroundColor: data?.expense.map((e) => e.color + "cc") || [],
        borderRadius: 6,
        borderSkipped: false as const,
        maxBarThickness: 36,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: textColor, font: { size: 11 } },
        border: { display: false },
      },
      y: {
        grid: { color: gridColor },
        ticks: {
          color: textColor,
          font: { size: 11 },
          callback: (v: unknown) => {
            const num = Number(v);
            return num >= 10000 ? `${Math.round(num / 10000)}만` : `${num}`;
          },
        },
        border: { display: false },
      },
    },
  };

  const noData = !data || (data.expense.length === 0 && data.income.length === 0);

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl italic text-tx-primary">Analysis</h1>
        <p className="text-sm text-tx-tertiary mt-1">카테고리별 소비 분석</p>
      </div>

      <div className="mb-6">
        <PeriodSelector
          period={period}
          reference={reference}
          onPeriodChange={setPeriod}
          onReferenceChange={setReference}
        />
      </div>

      {noData ? (
        <div className="bg-bg-secondary rounded-xl border border-border p-12 text-center text-tx-tertiary text-sm">
          해당 기간에 분석할 데이터가 없습니다
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-bg-secondary rounded-xl border border-border p-5">
            <h2 className="text-sm font-medium text-tx-secondary mb-4">
              지출 비율
            </h2>
            <div className="flex justify-center">
              <div className="w-[220px] h-[220px] relative">
                <Doughnut
                  data={doughnutData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: "65%",
                    plugins: { legend: { display: false } },
                  }}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-xs text-tx-tertiary">총 지출</p>
                  <p className="text-base font-medium text-tx-primary">
                    {formatCurrency(data?.totalExpense || 0)}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {data?.expense.map((e) => (
                <div key={e.categoryId} className="flex items-center gap-2 text-xs">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: e.color }}
                  />
                  <span className="text-tx-secondary truncate">{e.categoryName}</span>
                  <span className="ml-auto font-medium text-tx-primary">{e.percentage}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-bg-secondary rounded-xl border border-border p-5">
            <h2 className="text-sm font-medium text-tx-secondary mb-4">
              카테고리별 지출 금액
            </h2>
            <div className="h-[300px]">
              <Bar data={barData} options={barOptions as never} />
            </div>
          </div>

          <div className="lg:col-span-2 bg-bg-secondary rounded-xl border border-border p-5">
            <h2 className="text-sm font-medium text-tx-secondary mb-4">
              카테고리별 상세 내역
            </h2>
            <div className="divide-y divide-border">
              {data?.expense.map((e) => (
                <div
                  key={e.categoryId}
                  className="flex items-center justify-between py-3"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium"
                      style={{
                        backgroundColor: e.color + "18",
                        color: e.color,
                      }}
                    >
                      {e.categoryName.charAt(0)}
                    </div>
                    <span className="text-sm font-medium">{e.categoryName}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-expense">
                      {formatCurrency(e.total)}
                    </p>
                    <p className="text-xs text-tx-tertiary">{e.percentage}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
