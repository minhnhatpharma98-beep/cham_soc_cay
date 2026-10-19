import type { Metadata } from "next";
import { Be_Vietnam_Pro, Fraunces } from "next/font/google";
import { Sprout } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { BottomNav, TopNav } from "@/components/Nav";
import ResetButton from "@/components/ResetButton";
import credits from "@/lib/credits.json";
import "./globals.css";

const body = Be_Vietnam_Pro({
  variable: "--font-be-vietnam",
  subsets: ["vietnamese", "latin"],
  weight: ["400", "500", "600", "700"],
});

const display = Fraunces({
  variable: "--font-fraunces",
  subsets: ["vietnamese", "latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Vườn nhà mình",
  description: "Theo dõi lịch chăm sóc cây cảnh và hồ cá tại nhà",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="vi" className={`${body.variable} ${display.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col pb-24 md:pb-0">
        <header className="sticky top-0 z-10 border-b border-line/70 bg-background/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-6">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-dark text-white shadow-soft">
                <Sprout size={20} strokeWidth={2} />
              </span>
              <span className="leading-tight">
                <span className="block font-display text-lg font-semibold">Vườn nhà mình</span>
                <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
                  Chăm cây · Nuôi cá
                </span>
              </span>
            </Link>
            <Suspense fallback={null}>
              <TopNav />
            </Suspense>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 md:px-6 md:py-8">{children}</main>

        <footer className="mt-10 border-t border-line">
          <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-muted md:px-6">
            <p className="font-display text-base font-semibold text-foreground">Vườn nhà mình</p>
            <p className="mt-1">Dữ liệu được lưu ngay trên trình duyệt của bạn.</p>
            <ResetButton />
            <p className="mt-3 text-xs">
              Ảnh minh họa từ Wikimedia Commons:{" "}
              {credits.map((c, i) => (
                <span key={c.key}>
                  <a href={c.url} target="_blank" rel="noreferrer" className="underline-offset-2 hover:underline">
                    {c.artist}
                  </a>{" "}
                  ({c.license}){i < credits.length - 1 ? ", " : "."}
                </span>
              ))}
            </p>
          </div>
        </footer>

        <Suspense fallback={null}>
          <BottomNav />
        </Suspense>
      </body>
    </html>
  );
}
