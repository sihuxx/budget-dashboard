"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import type { CategoryData, TransactionData } from "@/lib/types";

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (data: {
    id?: string;
    type: string;
    amount: number;
    categoryId: string;
    date: string;
    memo: string;
  }) => void;
  categories: CategoryData[];
  editData?: TransactionData | null;
}

export default function TransactionModal({
  open,
  onClose,
  onSave,
  categories,
  editData,
}: Props) {
  const [type, setType] = useState<"income" | "expense">("expense");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [memo, setMemo] = useState("");

  useEffect(() => {
    if (editData) {
      setType(editData.type);
      setAmount(String(editData.amount));
      setCategoryId(editData.categoryId);
      setDate(editData.date.split("T")[0]);
      setMemo(editData.memo);
    } else {
      setType("expense");
      setAmount("");
      setCategoryId("");
      setDate(new Date().toISOString().split("T")[0]);
      setMemo("");
    }
  }, [editData, open]);

  const filtered = categories.filter((c) => c.type === type);

  useEffect(() => {
    if (filtered.length > 0 && !filtered.find((c) => c.id === categoryId)) {
      setCategoryId(filtered[0].id);
    }
  }, [type, filtered, categoryId]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !categoryId) return;
    onSave({
      id: editData?.id,
      type,
      amount: Number(amount),
      categoryId,
      date,
      memo,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] p-4">
      <div className="bg-bg-primary rounded-2xl w-full max-w-md border border-border shadow-xl">
        <div className="flex items-center justify-between p-5 pb-3">
          <h2 className="text-lg font-medium">
            {editData ? "내역 수정" : "내역 추가"}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-bg-tertiary text-tx-tertiary transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 pt-2 flex flex-col gap-4">
          <div className="flex bg-bg-tertiary rounded-lg p-0.5">
            {(["expense", "income"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`flex-1 py-2 text-sm rounded-md transition-all ${
                  type === t
                    ? t === "expense"
                      ? "bg-bg-primary text-expense shadow-sm font-medium"
                      : "bg-bg-primary text-income shadow-sm font-medium"
                    : "text-tx-tertiary"
                }`}
              >
                {t === "expense" ? "지출" : "수입"}
              </button>
            ))}
          </div>

          <div>
            <label className="text-xs text-tx-secondary mb-1.5 block">금액</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="w-full bg-bg-secondary border border-border rounded-lg px-3 py-2.5 text-lg font-medium focus:outline-none focus:ring-2 focus:ring-accent/30 text-tx-primary placeholder:text-tx-tertiary"
              required
              min="1"
            />
          </div>

          <div>
            <label className="text-xs text-tx-secondary mb-1.5 block">카테고리</label>
            <div className="flex flex-wrap gap-1.5">
              {filtered.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoryId(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs transition-all border ${
                    categoryId === cat.id
                      ? "border-accent bg-accent-light text-accent font-medium"
                      : "border-border text-tx-secondary hover:bg-bg-secondary"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-tx-secondary mb-1.5 block">날짜</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 text-tx-primary"
            />
          </div>

          <div>
            <label className="text-xs text-tx-secondary mb-1.5 block">메모</label>
            <input
              type="text"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="선택 사항"
              className="w-full bg-bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 text-tx-primary placeholder:text-tx-tertiary"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-accent text-white py-3 rounded-lg font-medium text-sm hover:opacity-90 transition-opacity mt-1"
          >
            {editData ? "수정하기" : "추가하기"}
          </button>
        </form>
      </div>
    </div>
  );
}
