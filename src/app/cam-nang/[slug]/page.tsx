import { ArrowLeft, Bug, Droplets, Leaf, type LucideIcon, Scissors, Sprout, Sun, Thermometer } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { taskIcon } from "@/components/icons";
import { SPECIES, speciesOf } from "@/lib/data";

export function generateStaticParams() {
  return SPECIES.map((s) => ({ slug: s.key }));
}

function sectionIcon(title: string): LucideIcon {
  const t = title.toLowerCase();
  if (t.includes("sáng")) return Sun;
  if (t.includes("nước")) return Droplets;
  if (t.includes("sâu") || t.includes("bệnh")) return Bug;
  if (t.includes("tỉa") || t.includes("lặt")) return Scissors;
  if (t.includes("phân")) return Sprout;
  if (t.includes("chỉ số")) return Thermometer;
  return Leaf;
}

export default async function Page({ params }: PageProps<"/cam-nang/[slug]">) {
  const { slug } = await params;
  const sp = speciesOf(slug);
  if (!sp) notFound();
  const related = SPECIES.filter((s) => s.key !== sp.key).slice(0, 3);

  return (
    <article className="space-y-8">
      <header className="relative overflow-hidden rounded-3xl shadow-lift">
        <div className="relative aspect-[16/10] md:aspect-[21/8]">
          <Image src={sp.image} alt={sp.label} fill priority sizes="(min-width: 1152px) 1152px, 100vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/10" />
        </div>
        <Link href="/cam-nang" className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-2 text-sm font-semibold backdrop-blur transition hover:bg-white">
          <ArrowLeft size={16} /> Cẩm nang
        </Link>
        <div className="absolute inset-x-0 bottom-0 p-6 text-white md:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/75">Cẩm nang · {sp.label}</p>
          <h1 className="mt-2 text-3xl font-semibold md:text-5xl">Cách chăm sóc {sp.label.toLowerCase()}</h1>
          <p className="mt-2 max-w-xl text-white/85">{sp.tagline}</p>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <nav className="h-fit rounded-3xl border border-line bg-white p-5 shadow-soft lg:sticky lg:top-24">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted">Nội dung</p>
          <ol className="space-y-1 text-sm">
            {sp.guide.map((g, i) => (
              <li key={g.title}>
                <a href={`#m${i}`} className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition hover:bg-background hover:text-brand">
                  <span className="text-xs font-semibold text-muted">{String(i + 1).padStart(2, "0")}</span> {g.title}
                </a>
              </li>
            ))}
            <li>
              <a href="#lich" className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition hover:bg-background hover:text-brand">
                <span className="text-xs font-semibold text-muted">{String(sp.guide.length + 1).padStart(2, "0")}</span> Lịch chăm sóc
              </a>
            </li>
          </ol>
        </nav>

        <div className="max-w-2xl space-y-4">
          {sp.guide.map((g, i) => {
            const Icon = sectionIcon(g.title);
            return (
              <section key={g.title} id={`m${i}`} className="scroll-mt-24 rounded-3xl border border-line bg-white p-6 shadow-soft">
                <h2 className="flex items-center gap-3 text-xl font-semibold">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-soft text-brand-dark">
                    <Icon size={20} strokeWidth={1.75} />
                  </span>
                  {g.title}
                </h2>
                <p className="mt-3 leading-relaxed text-foreground/85">{g.body}</p>
              </section>
            );
          })}

          <section id="lich" className="scroll-mt-24 rounded-3xl bg-brand-dark p-6 text-white shadow-soft">
            <h2 className="text-xl font-semibold">Lịch chăm sóc mặc định</h2>
            <p className="mt-1 text-sm text-white/70">Mỗi cây/hồ mới thêm sẽ tự có lịch này, bạn có thể đánh dấu xong ở trang Hôm nay.</p>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {sp.tasks.map((t) => {
                const Icon = taskIcon(t.label);
                return (
                  <li key={t.label} className="flex items-center gap-3 rounded-2xl bg-white/10 p-3">
                    <Icon size={18} strokeWidth={1.75} />
                    <span className="flex-1 text-sm">{t.label}</span>
                    <span className="text-xs font-semibold text-white/80">mỗi {t.everyDays} ngày</span>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>
      </div>

      <section>
        <h2 className="mb-4 text-2xl font-semibold">Bạn có thể tìm hiểu thêm</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {related.map((s) => (
            <Link key={s.key} href={`/cam-nang/${s.key}`} className="group flex items-center gap-3 rounded-3xl border border-line bg-white p-3 shadow-soft transition hover:shadow-lift">
              <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl">
                <Image src={s.image} alt="" fill sizes="64px" className="object-cover transition duration-500 group-hover:scale-110" />
              </span>
              <span className="font-semibold">Cách chăm sóc {s.label.toLowerCase()}</span>
            </Link>
          ))}
        </div>
      </section>
    </article>
  );
}
