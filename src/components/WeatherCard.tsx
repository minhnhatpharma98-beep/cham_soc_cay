"use client";

import { Droplets, MapPin } from "lucide-react";
import { createElement } from "react";
import { weatherIcon } from "@/components/icons";
import { describe, Weather } from "@/lib/weather";

const WEEKDAY = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

export default function WeatherCard({ weather }: { weather: Weather }) {
  const [today, ...next] = weather.days;
  return (
    <section className="animate-rise grid gap-4 rounded-3xl border border-line bg-white p-5 shadow-soft md:grid-cols-[auto_1fr] md:items-center md:gap-8">
      <div className="flex items-center gap-4">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
          {createElement(weatherIcon(weather.code), { size: 28, strokeWidth: 1.75 })}
        </span>
        <div>
          <p className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-muted">
            <MapPin size={12} /> Huế · bây giờ
          </p>
          <p className="font-display text-3xl font-semibold">{Math.round(weather.temp)}°C</p>
          <p className="text-sm text-muted">
            {describe(weather.code)} · hôm nay {Math.round(today.min)}–{Math.round(today.max)}°
            {today.rain > 0 && (
              <span className="ml-1 inline-flex items-center gap-0.5">
                <Droplets size={12} /> {today.rain}mm
              </span>
            )}
          </p>
        </div>
      </div>
      <ul className="grid grid-cols-3 gap-2">
        {next.map((d) => {
          return (
            <li key={d.date} className="flex flex-col items-center rounded-2xl bg-background py-3 text-center">
              <span className="text-xs font-semibold text-muted">{WEEKDAY[new Date(d.date + "T00:00:00").getDay()]}</span>
              {createElement(weatherIcon(d.code), { size: 22, strokeWidth: 1.75, className: "my-1.5 text-sky-700" })}
              <span className="text-sm font-semibold">
                {Math.round(d.max)}° <span className="font-normal text-muted">{Math.round(d.min)}°</span>
              </span>
              <span className="text-[11px] text-muted">{d.rain > 0 ? `${d.rain}mm` : "Không mưa"}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
