import { NextResponse } from "next/server";

// 환율 API (exchangerate-api - 무료, Key 불필요)
async function fetchExchangeRates() {
  try {
    const res = await fetch(
      "https://open.er-api.com/v6/latest/KRW",
      { next: { revalidate: 3600 } } // 1시간 캐시
    );
    const data = await res.json();
    const rates = data.rates;
    return {
      usd: rates.USD ? (1 / rates.USD).toFixed(0) : null,
      jpy: rates.JPY ? (100 / rates.JPY).toFixed(0) : null,
      eur: rates.EUR ? (1 / rates.EUR).toFixed(0) : null,
      cny: rates.CNY ? (1 / rates.CNY).toFixed(0) : null,
      updatedAt: data.time_last_update_utc,
    };
  } catch (e) {
    return null;
  }
}

// 암호화폐 API (CoinGecko - 무료, Key 불필요)
async function fetchCrypto() {
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,ripple&vs_currencies=krw&include_24hr_change=true",
      { next: { revalidate: 300 } } // 5분 캐시
    );
    const data = await res.json();
    return {
      bitcoin: {
        price: data.bitcoin?.krw,
        change: data.bitcoin?.krw_24h_change?.toFixed(2),
      },
      ethereum: {
        price: data.ethereum?.krw,
        change: data.ethereum?.krw_24h_change?.toFixed(2),
      },
      ripple: {
        price: data.ripple?.krw,
        change: data.ripple?.krw_24h_change?.toFixed(2),
      },
    };
  } catch (e) {
    return null;
  }
}

// 금 시세 API (metals-api 대신 무료 대안 - commodities)
async function fetchGoldPrice() {
  try {
    const res = await fetch(
      "https://api.metals.live/v1/spot/gold,silver",
      { next: { revalidate: 3600 } }
    );
    const data = await res.json();
    // USD per troy ounce → KRW per gram 변환
    // 환율 따로 fetch
    const fxRes = await fetch("https://open.er-api.com/v6/latest/USD");
    const fxData = await fxRes.json();
    const usdToKrw = fxData.rates?.KRW || 1350;

    const goldUsd = data.find((d: { metal: string }) => d.metal === "gold")?.price || 0;
    const silverUsd = data.find((d: { metal: string }) => d.metal === "silver")?.price || 0;

    // 1 troy oz = 31.1035 grams
    const goldKrwPerGram = Math.round((goldUsd / 31.1035) * usdToKrw);
    const silverKrwPerGram = Math.round((silverUsd / 31.1035) * usdToKrw);

    return {
      gold: goldKrwPerGram,
      silver: silverKrwPerGram,
      usdToKrw: Math.round(usdToKrw),
    };
  } catch (e) {
    return null;
  }
}

export async function GET() {
  const [exchange, crypto, commodity] = await Promise.all([
    fetchExchangeRates(),
    fetchCrypto(),
    fetchGoldPrice(),
  ]);

  return NextResponse.json({
    exchange,
    crypto,
    commodity,
    fetchedAt: new Date().toISOString(),
  });
}
