"use client";

import { useSyncExternalStore } from "react";

// Huế, via Open-Meteo (free, no API key).
const URL_ =
  "https://api.open-meteo.com/v1/forecast?latitude=16.4637&longitude=107.5909" +
  "&current=temperature_2m,weather_code" +
  "&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code" +
  "&timezone=Asia%2FHo_Chi_Minh&forecast_days=4";
const KEY = "cham_soc_cay_weather";
const TTL = 60 * 60 * 1000;

export type Day = { date: string; max: number; min: number; rain: number; code: number };
export type Weather = { fetchedAt: number; temp: number; code: number; days: Day[] };

/** Thresholds behind the watering hints on the home page. */
export const RAIN_SKIP_MM = 5;
export const HOT_DAY_C = 35;

let cache: Weather | null = null;
let started = false;
const listeners = new Set<() => void>();

function fromStorage(): Weather | null {
  try {
    const w = JSON.parse(localStorage.getItem(KEY) ?? "null") as Weather | null;
    return w && Date.now() - w.fetchedAt < TTL ? w : null;
  } catch {
    return null;
  }
}

async function fetchWeather() {
  try {
    const r = await (await fetch(URL_)).json();
    const d = r.daily;
    cache = {
      fetchedAt: Date.now(),
      temp: r.current.temperature_2m,
      code: r.current.weather_code,
      days: d.time.map((date: string, i: number) => ({
        date,
        max: d.temperature_2m_max[i],
        min: d.temperature_2m_min[i],
        rain: d.precipitation_sum[i],
        code: d.weather_code[i],
      })),
    };
    try {
      localStorage.setItem(KEY, JSON.stringify(cache));
    } catch {}
    listeners.forEach((l) => l());
  } catch {
    // offline or API down: the weather card just stays hidden
  }
}

export function useWeather(): Weather | null {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      if (!started) {
        started = true;
        cache = fromStorage();
        if (cache) listeners.forEach((l) => l());
        else void fetchWeather();
      }
      return () => listeners.delete(cb);
    },
    () => cache,
    () => null,
  );
}

/** WMO weather code → Vietnamese label. */
export function describe(code: number): string {
  if (code === 0) return "Trời quang";
  if (code <= 2) return "Ít mây";
  if (code === 3) return "Nhiều mây";
  if (code <= 48) return "Sương mù";
  if (code <= 57) return "Mưa phùn";
  if (code <= 67 || (code >= 80 && code <= 82)) return "Mưa";
  if (code <= 77) return "Tuyết";
  if (code >= 95) return "Dông";
  return "Mưa rào";
}
