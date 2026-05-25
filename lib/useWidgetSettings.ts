"use client";

import { useState, useEffect } from "react";

export interface WidgetConfig {
  id: string;
  label: string;
  visible: boolean;
  order: number;
}

const DEFAULT_WIDGETS: WidgetConfig[] = [
  { id: "summary", label: "요약 카드", visible: true, order: 0 },
  { id: "market", label: "실시간 시세", visible: true, order: 1 },
  { id: "chart", label: "수입·지출 추이", visible: true, order: 2 },
  { id: "recent", label: "최근 내역", visible: true, order: 3 },
];

const STORAGE_KEY = "dashboard_widgets";

export function useWidgetSettings() {
  const [widgets, setWidgets] = useState<WidgetConfig[]>(DEFAULT_WIDGETS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: WidgetConfig[] = JSON.parse(saved);
        // 새 위젯이 추가됐을 때 기본값 병합
        const merged = DEFAULT_WIDGETS.map((def) => {
          const found = parsed.find((p) => p.id === def.id);
          return found ? { ...def, ...found } : def;
        });
        setWidgets(merged);
      }
    } catch {}
    setLoaded(true);
  }, []);

  const save = (updated: WidgetConfig[]) => {
    setWidgets(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const toggleWidget = (id: string) => {
    const updated = widgets.map((w) =>
      w.id === id ? { ...w, visible: !w.visible } : w
    );
    save(updated);
  };

  const moveWidget = (id: string, direction: "up" | "down") => {
    const sorted = [...widgets].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex((w) => w.id === id);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;

    const updated = widgets.map((w) => {
      if (w.id === sorted[idx].id) return { ...w, order: sorted[swapIdx].order };
      if (w.id === sorted[swapIdx].id) return { ...w, order: sorted[idx].order };
      return w;
    });
    save(updated);
  };

  const resetWidgets = () => save(DEFAULT_WIDGETS);

  const sortedWidgets = [...widgets].sort((a, b) => a.order - b.order);

  return { widgets: sortedWidgets, toggleWidget, moveWidget, resetWidgets, loaded };
}
