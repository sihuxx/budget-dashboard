import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  format,
  subMonths,
  addMonths,
  addWeeks,
  subWeeks,
  addYears,
  subYears,
} from "date-fns";
import { ko } from "date-fns/locale";
import type { PeriodFilter } from "./types";

export function getPeriodRange(
  period: PeriodFilter,
  reference: Date
): { start: Date; end: Date } {
  switch (period) {
    case "week":
      return {
        start: startOfWeek(reference, { weekStartsOn: 1 }),
        end: endOfWeek(reference, { weekStartsOn: 1 }),
      };
    case "month":
      return { start: startOfMonth(reference), end: endOfMonth(reference) };
    case "year":
      return { start: startOfYear(reference), end: endOfYear(reference) };
  }
}

export function navigatePeriod(
  period: PeriodFilter,
  reference: Date,
  direction: "prev" | "next"
): Date {
  const fn =
    direction === "prev"
      ? { week: subWeeks, month: subMonths, year: subYears }
      : { week: addWeeks, month: addMonths, year: addYears };
  return fn[period](reference, 1);
}

export function formatPeriodLabel(period: PeriodFilter, reference: Date): string {
  switch (period) {
    case "week": {
      const s = startOfWeek(reference, { weekStartsOn: 1 });
      const e = endOfWeek(reference, { weekStartsOn: 1 });
      return `${format(s, "M.d", { locale: ko })} ~ ${format(e, "M.d", { locale: ko })}`;
    }
    case "month":
      return format(reference, "yyyy년 M월", { locale: ko });
    case "year":
      return format(reference, "yyyy년", { locale: ko });
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("ko-KR").format(amount) + "원";
}

export function formatDate(dateStr: string): string {
  return format(new Date(dateStr), "M.d (EEE)", { locale: ko });
}
