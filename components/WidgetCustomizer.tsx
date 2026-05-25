"use client";

import { useState } from "react";
import { Settings, X, Eye, EyeOff, ChevronUp, ChevronDown, RotateCcw } from "lucide-react";
import type { WidgetConfig } from "@/lib/useWidgetSettings";

interface Props {
  widgets: WidgetConfig[];
  onToggle: (id: string) => void;
  onMove: (id: string, direction: "up" | "down") => void;
  onReset: () => void;
}

export default function WidgetCustomizer({ widgets, onToggle, onMove, onReset }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* 설정 버튼 */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs text-tx-secondary hover:text-tx-primary hover:bg-bg-secondary border border-border transition-all"
      >
        <Settings size={13} />
        위젯 설정
      </button>

      {/* 패널 */}
      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] p-4">
          <div className="bg-bg-primary rounded-2xl w-full max-w-sm border border-border shadow-xl">

            {/* 헤더 */}
            <div className="flex items-center justify-between p-5 pb-3">
              <div>
                <h2 className="text-base font-medium">위젯 설정</h2>
                <p className="text-xs text-tx-tertiary mt-0.5">표시 여부와 순서를 변경할 수 있어요</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg hover:bg-bg-tertiary text-tx-tertiary transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* 위젯 목록 */}
            <div className="px-5 py-3 space-y-2">
              {widgets.map((widget, idx) => (
                <div
                  key={widget.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                    widget.visible
                      ? "bg-bg-secondary border-border"
                      : "bg-bg-tertiary/40 border-border opacity-50"
                  }`}
                >
                  {/* 표시/숨김 토글 */}
                  <button
                    onClick={() => onToggle(widget.id)}
                    className={`shrink-0 transition-colors ${
                      widget.visible ? "text-accent" : "text-tx-tertiary"
                    }`}
                  >
                    {widget.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>

                  {/* 위젯 이름 */}
                  <span className="flex-1 text-sm font-medium">{widget.label}</span>

                  {/* 순서 이동 */}
                  <div className="flex flex-col gap-0.5">
                    <button
                      onClick={() => onMove(widget.id, "up")}
                      disabled={idx === 0}
                      className="p-0.5 rounded hover:bg-bg-tertiary text-tx-tertiary disabled:opacity-20 transition-colors"
                    >
                      <ChevronUp size={14} />
                    </button>
                    <button
                      onClick={() => onMove(widget.id, "down")}
                      disabled={idx === widgets.length - 1}
                      className="p-0.5 rounded hover:bg-bg-tertiary text-tx-tertiary disabled:opacity-20 transition-colors"
                    >
                      <ChevronDown size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* 푸터 */}
            <div className="px-5 py-4 border-t border-border flex items-center justify-between">
              <button
                onClick={() => { onReset(); }}
                className="flex items-center gap-1.5 text-xs text-tx-tertiary hover:text-tx-secondary transition-colors"
              >
                <RotateCcw size={12} />
                기본값으로 초기화
              </button>
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 bg-accent text-white text-xs font-medium rounded-lg hover:opacity-90 transition-opacity"
              >
                완료
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
