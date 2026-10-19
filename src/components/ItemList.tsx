"use client";

import { MapPin, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import PhotoImg from "@/components/PhotoImg";
import { useState } from "react";
import { addItem, daysSince, Kind, SPECIES, speciesOf } from "@/lib/data";
import { update, useDb } from "@/lib/store";

export default function ItemList({ kind, base, title, subtitle }: { kind: Kind; base: string; title: string; subtitle: string }) {
  const { db, ready } = useDb();
  const options = SPECIES.filter((s) => s.kind === kind);
  const [species, setSpecies] = useState(options[0].key);
  const [name, setName] = useState("");
  const [filter, setFilter] = useState("all");
  if (!ready) return <div className="h-64 animate-pulse rounded-3xl bg-white" />;

  const all = db.items.filter((i) => i.kind === kind);
  const items = filter === "all" ? all : all.filter((i) => i.species === filter);
  const dueCount = (id: string) => db.tasks.filter((t) => t.itemId === id && daysSince(t.lastDone) >= t.everyDays).length;

  const add = () => {
    if (!name.trim()) return;
    update((d) => void addItem(d, species, name.trim()));
    setName("");
  };

  const chip = (on: boolean) =>
    `flex items-center gap-2 whitespace-nowrap rounded-full py-1.5 pl-1.5 pr-4 text-sm font-medium transition ${
      on ? "bg-brand-dark text-white shadow-soft" : "border border-line bg-white text-foreground/80 hover:border-brand"
    }`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold md:text-4xl">{title}</h1>
        <p className="mt-1 text-muted">{subtitle}</p>
      </div>

      {options.length > 1 && (
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:px-0">
          <button onClick={() => setFilter("all")} className={`${chip(filter === "all")} pl-4`}>
            Tất cả · {all.length}
          </button>
          {options.map((s) => (
            <button key={s.key} onClick={() => setFilter(s.key)} className={chip(filter === s.key)}>
              <span className="relative h-7 w-7 overflow-hidden rounded-full">
                <Image src={s.image} alt="" fill sizes="28px" className="object-cover" />
              </span>
              {s.label} · {all.filter((i) => i.species === s.key).length}
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-2 rounded-3xl border border-line bg-white p-2 shadow-soft sm:flex-row">
        <select value={species} onChange={(e) => setSpecies(e.target.value)} className="rounded-2xl bg-background px-4 py-3 text-sm font-medium outline-none">
          {options.map((s) => (
            <option key={s.key} value={s.key}>{s.label}</option>
          ))}
        </select>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder={kind === "plant" ? "Đặt tên, vd: Mai sân trước" : "Đặt tên, vd: Hồ cá neon phòng khách"}
          className="min-w-0 flex-1 rounded-2xl px-4 py-3 text-sm outline-none placeholder:text-muted"
        />
        <button onClick={add} className="flex items-center justify-center gap-2 rounded-2xl bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark">
          <Plus size={18} /> Thêm
        </button>
      </div>

      <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 lg:grid-cols-4">
        {items.map((i, idx) => {
          const sp = speciesOf(i.species);
          const n = dueCount(i.id);
          return (
            <li key={i.id} className="animate-rise" style={{ animationDelay: `${Math.min(idx, 12) * 30}ms` }}>
              <Link href={`${base}/${i.id}`} className="group block overflow-hidden rounded-3xl border border-line bg-white shadow-soft transition hover:-translate-y-1 hover:shadow-lift">
                <div className="relative aspect-[4/5] overflow-hidden">
                  <PhotoImg photo={i.photos[0]} fallback={sp?.image ?? ""} alt={i.name} sizes="(min-width: 1024px) 280px, 50vw" className="transition duration-500 group-hover:scale-105" />
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent" />
                  {n > 0 && (
                    <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-accent shadow-soft">
                      {n} việc cần làm
                    </span>
                  )}
                  <div className="absolute inset-x-0 bottom-0 p-3 text-white md:p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-white/75">{sp?.label}</p>
                    <p className="font-display text-lg font-semibold leading-snug">{i.name}</p>
                    {(i.fishType || i.volume) && (
                      <p className="mt-0.5 text-xs text-white/80">
                        {[i.fishType && `${i.fishCount ? `${i.fishCount} ` : ""}${i.fishType}`, i.volume && `${i.volume} lít`].filter(Boolean).join(" · ")}
                      </p>
                    )}
                    {i.location && (
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-white/80">
                        <MapPin size={12} /> {i.location}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
