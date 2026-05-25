"use client";

import { useEffect, useState, useCallback } from "react";
import { TrendingUp, TrendingDown, Wallet, Plus } from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import PeriodSelector from "@/components/PeriodSelector";
import TransactionModal from "@/components/TransactionModal";
import ExternalDataWidget from "@/components/ExternalDataWidget";
import WidgetCustomizer from "@/components/WidgetCustomizer";
import { getPeriodRange, formatCurrency, formatDate } from "@/lib/date-utils";
import type { PeriodFilter, DashboardSummary, CategoryData, TransactionData } from "@/lib/types";
import { useTheme } from "@/components/ThemeProvider";
import { useWidgetSettings } from "@/lib/useWidgetSettings";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

export default function DashboardPage() {
  const { isDark } = useTheme();
  const { widgets, toggleWidget, moveWidget, resetWidgets, loaded } = useWidgetSettings();
  const [period, setPeriod] = useState<PeriodFilter>("month");
  const [reference, setReference] = useState(new Date());
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const { start, end } = getPeriodRange(period, reference);
    const [dashRes, catRes] = await Promise.all([
      fetch(`/api/dashboard?start=${start.toISOString()}&end=${end.toISOString()}`),
      fetch("/api/categories"),
    ]);
    const dash = await dashRes.json();
    const cats = await catRes.json();
    setData(dash);
    setCategories(cats);
    setLoading(false);
  }, [period, reference]);

  useEffect(() => {
    fetch("/api/seed", { method: "POST" }).then(() => fetchData());
  }, [fetchData]);

  const handleSave = async (formData: {
    type: string;
    amount: number;
    categoryId: string;
    date: string;
    memo: string;
  }) => {
    await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    fetchData();
  };

  const summaryCards = [
    {
      label: "수입",
      value: data?.totalIncome || 0,
      icon: TrendingUp,
      color: "text-income",
      bg: "bg-blue-50 dark:bg-blue-950/30",
    },
    {
      label: "지출",
      value: data?.totalExpense || 0,
      icon: TrendingDown,
      color: "text-expense",
      bg: "bg-red-50 dark:bg-red-950/30",
    },
    {
      label: "잔액",
      value: data?.balance || 0,
      icon: Wallet,
      color: "text-accent",
      bg: "bg-accent-light",
    },
  ];

  const chartData = {
    labels: data?.monthlyTrend.labels || [],
    datasets: [
      {
        label: "수입",
        data: data?.monthlyTrend.income || [],
        borderColor: isDark ? "#60a5fa" : "#2563eb",
        backgroundColor: isDark ? "rgba(96,165,250,0.08)" : "rgba(37,99,235,0.08)",
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: isDark ? "#60a5fa" : "#2563eb",
        borderWidth: 2,
      },
      {
        label: "지출",
        data: data?.monthlyTrend.expense || [],
        borderColor: isDark ? "#f87171" : "#dc2626",
        backgroundColor: isDark ? "rgba(248,113,113,0.08)" : "rgba(220,38,38,0.08)",
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: isDark ? "#f87171" : "#dc2626",
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: isDark ? "#6b6a65" : "#9c9b95", font: { size: 11 } },
        border: { display: false },
      },
      y: {
        grid: { color: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)" },
        ticks: {
          color: isDark ? "#6b6a65" : "#9c9b95",
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

  // 위젯 렌더링 맵
  const widgetMap: Record<string, React.ReactNode> = {
    summary: (
      <div key="summary" className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
        {summaryCards.map((card) => (
          <div key={card.label} className={`${card.bg} rounded-xl p-4 border border-border`}>
            <div className="flex items-center gap-2 mb-2">
              <card.icon size={16} className={card.color} />
              <span className="text-xs text-tx-secondary">{card.label}</span>
            </div>
            <p className={`text-xl font-medium ${card.color}`}>
              {formatCurrency(card.value)}
            </p>
          </div>
        ))}
      </div>
    ),
    market: (
      <div key="market">
        <ExternalDataWidget />
      </div>
    ),
    chart: (
      <div key="chart" className="bg-bg-secondary rounded-xl border border-border p-5 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-tx-secondary">최근 6개월 수입·지출 추이</h2>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-income" /> 수입
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-expense" /> 지출
            </span>
          </div>
        </div>
        <div className="h-[220px]">
          <Line data={chartData} options={chartOptions as never} />
        </div>
      </div>
    ),
    recent: (
      <div key="recent" className="bg-bg-secondary rounded-xl border border-border mb-8">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-sm font-medium text-tx-secondary">최근 내역</h2>
        </div>
        {(!data?.recentTransactions || data.recentTransactions.length === 0) ? (
          <div className="p-8 text-center text-tx-tertiary text-sm">
            아직 등록된 내역이 없습니다
          </div>
        ) : (
          <div className="divide-y divide-border">
            {data.recentTransactions.map((tx: TransactionData) => (
              <div
                key={tx.id}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-bg-tertiary/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium"
                    style={{
                      backgroundColor: tx.category.color + "18",
                      color: tx.category.color,
                    }}
                  >
                    {tx.category.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{tx.memo || tx.category.name}</p>
                    <p className="text-xs text-tx-tertiary">
                      {formatDate(tx.date)} · {tx.category.name}
                    </p>
                  </div>
                </div>
                <p className={`text-sm font-medium ${tx.type === "income" ? "text-income" : "text-expense"}`}>
                  {tx.type === "income" ? "+" : "-"}{formatCurrency(tx.amount)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    ),
  };

  if (loading || !loaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-tx-tertiary">불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">

      {/* 헤더 */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl italic text-tx-primary">Dashboard</h1>
          <p className="text-sm text-tx-tertiary mt-1">한눈에 보는 재정 현황</p>
        </div>
        <div className="flex items-center gap-2">
          <WidgetCustomizer
            widgets={widgets}
            onToggle={toggleWidget}
            onMove={moveWidget}
            onReset={resetWidgets}
          />
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 bg-accent text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Plus size={16} />
            내역 추가
          </button>
        </div>
      </div>

      {/* 기간 필터 */}
      <div className="mb-6">
        <PeriodSelector
          period={period}
          reference={reference}
          onPeriodChange={setPeriod}
          onReferenceChange={setReference}
        />
      </div>

      {/* 위젯 렌더링 - 순서 및 표시 여부 적용 */}
      {widgets
        .filter((w) => w.visible)
        .map((w) => widgetMap[w.id])}

      <TransactionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        categories={categories}
      />
    </div>
  );
}
