"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import PeriodSelector from "@/components/PeriodSelector";
import TransactionModal from "@/components/TransactionModal";
import { getPeriodRange, formatCurrency, formatDate } from "@/lib/date-utils";
import type { PeriodFilter, CategoryData, TransactionData } from "@/lib/types";

export default function TransactionsPage() {
  const [period, setPeriod] = useState<PeriodFilter>("month");
  const [reference, setReference] = useState(new Date());
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTx, setEditTx] = useState<TransactionData | null>(null);
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all");

  const fetchData = useCallback(async () => {
    const { start, end } = getPeriodRange(period, reference);
    const [txRes, catRes] = await Promise.all([
      fetch(`/api/transactions?start=${start.toISOString()}&end=${end.toISOString()}`),
      fetch("/api/categories"),
    ]);
    setTransactions(await txRes.json());
    setCategories(await catRes.json());
  }, [period, reference]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSave = async (formData: {
    id?: string;
    type: string;
    amount: number;
    categoryId: string;
    date: string;
    memo: string;
  }) => {
    await fetch("/api/transactions", {
      method: formData.id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    setEditTx(null);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("삭제하시겠습니까?")) return;
    await fetch(`/api/transactions?id=${id}`, { method: "DELETE" });
    fetchData();
  };

  const filtered =
    filterType === "all"
      ? transactions
      : transactions.filter((t) => t.type === filterType);

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl italic text-tx-primary">Transactions</h1>
          <p className="text-sm text-tx-tertiary mt-1">수입과 지출 내역</p>
        </div>
        <button
          onClick={() => {
            setEditTx(null);
            setModalOpen(true);
          }}
          className="flex items-center gap-2 bg-accent text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus size={16} />
          추가
        </button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <PeriodSelector
          period={period}
          reference={reference}
          onPeriodChange={setPeriod}
          onReferenceChange={setReference}
        />
        <div className="flex gap-3 text-xs">
          <span className="text-income font-medium">
            수입 {formatCurrency(totalIncome)}
          </span>
          <span className="text-tx-tertiary">|</span>
          <span className="text-expense font-medium">
            지출 {formatCurrency(totalExpense)}
          </span>
        </div>
      </div>

      <div className="flex gap-1 mb-4">
        {(["all", "income", "expense"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            className={`px-3 py-1.5 text-xs rounded-lg transition-all ${
              filterType === t
                ? "bg-accent-light text-accent font-medium"
                : "text-tx-tertiary hover:text-tx-secondary hover:bg-bg-secondary"
            }`}
          >
            {t === "all" ? "전체" : t === "income" ? "수입" : "지출"}
          </button>
        ))}
      </div>

      <div className="bg-bg-secondary rounded-xl border border-border">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-tx-tertiary text-sm">
            해당 기간에 등록된 내역이 없습니다
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-bg-tertiary/50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-medium shrink-0"
                    style={{
                      backgroundColor: tx.category.color + "18",
                      color: tx.category.color,
                    }}
                  >
                    {tx.category.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {tx.memo || tx.category.name}
                    </p>
                    <p className="text-xs text-tx-tertiary">
                      {formatDate(tx.date)} · {tx.category.name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <p
                    className={`text-sm font-medium ${
                      tx.type === "income" ? "text-income" : "text-expense"
                    }`}
                  >
                    {tx.type === "income" ? "+" : "-"}
                    {formatCurrency(tx.amount)}
                  </p>
                  <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        setEditTx(tx);
                        setModalOpen(true);
                      }}
                      className="p-1.5 rounded-md hover:bg-bg-tertiary text-tx-tertiary"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(tx.id)}
                      className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-950/30 text-tx-tertiary hover:text-expense"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <TransactionModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditTx(null);
        }}
        onSave={handleSave}
        categories={categories}
        editData={editTx}
      />
    </div>
  );
}
