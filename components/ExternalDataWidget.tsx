"use client";

import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, RefreshCw, DollarSign, Bitcoin, Gem } from "lucide-react";

interface ExternalData {
  exchange: {
    usd: string;
    jpy: string;
    eur: string;
    cny: string;
    updatedAt: string;
  } | null;
  crypto: {
    bitcoin: { price: number; change: string };
    ethereum: { price: number; change: string };
    ripple: { price: number; change: string };
  } | null;
  commodity: {
    gold: number;
    silver: number;
    usdToKrw: number;
  } | null;
  fetchedAt: string;
}

function formatPrice(price: number): string {
  if (price >= 100000000) return `${(price / 100000000).toFixed(2)}억`;
  if (price >= 10000) return `${Math.round(price / 10000).toLocaleString()}만`;
  return price.toLocaleString();
}

export default function ExternalDataWidget() {
  const [data, setData] = useState<ExternalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/external");
      const json = await res.json();
      setData(json);
      setLastUpdated(new Date().toLocaleTimeString("ko-KR"));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // 5분마다 자동 갱신
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-4 mb-8">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-tx-secondary">실시간 금융 정보</h2>
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs text-tx-tertiary hover:text-tx-secondary transition-colors"
        >
          <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
          {lastUpdated ? `${lastUpdated} 기준` : "갱신 중..."}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* 환율 위젯 */}
        <div className="bg-bg-secondary rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center">
              <DollarSign size={14} className="text-income" />
            </div>
            <span className="text-sm font-medium">환율</span>
            <span className="ml-auto text-[10px] text-tx-tertiary">KRW 기준</span>
          </div>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-4 bg-bg-tertiary rounded animate-pulse" />
              ))}
            </div>
          ) : data?.exchange ? (
            <div className="space-y-2">
              {[
                { label: "USD", value: data.exchange.usd, flag: "🇺🇸" },
                { label: "JPY", value: data.exchange.jpy, suffix: "/100엔", flag: "🇯🇵" },
                { label: "EUR", value: data.exchange.eur, flag: "🇪🇺" },
                { label: "CNY", value: data.exchange.cny, flag: "🇨🇳" },
              ].map(({ label, value, suffix, flag }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-xs text-tx-secondary flex items-center gap-1.5">
                    {flag} {label}{suffix || ""}
                  </span>
                  <span className="text-sm font-medium text-tx-primary">
                    ₩{Number(value).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-tx-tertiary text-center py-2">데이터를 불러올 수 없습니다</p>
          )}
        </div>

        {/* 암호화폐 위젯 */}
        <div className="bg-bg-secondary rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center">
              <Bitcoin size={14} className="text-amber-500" />
            </div>
            <span className="text-sm font-medium">암호화폐</span>
            <span className="ml-auto text-[10px] text-tx-tertiary">24h 변동</span>
          </div>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-4 bg-bg-tertiary rounded animate-pulse" />
              ))}
            </div>
          ) : data?.crypto ? (
            <div className="space-y-2.5">
              {[
                { label: "비트코인", key: "bitcoin", icon: "₿" },
                { label: "이더리움", key: "ethereum", icon: "Ξ" },
                { label: "리플", key: "ripple", icon: "✕" },
              ].map(({ label, key, icon }) => {
                const coin = data.crypto![key as keyof typeof data.crypto] as { price: number; change: string };
                const isUp = parseFloat(coin.change) >= 0;
                return (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-xs text-tx-secondary flex items-center gap-1">
                      <span className="font-mono text-[11px]">{icon}</span> {label}
                    </span>
                    <div className="text-right">
                      <p className="text-sm font-medium text-tx-primary">
                        ₩{formatPrice(coin.price)}
                      </p>
                      <p className={`text-[10px] flex items-center justify-end gap-0.5 ${isUp ? "text-income" : "text-expense"}`}>
                        {isUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                        {isUp ? "+" : ""}{coin.change}%
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-tx-tertiary text-center py-2">데이터를 불러올 수 없습니다</p>
          )}
        </div>

        {/* 금/은 시세 위젯 */}
        <div className="bg-bg-secondary rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-yellow-50 dark:bg-yellow-950/30 flex items-center justify-center">
              <Gem size={14} className="text-yellow-500" />
            </div>
            <span className="text-sm font-medium">귀금속</span>
            <span className="ml-auto text-[10px] text-tx-tertiary">1g 기준</span>
          </div>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-4 bg-bg-tertiary rounded animate-pulse" />
              ))}
            </div>
          ) : data?.commodity ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-tx-secondary flex items-center gap-1.5">
                  🥇 금 (Gold)
                </span>
                <div className="text-right">
                  <p className="text-sm font-medium text-tx-primary">
                    ₩{data.commodity.gold.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-tx-tertiary">per gram</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-tx-secondary flex items-center gap-1.5">
                  🥈 은 (Silver)
                </span>
                <div className="text-right">
                  <p className="text-sm font-medium text-tx-primary">
                    ₩{data.commodity.silver.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-tx-tertiary">per gram</p>
                </div>
              </div>
              <div className="pt-1 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-tx-secondary">USD/KRW</span>
                  <span className="text-sm font-medium text-tx-primary">
                    ₩{data.commodity.usdToKrw.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-tx-tertiary text-center py-2">데이터를 불러올 수 없습니다</p>
          )}
        </div>

      </div>
    </div>
  );
}
