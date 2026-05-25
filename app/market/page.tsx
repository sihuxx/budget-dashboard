"use client";

import { useEffect, useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  RefreshCw,
  DollarSign,
  Bitcoin,
  Gem,
} from "lucide-react";

interface ExchangeData {
  usd: string;
  jpy: string;
  eur: string;
  cny: string;
  gbp: string;
  updatedAt: string;
}

interface CoinData {
  price: number;
  change: string;
  marketCap: number;
}

interface CryptoData {
  bitcoin: CoinData;
  ethereum: CoinData;
  ripple: CoinData;
  solana: CoinData;
  dogecoin: CoinData;
}

interface CommodityData {
  gold: { pricePerGram: number; pricePerOz: number; change: string };
  silver: { pricePerGram: number; pricePerOz: number; change: string };
  usdToKrw: number;
}

interface MarketData {
  exchange: ExchangeData | null;
  crypto: CryptoData | null;
  commodity: CommodityData | null;
  fetchedAt: string;
}

function formatPrice(price: number): string {
  if (price >= 100000000) return `${(price / 100000000).toFixed(2)}억`;
  if (price >= 10000) return `${Math.round(price / 10000).toLocaleString()}만`;
  return price.toLocaleString();
}

function formatMarketCap(value: number): string {
  if (value >= 1000000000000) return `${(value / 1000000000000).toFixed(0)}조`;
  if (value >= 100000000) return `${(value / 100000000).toFixed(0)}억`;
  return value.toLocaleString();
}

