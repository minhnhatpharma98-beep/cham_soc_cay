"use client";

import { Check, Scissors } from "lucide-react";
import { Item } from "@/lib/data";
import { update } from "@/lib/store";
import { fmtDate, LeafPick } from "@/lib/tet";

/** Countdown to the suggested mai leaf-picking date, with a per-tree "done" button. */
export default function LeafPickCard({ pick, mai, compact }: { pick: LeafPick; mai: Item[]; compact?: boolean }) {
  const done = (id: string) =>
    update((d) => {
      const it = d.items.find((i) => i.id === id);
      if (it) it.leafPickedYear = it.leafPickedYear === pick.tetYear ? undefined : pick.tetYear;
    });

  const when =
    pick.daysToPick > 0 ? `Còn ${pick.daysToPick} ngày` : pick.daysToPick === 0 ? "Hôm nay" : `Đã qua ${-pick.daysToPick} ngày`;

  return (
    <section className="overflow-hidden rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-soft">
      <div className="flex items-start gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
          <Scissors size={22} strokeWidth={1.75} />
        </span>
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">Lặt lá mai · Tết {pick.tetYear}</p>
          <p className="font-display text-2xl font-semibold">{when}</p>
          <p className="text-sm text-muted">
            Ngày gợi ý {fmtDate(pick.pickDate)} · Tết {fmtDate(pick.tet)} (còn {pick.daysToTet} ngày). Trời lạnh thì lặt sớm hơn vài ngày.
          </p>
        </div>
      </div>
      {!compact && mai.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-2">
          {mai.map((m) => {
            const ok = m.leafPickedYear === pick.tetYear;
            return (
              <li key={m.id}>
                <button
                  onClick={() => done(m.id)}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition ${
                    ok ? "bg-brand text-white" : "border border-amber-200 bg-white hover:border-brand"
                  }`}
                >
                  {ok && <Check size={14} strokeWidth={3} />} {m.name}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
