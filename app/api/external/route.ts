import { NextResponse } from "next/server";

// 1. 환율 API (open.er-api.com - 무료, Key 불필요)
async function fetchExchangeRates() {
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/KRW", {
      next: { revalidate: 3600 },
    });
    const data = await res.json();
    const rates = data.rates;
    return {
      usd: rates.USD ? (1 / rates.USD).toFixed(0) : null,
      jpy: rates.JPY ? (100 / rates.JPY).toFixed(0) : null,
      eur: rates.EUR ? (1 / rates.EUR).toFixed(0) : null,
      cny: rates.CNY ? (1 / rates.CNY).toFixed(0) : null,
      gbp: rates.GBP ? (1 / rates.GBP).toFixed(0) : null,
      updatedAt: data.time_last_update_utc,
    };
  } catch {
    return null;
  }
}

// 2. 암호화폐 API (CoinGecko - 무료, Key 불필요)
async function fetchCrypto() {
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,ripple,solana,dogecoin&vs_currencies=krw&include_24hr_change=true&include_market_cap=true",
      { next: { revalidate: 300 } }
    );
    const data = await res.json();
    const format = (key: string) => ({
      price: data[key]?.krw || 0,
      change: data[key]?.krw_24h_change?.toFixed(2) || "0",
      marketCap: data[key]?.krw_market_cap || 0,
    });
    return {
      bitcoin: format("bitcoin"),
      ethereum: format("ethereum"),
      ripple: format("ripple"),
      solana: format("solana"),
      dogecoin: format("dogecoin"),
    };
  } catch {
    return null;
  }
}

// 3. 귀금속 시세 (CoinGecko의 금/은 토큰 기반 - 무료, Key 불필요)
async function fetchCommodities() {
  try {
    // 환율 가져오기
    const fxRes = await fetch("https://open.er-api.com/v6/latest/USD", {
      next: { revalidate: 3600 },
    });
    const fxData = await fxRes.json();
    const usdToKrw = fxData.rates?.KRW || 1350;

    // frankfurter API로 금/은 관련 지수 가져오기 (대체 방법)
    // CoinGecko에서 paxg(금 토큰)와 xaut(금 토큰) 시세 사용
    const metalRes = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=pax-gold,tether-gold,silver&vs_currencies=usd&include_24hr_change=true",
      { next: { revalidate: 3600 } }
    );
    const metalData = await metalRes.json();

    // PAX Gold: 1 PAXG = 1 troy oz of gold
    const goldUsdPerOz = metalData["pax-gold"]?.usd || metalData["tether-gold"]?.usd || 3300;
    const silverUsdPerOz = metalData["silver"]?.usd || 33;

    // 1 troy oz = 31.1035g
    const goldKrwPerGram = Math.round((goldUsdPerOz / 31.1035) * usdToKrw);
    const silverKrwPerGram = Math.round((silverUsdPerOz / 31.1035) * usdToKrw);

    const goldChange = metalData["pax-gold"]?.usd_24h_change?.toFixed(2) || "0";
    const silverChange = metalData["silver"]?.usd_24h_change?.toFixed(2) || "0";

    return {
      gold: { pricePerGram: goldKrwPerGram, pricePerOz: Math.round(goldUsdPerOz * usdToKrw), change: goldChange },
      silver: { pricePerGram: silverKrwPerGram, pricePerOz: Math.round(silverUsdPerOz * usdToKrw), change: silverChange },
      usdToKrw: Math.round(usdToKrw),
    };
  } catch {
    return null;
  }
}

export async function GET() {
  const [exchange, crypto, commodity] = await Promise.all([
    fetchExchangeRates(),
    fetchCrypto(),
    fetchCommodities(),
  ]);

  return NextResponse.json({
    exchange,
    crypto,
    commodity,
    fetchedAt: new Date().toISOString(),
  });
}
