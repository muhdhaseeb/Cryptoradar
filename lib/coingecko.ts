const COINGECKO_BASE_URL = "https://api.coingecko.com/api/v3";

// Types
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
  sparkline_in_7d?: {
    price: number[];
  };
}

export interface CoinDetail {
  id: string;
  symbol: string;
  name: string;
  image: {
    large: string;
  };
  description: {
    en: string;
  };
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

// Fetch top coins by market cap
export async function getTopCoins(limit: number = 50): Promise<Coin[]> {
  try {
    const response = await fetch(
      `${COINGECKO_BASE_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1&sparkline=true&price_change_percentage=24h`,
      {
        next: { revalidate: 60 }, // Cache for 60 seconds
      }
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching top coins:", error);
    return [];
  }
}

// Fetch single coin details
export async function getCoinDetail(coinId: string): Promise<CoinDetail | null> {
  try {
    const response = await fetch(
      `${COINGECKO_BASE_URL}/coins/${coinId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false`,
      {
        next: { revalidate: 60 },
      }
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching coin detail:", error);
    return null;
  }
}

// Fetch historical price data for charts
export async function getCoinHistory(
  coinId: string,
  days: number = 7
): Promise<{ prices: [number, number][] } | null> {
  try {
    const response = await fetch(
      `${COINGECKO_BASE_URL}/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`,
      {
        next: { revalidate: 300 }, // Cache for 5 minutes
      }
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching coin history:", error);
    return null;
  }
}

// Search coins
export async function searchCoins(query: string): Promise<{
  coins: { id: string; name: string; symbol: string; thumb: string }[];
}> {
  try {
    const response = await fetch(
      `${COINGECKO_BASE_URL}/search?query=${query}`,
      {
        next: { revalidate: 300 },
      }
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error("Error searching coins:", error);
    return { coins: [] };
  }
}

// Format large numbers
export function formatNumber(num: number): string {
  if (num >= 1_000_000_000) {
    return `$${(num / 1_000_000_000).toFixed(2)}B`;
  }
  if (num >= 1_000_000) {
    return `$${(num / 1_000_000).toFixed(2)}M`;
  }
  return `$${num.toLocaleString()}`;
}

// Format price
export function formatPrice(price: number | null): string {
  if (price === null || price === undefined) return "$0.00";
  if (price < 0.01) {
    return `$${price.toFixed(6)}`;
  }
  if (price < 1) {
    return `$${price.toFixed(4)}`;
  }
  return `$${price.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

// Format percentage
export function formatPercentage(percentage: number | null): string {
  if (percentage === null || percentage === undefined) return "0.00%";
  return `${percentage >= 0 ? "+" : ""}${percentage.toFixed(2)}%`;
}