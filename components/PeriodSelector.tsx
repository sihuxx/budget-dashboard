"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PeriodFilter } from "@/lib/types";
import { formatPeriodLabel, navigatePeriod } from "@/lib/date-utils";

interface Props {
  period: PeriodFilter;
  reference: Date;
  onPeriodChange: (p: PeriodFilter) => void;
  onReferenceChange: (d: Date) => void;
}

const PERIODS: { value: PeriodFilter; label: string }[] = [
  { value: "week", label: "주" },
  { value: "month", label: "월" },
  { value: "year", label: "년" },
];

export default function PeriodSelector({
  period,
  reference,
  onPeriodChange,
  onReferenceChange,
}: Props) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex bg-bg-tertiary rounded-lg p-0.5 gap-0.5">
        {PERIODS.map((p) => (
          <button
            key={p.value}
            onClick={() => onPeriodChange(p.value)}
            className={`px-3 py-1.5 text-xs rounded-md transition-all ${
              period === p.value
                ? "bg-bg-primary text-tx-primary shadow-sm font-medium"
                : "text-tx-tertiary hover:text-tx-secondary"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onReferenceChange(navigatePeriod(period, reference, "prev"))}
          className="p-1.5 rounded-md hover:bg-bg-tertiary text-tx-secondary transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="text-sm font-medium min-w-[120px] text-center">
          {formatPeriodLabel(period, reference)}
        </span>
        <button
          onClick={() => onReferenceChange(navigatePeriod(period, reference, "next"))}
          className="p-1.5 rounded-md hover:bg-bg-tertiary text-tx-secondary transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
