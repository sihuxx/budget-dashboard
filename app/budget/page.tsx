"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Trash2, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/date-utils";
import type { CategoryData, BudgetWithSpent } from "@/lib/types";

export default function BudgetPage() {
  const [month, setMonth] = useState(format(new Date(), "yyyy-MM"));
  const [budgets, setBudgets] = useState<BudgetWithSpent[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formCat, setFormCat] = useState("");
  const [formAmount, setFormAmount] = useState("");

  const fetchData = useCallback(async () => {
    const [budRes, catRes] = await Promise.all([
      fetch(`/api/budgets?month=${month}`),
      fetch("/api/categories"),
    ]);
    setBudgets(await budRes.json());
    setCategories(await catRes.json());
  }, [month]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const expenseCategories = categories.filter((c) => c.type === "expense");
  const usedCatIds = new Set(budgets.map((b) => b.categoryId));
  const availableCats = expenseCategories.filter((c) => !usedCatIds.has(c.id));

  useEffect(() => {
    if (availableCats.length > 0 && !formCat) {
      setFormCat(availableCats[0].id);
    }
  }, [availableCats, formCat]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCat || !formAmount) return;
    await fetch("/api/budgets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        categoryId: formCat,
        month,
        amount: Number(formAmount),
      }),
    });
    setFormAmount("");
    setFormCat("");
    setShowForm(false);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/budgets?id=${id}`, { method: "DELETE" });
    fetchData();
  };

  const totalBudget = budgets.reduce((s, b) => s + b.amount, 0);
  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);
  const overallPct = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl italic text-tx-primary">Budget</h1>
          <p className="text-sm text-tx-tertiary mt-1">예산 설정 및 달성률</p>
        </div>
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="bg-bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-tx-primary focus:outline-none focus:ring-2 focus:ring-accent/30"
        />
      </div>

      <div className="bg-bg-secondary rounded-xl border border-border p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-tx-secondary">전체 예산 달성률</span>
          <span className={`text-sm font-medium ${overallPct > 100 ? "text-expense" : "text-accent"}`}>
            {formatCurrency(totalSpent)} / {formatCurrency(totalBudget)}
          </span>
        </div>
        <div className="h-3 bg-bg-tertiary rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              overallPct > 100 ? "bg-expense" : overallPct > 80 ? "bg-amber-500" : "bg-accent"
            }`}
            style={{ width: `${Math.min(overallPct, 100)}%` }}
          />
        </div>
        <p className="text-xs text-tx-tertiary mt-2 text-right">{overallPct}% 사용</p>
      </div>

      <div className="space-y-3 mb-6">
        {budgets.length === 0 ? (
          <div className="bg-bg-secondary rounded-xl border border-border p-12 text-center text-tx-tertiary text-sm">
            설정된 예산이 없습니다
          </div>
        ) : (
          budgets.map((b) => {
            const pct = b.amount > 0 ? Math.round((b.spent / b.amount) * 100) : 0;
            const over = pct > 100;
            const warn = pct > 80 && !over;
            return (
              <div
                key={b.id}
                className="bg-bg-secondary rounded-xl border border-border p-4 group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-7 h-7 rounded-md flex items-center justify-center text-[11px] font-medium"
                      style={{
                        backgroundColor: b.category.color + "18",
                        color: b.category.color,
                      }}
                    >
                      {b.category.name.charAt(0)}
                    </div>
                    <span className="text-sm font-medium">{b.category.name}</span>
                    {over && (
                      <span className="flex items-center gap-1 text-[11px] text-expense font-medium">
                        <AlertTriangle size={12} /> 초과
                      </span>
                    )}
                    {warn && (
                      <span className="text-[11px] text-amber-500 font-medium">
                        주의
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-tx-secondary">
                      {formatCurrency(b.spent)} / {formatCurrency(b.amount)}
                    </span>
                    <button
                      onClick={() => handleDelete(b.id)}
                      className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-red-50 dark:hover:bg-red-950/30 text-tx-tertiary hover:text-expense transition-all"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
                <div className="h-2 bg-bg-tertiary rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      over ? "bg-expense" : warn ? "bg-amber-500" : "bg-accent"
                    }`}
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>
                <p className="text-[11px] text-tx-tertiary mt-1.5 text-right">
                  {pct}% · 잔여 {formatCurrency(Math.max(b.amount - b.spent, 0))}
                </p>
              </div>
            );
          })
        )}
      </div>

      {showForm ? (
        <form
          onSubmit={handleAdd}
          className="bg-bg-secondary rounded-xl border border-border p-5 flex flex-col gap-3"
        >
          <div className="flex gap-3">
            <select
              value={formCat}
              onChange={(e) => setFormCat(e.target.value)}
              className="flex-1 bg-bg-primary border border-border rounded-lg px-3 py-2.5 text-sm text-tx-primary focus:outline-none focus:ring-2 focus:ring-accent/30"
            >
              {availableCats.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
              {availableCats.length === 0 && (
                <option disabled>모든 카테고리에 예산이 설정됨</option>
              )}
            </select>
            <input
              type="number"
              value={formAmount}
              onChange={(e) => setFormAmount(e.target.value)}
              placeholder="예산 금액"
              className="w-40 bg-bg-primary border border-border rounded-lg px-3 py-2.5 text-sm text-tx-primary focus:outline-none focus:ring-2 focus:ring-accent/30 placeholder:text-tx-tertiary"
              min="1"
              required
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-sm text-tx-secondary hover:bg-bg-tertiary rounded-lg transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-accent text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
              disabled={availableCats.length === 0}
            >
              추가
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-border rounded-xl text-sm text-tx-secondary hover:text-tx-primary hover:bg-bg-secondary transition-colors"
        >
          <Plus size={16} />
          예산 추가
        </button>
      )}
    </div>
  );
}
