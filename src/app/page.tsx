"use client";

import { ArrowRight, Check, ClipboardList, Clock, CloudRain, Fish, Flame, Sprout } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { taskIcon } from "@/components/icons";
import LeafPickCard from "@/components/LeafPickCard";
import PhotoImg from "@/components/PhotoImg";
import WeatherCard from "@/components/WeatherCard";
import { daysSince, Item, SPECIES, speciesOf, Task, todayStr } from "@/lib/data";
import { update, useDb } from "@/lib/store";
import { nextLeafPick } from "@/lib/tet";
import { HOT_DAY_C, RAIN_SKIP_MM, useWeather } from "@/lib/weather";

const WEEKDAYS = ["Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy"];

function greeting(h: number) {
  if (h < 11) return "Chào buổi sáng";
  if (h < 14) return "Chào buổi trưa";
  if (h < 18) return "Chào buổi chiều";
  return "Chào buổi tối";
}

export default function Today() {
  const { db, ready } = useDb();
  const weather = useWeather();
  if (!ready) return <div className="h-64 animate-pulse rounded-3xl bg-white" />;

  const now = new Date();
  const due = db.tasks
    .map((t) => ({ t, item: db.items.find((i) => i.id === t.itemId)!, over: daysSince(t.lastDone) - t.everyDays }))
    .filter((x) => x.item && x.over >= 0);

  // Group due tasks by the plant or tank they belong to.
  const groups = new Map<string, { item: Item; tasks: { t: Task; over: number }[] }>();
  for (const d of due) {
    const g = groups.get(d.item.id) ?? { item: d.item, tasks: [] };
    g.tasks.push({ t: d.t, over: d.over });
    groups.set(d.item.id, g);
  }
  const grouped = [...groups.values()].sort(
    (a, b) => Math.max(...b.tasks.map((x) => x.over)) - Math.max(...a.tasks.map((x) => x.over)),
  );

  const plants = db.items.filter((i) => i.kind === "plant").length;
  const tanks = db.items.filter((i) => i.kind === "tank").length;
  const late = due.filter((d) => d.over > 0).length;

  const todayW = weather?.days[0];
  const rainy = !!todayW && todayW.rain >= RAIN_SKIP_MM;
  const hot = !!todayW && todayW.max >= HOT_DAY_C;
  const hint = (item: Item, t: Task) => {
    if (item.kind !== "plant" || !t.label.toLowerCase().includes("tưới")) return null;
    if (rainy) return { icon: CloudRain, text: `Mưa ${todayW!.rain}mm hôm nay, có thể bỏ qua` };
    if (hot && item.species === "hoa-hong") return { icon: Flame, text: "Nắng nóng, tưới thêm buổi chiều" };
    return null;
  };

  const pick = nextLeafPick(todayStr());
  const mai = db.items.filter((i) => i.species === "mai");
  const showPick = pick && mai.length > 0 && pick.daysToPick <= 45 && mai.some((m) => m.leafPickedYear !== pick.tetYear);

  const markDone = (ids: string[]) =>
    update((d) => {
      for (const t of d.tasks) if (ids.includes(t.id)) t.lastDone = todayStr();
    });

  const stats = [
    { label: "Cây cảnh", value: plants, href: "/cay", icon: Sprout, tone: "bg-brand-soft text-brand-dark" },
    { label: "Hồ cá", value: tanks, href: "/ho-ca", icon: Fish, tone: "bg-sky-100 text-sky-800" },
    { label: "Việc hôm nay", value: due.length, href: "#viec", icon: ClipboardList, tone: "bg-amber-100 text-amber-800" },
    { label: "Đang trễ", value: late, href: "#viec", icon: Clock, tone: "bg-accent-soft text-accent" },
  ];

  return (
    <div className="space-y-10">
      <section className="animate-rise relative overflow-hidden rounded-3xl shadow-lift">
        <Image src="/images/hero.jpg" alt="" fill priority sizes="(min-width: 1152px) 1152px, 100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-dark/90 via-brand-dark/60 to-transparent" />
        <div className="relative px-6 py-12 text-white md:px-10 md:py-16">
          <p className="text-sm font-medium text-white/80">
            {WEEKDAYS[now.getDay()]}, {now.getDate()}/{now.getMonth() + 1}/{now.getFullYear()}
          </p>
          <h1 className="mt-2 max-w-lg text-3xl font-semibold leading-tight md:text-5xl">
            {greeting(now.getHours())}, khu vườn đang chờ bạn
          </h1>
          <p className="mt-3 max-w-md text-white/85">
            {due.length === 0
              ? "Mọi cây và hồ cá đều đã được chăm sóc. Nghỉ ngơi thôi!"
              : `Hôm nay có ${due.length} việc cho ${grouped.length} cây và hồ cá.`}
          </p>
          {due.length > 0 && (
            <a href="#viec" className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-brand-dark transition hover:gap-3">
              Bắt đầu chăm sóc <ArrowRight size={16} />
            </a>
          )}
        </div>
      </section>

      {weather && <WeatherCard weather={weather} />}
      {showPick && <LeafPickCard pick={pick} mai={mai} />}

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {stats.map((s, i) => (
          <Link
            key={s.label}
            href={s.href}
            style={{ animationDelay: `${i * 60}ms` }}
            className="animate-rise group rounded-3xl border border-line bg-white p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift"
          >
            <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${s.tone}`}>
              <s.icon size={20} strokeWidth={1.75} />
            </span>
            <p className="mt-4 font-display text-4xl font-semibold">{s.value}</p>
            <p className="text-sm text-muted">{s.label}</p>
          </Link>
        ))}
      </section>

      <section id="viec" className="scroll-mt-24">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-semibold md:text-3xl">Việc cần làm</h2>
            <p className="text-sm text-muted">Bấm vào từng việc để đánh dấu đã xong</p>
          </div>
        </div>

        {grouped.length === 0 && (
          <div className="rounded-3xl border border-dashed border-line bg-white p-10 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-soft text-brand">
              <Check size={28} />
            </span>
            <p className="mt-3 font-display text-xl font-semibold">Xong hết rồi!</p>
            <p className="text-sm text-muted">Không còn việc nào đến hạn hôm nay.</p>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          {grouped.map(({ item, tasks }) => (
            <article key={item.id} className="overflow-hidden rounded-3xl border border-line bg-white shadow-soft">
              <div className="flex items-center gap-3 p-4">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl">
                  <PhotoImg photo={item.photos[0]} fallback={speciesOf(item.species)?.image ?? ""} alt="" sizes="56px" />
                </div>
                <div className="min-w-0 flex-1">
                  <Link href={`/${item.kind === "plant" ? "cay" : "ho-ca"}/${item.id}`} className="font-semibold hover:text-brand">
                    {item.name}
                  </Link>
                  <p className="text-xs text-muted">
                    {speciesOf(item.species)?.label} · {tasks.length} việc
                  </p>
                </div>
                {tasks.length > 1 && (
                  <button
                    onClick={() => markDone(tasks.map((x) => x.t.id))}
                    className="rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-brand-dark transition hover:bg-brand-soft"
                  >
                    Xong tất cả
                  </button>
                )}
              </div>
              <ul className="border-t border-line">
                {tasks.map(({ t, over }) => {
                  const Icon = taskIcon(t.label);
                  const h = hint(item, t);
                  return (
                    <li key={t.id}>
                      <button
                        onClick={() => markDone([t.id])}
                        className="group flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-background"
                      >
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-background text-brand">
                          <Icon size={18} strokeWidth={1.75} />
                        </span>
                        <span className="flex-1">
                          <span className="block text-sm font-medium">{t.label}</span>
                          {h && (
                            <span className="mt-0.5 flex items-center gap-1 text-xs text-sky-700">
                              <h.icon size={12} /> {h.text}
                            </span>
                          )}
                        </span>
                        <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${over > 0 ? "bg-accent-soft text-accent" : "bg-brand-soft text-brand-dark"}`}>
                          {over > 0 ? `Trễ ${over} ngày` : "Hôm nay"}
                        </span>
                        <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-line text-transparent transition group-hover:border-brand group-hover:bg-brand group-hover:text-white">
                          <Check size={14} strokeWidth={3} />
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between">
          <h2 className="text-2xl font-semibold md:text-3xl">Cẩm nang chăm sóc</h2>
          <Link href="/cam-nang" className="flex items-center gap-1 text-sm font-semibold text-brand hover:gap-2">
            Xem tất cả <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SPECIES.slice(0, 3).map((s) => (
            <Link key={s.key} href={`/cam-nang/${s.key}`} className="group overflow-hidden rounded-3xl border border-line bg-white shadow-soft transition hover:shadow-lift">
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image src={s.image} alt={s.label} fill sizes="(min-width: 1024px) 380px, 50vw" className="object-cover transition duration-500 group-hover:scale-105" />
              </div>
              <div className="p-5">
                <h3 className="text-lg font-semibold">Cách chăm sóc {s.label.toLowerCase()}</h3>
                <p className="mt-1 text-sm text-muted">{s.tagline}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
