const COINGECKO_BASE_URL = "https://api.coingecko.com/api/v3";
const FETCH_TIMEOUT_MS = 8000;

function fetchWithTimeout(url: string, options: RequestInit & { next?: { revalidate: number } }) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  return fetch(url, { ...options, signal: controller.signal }).finally(() =>
    clearTimeout(timer)
  );
}

export interface Coin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  price_change_percentage_24h: number;
  price_change_24h: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  circulating_supply: number;
  sparkline_in_7d?: { price: number[] };
}

export interface CoinDetail {
  id: string;
  symbol: string;
  name: string;
  image: { large: string };
  description: { en: string };
  market_cap_rank: number;  
  market_data: {
    current_price: { usd: number };
    price_change_percentage_24h: number;
    price_change_percentage_7d: number;
    price_change_percentage_30d: number;
    market_cap: { usd: number };
    total_volume: { usd: number };
    high_24h: { usd: number };
    low_24h: { usd: number };
    circulating_supply: number;
    ath: { usd: number };
    ath_change_percentage: { usd: number };
  };
}

export async function getTopCoins(limit: number = 50): Promise<Coin[]> {
  try {
    const response = await fetchWithTimeout(
      `${COINGECKO_BASE_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1&sparkline=true&price_change_percentage=24h`,
      { next: { revalidate: 300 } }
    );
    if (!response.ok) throw new Error(`CoinGecko API error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error fetching top coins:", error);
    return [];
  }
}

export async function getCoinDetail(coinId: string): Promise<CoinDetail | null> {
  // sanitize/encode the identifier to avoid malformed URLs
  const safeId = encodeURIComponent(coinId.toLowerCase());
  // optional pattern validation
  if (!/^[a-z0-9-]+$/.test(coinId)) {
    console.warn("getCoinDetail received unexpected coinId", coinId);
  }
  try {
    const response = await fetchWithTimeout(
      `${COINGECKO_BASE_URL}/coins/${safeId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false`,
      { next: { revalidate: 300 } }
    );
    if (!response.ok) throw new Error(`CoinGecko API error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error fetching coin detail:", error);
    return null;
  }
}

export async function getCoinHistory(
  coinId: string,
  days: number = 7
): Promise<{ prices: [number, number][] } | null> {
  const safeId = encodeURIComponent(coinId.toLowerCase());
  try {
    const response = await fetchWithTimeout(
      `${COINGECKO_BASE_URL}/coins/${safeId}/market_chart?vs_currency=usd&days=${days}`,
      { next: { revalidate: 600 } }
    );
    if (!response.ok) throw new Error(`CoinGecko API error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error fetching coin history:", error);
    return null;
  }
}

export async function searchCoins(query: string): Promise<{
  coins: { id: string; name: string; symbol: string; thumb: string }[];
}> {
  try {
    const response = await fetchWithTimeout(
      `${COINGECKO_BASE_URL}/search?query=${encodeURIComponent(query)}`,
      { next: { revalidate: 600 } }
    );
    if (!response.ok) throw new Error(`CoinGecko API error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error searching coins:", error);
    return { coins: [] };
  }
}

export function formatNumber(num: number | null | undefined): string {
  if (num == null) return "—";
  if (num >= 1_000_000_000) return `$${(num / 1_000_000_000).toFixed(2)}B`;
  if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(2)}M`;
  return `$${num.toLocaleString("en-US")}`;
}

export function formatPrice(price: number | null | undefined): string {
  if (price === null || price === undefined) return "—";
  if (price < 0.01) return `$${price.toFixed(6)}`;
  if (price < 1) return `$${price.toFixed(4)}`;
  return `$${price.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatPercentage(percentage: number | null | undefined): string {
  if (percentage === null || percentage === undefined) return "—";
  return `${percentage >= 0 ? "+" : ""}${percentage.toFixed(2)}%`;
}