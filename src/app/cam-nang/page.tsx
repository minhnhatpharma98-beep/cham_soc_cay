import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { SPECIES } from "@/lib/data";

export default function Page() {
  const [first, ...rest] = SPECIES;
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold md:text-4xl">Cẩm nang chăm sóc</h1>
        <p className="mt-1 text-muted">Hướng dẫn ngắn gọn cho từng loài trong vườn và hồ cá của bạn</p>
      </div>

      <Link href={`/cam-nang/${first.key}`} className="group relative block overflow-hidden rounded-3xl shadow-lift">
        <div className="relative aspect-[16/10] md:aspect-[21/8]">
          <Image src={first.image} alt={first.label} fill priority sizes="(min-width: 1152px) 1152px, 100vw" className="object-cover transition duration-700 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        </div>
        <div className="absolute inset-x-0 bottom-0 p-6 text-white md:p-10">
          <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur">Nổi bật</span>
          <h2 className="mt-3 text-2xl font-semibold md:text-4xl">Cách chăm sóc {first.label.toLowerCase()}</h2>
          <p className="mt-1 max-w-lg text-white/85">{first.tagline}</p>
        </div>
      </Link>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {rest.map((s) => (
          <Link key={s.key} href={`/cam-nang/${s.key}`} className="group overflow-hidden rounded-3xl border border-line bg-white shadow-soft transition hover:-translate-y-1 hover:shadow-lift">
            <div className="relative aspect-[4/3] overflow-hidden">
              <Image src={s.image} alt={s.label} fill sizes="(min-width: 1024px) 280px, 50vw" className="object-cover transition duration-500 group-hover:scale-105" />
            </div>
            <div className="p-5">
              <h3 className="text-lg font-semibold">Cách chăm sóc {s.label.toLowerCase()}</h3>
              <p className="mt-1 text-sm text-muted">{s.tagline}</p>
              <p className="mt-3 flex items-center gap-1 text-sm font-semibold text-brand transition-all group-hover:gap-2">
                Đọc tiếp <ArrowRight size={14} />
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