function ChangeTag({ change }: { change: string }) {
  const isUp = parseFloat(change) >= 0;
  return (
    <span
      className={`flex items-center gap-0.5 text-xs font-medium ${
        isUp ? "text-income" : "text-expense"
      }`}
    >
      {isUp ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
      {isUp ? "+" : ""}
      {change}%
    </span>
  );
}

export default function MarketPage() {
  const [data, setData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState("");

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
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const SkeletonRow = () => (
    <div className="h-5 bg-bg-tertiary rounded animate-pulse w-full" />
  );

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
      {/* 헤더 */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl italic text-tx-primary">Market</h1>
          <p className="text-sm text-tx-tertiary mt-1">실시간 금융 시장 정보</p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm border border-border text-tx-secondary hover:bg-bg-secondary transition-colors disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          {lastUpdated ? `${lastUpdated} 기준` : "불러오는 중..."}
        </button>
      </div>

      <div className="space-y-6">

        {/* 환율 섹션 */}
        <div className="bg-bg-secondary rounded-xl border border-border overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
            <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center">
              <DollarSign size={14} className="text-income" />
            </div>
            <h2 className="text-sm font-medium">환율</h2>
            <span className="ml-auto text-xs text-tx-tertiary">원화(KRW) 기준</span>
          </div>
          <div className="divide-y divide-border">
            {[
              { label: "미국 달러", code: "USD", flag: "🇺🇸", key: "usd" },
              { label: "일본 엔", code: "JPY", flag: "🇯🇵", key: "jpy", suffix: "/100엔" },
              { label: "유로", code: "EUR", flag: "🇪🇺", key: "eur" },
              { label: "중국 위안", code: "CNY", flag: "🇨🇳", key: "cny" },
              { label: "영국 파운드", code: "GBP", flag: "🇬🇧", key: "gbp" },
            ].map(({ label, code, flag, key, suffix }) => (
              <div key={code} className="flex items-center justify-between px-5 py-3.5 hover:bg-bg-tertiary/40 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{flag}</span>
                  <div>
                    <p className="text-sm font-medium">{label}</p>
                    <p className="text-xs text-tx-tertiary">{code}{suffix || ""}</p>
                  </div>
                </div>
                {loading ? (
                  <div className="h-5 w-24 bg-bg-tertiary rounded animate-pulse" />
                ) : (
                  <p className="text-base font-medium text-tx-primary">
                    ₩{Number(data?.exchange?.[key as keyof ExchangeData] || 0).toLocaleString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 암호화폐 섹션 */}
        <div className="bg-bg-secondary rounded-xl border border-border overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
            <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center">
              <Bitcoin size={14} className="text-amber-500" />
            </div>
            <h2 className="text-sm font-medium">암호화폐</h2>
            <span className="ml-auto text-xs text-tx-tertiary">KRW 기준 · 24h 변동</span>
          </div>
          <div className="divide-y divide-border">
            {[
              { label: "비트코인", code: "BTC", icon: "₿", key: "bitcoin", color: "#F7931A" },
              { label: "이더리움", code: "ETH", icon: "Ξ", key: "ethereum", color: "#627EEA" },
              { label: "리플", code: "XRP", icon: "✕", key: "ripple", color: "#00AAE4" },
              { label: "솔라나", code: "SOL", icon: "◎", key: "solana", color: "#9945FF" },
              { label: "도지코인", code: "DOGE", icon: "Ð", key: "dogecoin", color: "#C2A633" },
            ].map(({ label, code, icon, key, color }) => {
              const coin = data?.crypto?.[key as keyof CryptoData];
              return (
                <div key={code} className="flex items-center justify-between px-5 py-3.5 hover:bg-bg-tertiary/40 transition-colors">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                      style={{ backgroundColor: color + "20", color }}
                    >
                      {icon}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{label}</p>
                      <p className="text-xs text-tx-tertiary">{code}</p>
                    </div>
                  </div>
                  {loading ? (
                    <div className="space-y-1 w-32">
                      <SkeletonRow />
                      <SkeletonRow />
                    </div>
                  ) : coin ? (
                    <div className="text-right">
                      <p className="text-sm font-medium text-tx-primary">
                        ₩{formatPrice(coin.price)}
                      </p>
                      <div className="flex items-center justify-end gap-2 mt-0.5">
                        <ChangeTag change={coin.change} />
                        <span className="text-[10px] text-tx-tertiary">
                          시총 {formatMarketCap(coin.marketCap)}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs text-tx-tertiary">-</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 귀금속 섹션 */}
        <div className="bg-bg-secondary rounded-xl border border-border overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
            <div className="w-7 h-7 rounded-lg bg-yellow-50 dark:bg-yellow-950/30 flex items-center justify-center">
              <Gem size={14} className="text-yellow-500" />
            </div>
            <h2 className="text-sm font-medium">귀금속</h2>
            <span className="ml-auto text-xs text-tx-tertiary">KRW 기준 · 24h 변동</span>
          </div>
          <div className="divide-y divide-border">
            {[
              { label: "금", code: "XAU", flag: "🥇", key: "gold" },
              { label: "은", code: "XAG", flag: "🥈", key: "silver" },
            ].map(({ label, code, flag, key }) => {
              const metal = data?.commodity?.[key as "gold" | "silver"];
              return (
                <div key={code} className="flex items-center justify-between px-5 py-3.5 hover:bg-bg-tertiary/40 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{flag}</span>
                    <div>
                      <p className="text-sm font-medium">{label} ({code})</p>
                      <p className="text-xs text-tx-tertiary">PAXG 기반 시세</p>
                    </div>
                  </div>
                  {loading ? (
                    <div className="space-y-1 w-32">
                      <SkeletonRow />
                      <SkeletonRow />
                    </div>
                  ) : metal ? (
                    <div className="text-right">
                      <p className="text-sm font-medium text-tx-primary">
                        ₩{metal.pricePerGram.toLocaleString()} / g
                      </p>
                      <div className="flex items-center justify-end gap-2 mt-0.5">
                        <ChangeTag change={metal.change} />
                        <span className="text-[10px] text-tx-tertiary">
                          1oz ₩{formatPrice(metal.pricePerOz)}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs text-tx-tertiary">-</span>
                  )}
                </div>
              );
            })}
          </div>
          <div className="px-5 py-3 bg-bg-tertiary/30 border-t border-border">
            <p className="text-xs text-tx-tertiary">
              USD/KRW ₩{data?.commodity?.usdToKrw.toLocaleString() || "-"} 적용
              · CoinGecko · open.er-api.com 데이터 기준
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
