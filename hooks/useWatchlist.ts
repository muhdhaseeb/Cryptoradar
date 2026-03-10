"use client";

import { useState, useEffect } from "react";

interface WatchlistItem {
  coinId: string;
  coinName: string;
  coinSymbol: string;
  image: string;
}

export function useWatchlist(coinId?: string) {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [isWatching, setIsWatching] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWatchlist();
  }, []);

  useEffect(() => {
    if (coinId) {
      setIsWatching(watchlist.some((item) => item.coinId === coinId));
    }
  }, [watchlist, coinId]);

  async function fetchWatchlist() {
    setLoading(true);
    try {
      const res = await fetch("/api/watchlist");
      if (res.ok) {
        const data = await res.json();
        setWatchlist(data);
      }
    } catch (error) {
      console.error("Error fetching watchlist:", error);
    } finally {
      setLoading(false);
    }
  }

  async function addToWatchlist(coin: WatchlistItem) {
    setLoading(true);
    try {
      const res = await fetch("/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(coin),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Add watchlist failed: ${res.status} ${text}`);
      }
      setWatchlist((prev) =>
        prev.some((item) => item.coinId === coin.coinId) ? prev : [...prev, coin]
      );
      if (coin.coinId === coinId) setIsWatching(true);
    } catch (error) {
      console.error("Error adding to watchlist:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  async function removeFromWatchlist(coinIdToRemove: string) {
    setLoading(true);
    try {
      const res = await fetch("/api/watchlist", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coinId: coinIdToRemove }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Remove watchlist failed: ${res.status} ${text}`);
      }
      setWatchlist((prev) => prev.filter((item) => item.coinId !== coinIdToRemove));
      if (coinIdToRemove === coinId) setIsWatching(false);
    } catch (error) {
      console.error("Error removing from watchlist:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  return { watchlist, isWatching, loading, addToWatchlist, removeFromWatchlist };
}