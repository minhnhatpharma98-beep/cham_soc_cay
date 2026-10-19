"use client";

import { ArrowLeft, BookOpen, Camera, Check, MapPin, NotebookPen, Pencil, Plus, Thermometer, Trash, TriangleAlert, X } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { taskIcon } from "@/components/icons";
import LeafPickCard from "@/components/LeafPickCard";
import LogChart from "@/components/LogChart";
import PhotoImg from "@/components/PhotoImg";
import { daysSince, speciesOf, Task, todayStr } from "@/lib/data";
import { deletePhotos, savePhoto, usePhotoUrl } from "@/lib/photos";
import { update, useDb } from "@/lib/store";
import { fmtDate, nextLeafPick } from "@/lib/tet";

const PH_SAFE: [number, number] = [6.5, 7.8];
const TEMP_SAFE: [number, number] = [23, 29];

function resize(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, 1400 / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = img.width * scale;
      c.height = img.height * scale;
      c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      c.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), "image/jpeg", 0.8);
    };
    img.onerror = reject;
    img.src = url;
  });
}

function Thumb({ photo, onRemove }: { photo: string; onRemove: () => void }) {
  const url = usePhotoUrl(photo);
  return (
    <div className="group relative aspect-square overflow-hidden rounded-2xl bg-background">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {url && <img src={url} alt="" className="h-full w-full object-cover" />}
      <button onClick={onRemove} aria-label="Xóa ảnh" className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition group-hover:opacity-100">
        <X size={12} />
      </button>
    </div>
  );
}

const card = "rounded-3xl border border-line bg-white p-5 shadow-soft md:p-6";
const field = "rounded-2xl bg-background px-4 py-3 text-sm outline-none placeholder:text-muted focus:ring-2 focus:ring-brand/30";

export default function ItemDetail({ back }: { back: string }) {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { db, ready } = useDb();
  const [text, setText] = useState("");
  const [ph, setPh] = useState("");
  const [temp, setTemp] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState({ label: "", days: "" });
  const [adding, setAdding] = useState(false);
  if (!ready) return <div className="h-72 animate-pulse rounded-3xl bg-white" />;

  const item = db.items.find((i) => i.id === id);
  if (!item)
    return (
      <p>
        Không tìm thấy. <Link href={back} className="text-brand underline">Quay lại</Link>
      </p>
    );

  const sp = speciesOf(item.species);
  const tasks = db.tasks.filter((t) => t.itemId === id);
  const logs = db.logs.filter((l) => l.itemId === id).sort((a, b) => b.date.localeCompare(a.date));
  const isTank = item.kind === "tank";
  const pick = item.species === "mai" ? nextLeafPick(todayStr()) : null;

  const patch = (p: Partial<typeof item>) => update((d) => void Object.assign(d.items.find((i) => i.id === id)!, p));
  const patchTask = (tid: string, p: Partial<Task>) => update((d) => void Object.assign(d.tasks.find((t) => t.id === tid)!, p));

  const startEdit = (t?: Task) => {
    setDraft({ label: t?.label ?? "", days: t ? String(t.everyDays) : "" });
    setEditing(t?.id ?? null);
    setAdding(!t);
  };
  const closeEdit = () => {
    setEditing(null);
    setAdding(false);
  };
  const saveTask = () => {
    const days = Math.round(Number(draft.days));
    if (!draft.label.trim() || !(days >= 1)) return;
    if (editing) patchTask(editing, { label: draft.label.trim(), everyDays: days });
    else
      update((d) =>
        void d.tasks.push({ id: crypto.randomUUID(), itemId: id, label: draft.label.trim(), everyDays: days, lastDone: todayStr() }),
      );
    closeEdit();
  };

  const addLog = () => {
    if (!text.trim() && !ph && !temp) return;
    update((d) =>
      void d.logs.push({
        id: crypto.randomUUID(),
        itemId: id,
        date: todayStr(),
        text: text.trim(),
        ph: ph ? Number(ph) : undefined,
        temp: temp ? Number(temp) : undefined,
      }),
    );
    setText("");
    setPh("");
    setTemp("");
  };

  const remove = () => {
    if (!confirm(`Xóa "${item.name}"?`)) return;
    deletePhotos(item.photos);
    update((d) => {
      d.items = d.items.filter((i) => i.id !== id);
      d.tasks = d.tasks.filter((t) => t.itemId !== id);
      d.logs = d.logs.filter((l) => l.itemId !== id);
    });
    router.push(back);
  };

  const lastPh = logs.find((l) => l.ph !== undefined)?.ph;
  const lastTemp = logs.find((l) => l.temp !== undefined)?.temp;
  const alerts: string[] = [];
  if (isTank) {
    if (lastPh !== undefined && (lastPh < PH_SAFE[0] || lastPh > PH_SAFE[1])) alerts.push(`pH ${lastPh} đang lệch khỏi mức an toàn ${PH_SAFE[0]}–${PH_SAFE[1]}`);
    if (lastTemp !== undefined && (lastTemp < TEMP_SAFE[0] || lastTemp > TEMP_SAFE[1])) alerts.push(`Nhiệt độ ${lastTemp}°C đang lệch khỏi mức ${TEMP_SAFE[0]}–${TEMP_SAFE[1]}°C`);
  }
  const series = (key: "ph" | "temp") =>
    [...logs]
      .reverse()
      .filter((l) => l[key] !== undefined)
      .map((l) => ({ date: l.date, value: l[key]! }));
  const phSeries = series("ph");
  const tempSeries = series("temp");

  const taskForm = (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-background p-3">
      <input autoFocus value={draft.label} onChange={(e) => setDraft({ ...draft, label: e.target.value })} placeholder="Tên việc, vd: Phun nước lá" className={`${field} min-w-0 flex-1 basis-40 bg-white`} />
      <label className="flex items-center gap-2 text-sm text-muted">
        Mỗi
        <input value={draft.days} onChange={(e) => setDraft({ ...draft, days: e.target.value })} onKeyDown={(e) => e.key === "Enter" && saveTask()} inputMode="numeric" className={`${field} w-20 bg-white text-center`} />
        ngày
      </label>
      <button onClick={saveTask} className="rounded-2xl bg-brand px-4 py-3 text-sm font-semibold text-white hover:bg-brand-dark">Lưu</button>
      <button onClick={closeEdit} className="rounded-2xl px-3 py-3 text-sm font-semibold text-muted hover:text-foreground">Hủy</button>
    </div>
  );

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl shadow-lift">
        <div className="relative aspect-[16/10] md:aspect-[21/8]">
          <PhotoImg photo={item.photos[0]} fallback={sp?.image ?? ""} alt={item.name} priority sizes="(min-width: 1152px) 1152px, 100vw" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/10" />
        </div>
        <div className="absolute inset-x-0 top-0 flex justify-between p-4">
          <Link href={back} className="flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-2 text-sm font-semibold backdrop-blur transition hover:bg-white">
            <ArrowLeft size={16} /> Quay lại
          </Link>
          <button onClick={remove} aria-label="Xóa" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-accent backdrop-blur transition hover:bg-white">
            <Trash size={16} />
          </button>
        </div>
        <div className="absolute inset-x-0 bottom-0 p-5 text-white md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/75">{sp?.label}</p>
          <input
            value={item.name}
            onChange={(e) => patch({ name: e.target.value })}
            className="w-full bg-transparent font-display text-3xl font-semibold outline-none md:text-5xl"
          />
          <p className="mt-1 flex flex-wrap items-center gap-x-3 text-sm text-white/80">
            {item.location && (
              <span className="flex items-center gap-1"><MapPin size={14} /> {item.location}</span>
            )}
            <span>Thêm ngày {fmtDate(item.createdAt)}</span>
          </p>
        </div>
      </section>

      {alerts.map((a) => (
        <p key={a} className="flex items-center gap-3 rounded-2xl border border-accent/30 bg-accent-soft p-4 text-sm font-medium text-accent">
          <TriangleAlert size={18} /> {a}
        </p>
      ))}

      {pick && <LeafPickCard pick={pick} mai={[item]} />}

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          {isTank && (
            <>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "pH gần nhất", value: lastPh ?? "—", hint: `An toàn ${PH_SAFE[0]}–${PH_SAFE[1]}` },
                  { label: "Nhiệt độ gần nhất", value: lastTemp !== undefined ? `${lastTemp}°C` : "—", hint: `An toàn ${TEMP_SAFE[0]}–${TEMP_SAFE[1]}°C` },
                ].map((m) => (
                  <div key={m.label} className="rounded-3xl border border-line bg-white p-5 shadow-soft">
                    <p className="flex items-center gap-1.5 text-sm text-muted"><Thermometer size={14} /> {m.label}</p>
                    <p className="mt-1 font-display text-4xl font-semibold">{m.value}</p>
                    <p className="mt-1 text-xs text-muted">{m.hint}</p>
                  </div>
                ))}
              </div>
              {(phSeries.length > 0 || tempSeries.length > 0) && (
                <div className="grid gap-3 sm:grid-cols-2">
                  {phSeries.length > 0 && <LogChart title="pH" unit="" points={phSeries} safe={PH_SAFE} />}
                  {tempSeries.length > 0 && <LogChart title="Nhiệt độ" unit="°C" points={tempSeries} safe={TEMP_SAFE} />}
                </div>
              )}
            </>
          )}

          <section className={card}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Lịch chăm sóc</h2>
              {!adding && (
                <button onClick={() => startEdit()} className="flex items-center gap-1 rounded-full border border-line px-3 py-1.5 text-sm font-semibold text-brand-dark transition hover:bg-brand-soft">
                  <Plus size={16} /> Thêm việc
                </button>
              )}
            </div>
            <ul className="space-y-2">
              {adding && <li>{taskForm}</li>}
              {tasks.map((t) => {
                if (editing === t.id)
                  return (
                    <li key={t.id} className="space-y-2">
                      {taskForm}
                      <button
                        onClick={() => {
                          if (!confirm(`Xóa việc "${t.label}"?`)) return;
                          update((d) => void (d.tasks = d.tasks.filter((x) => x.id !== t.id)));
                          closeEdit();
                        }}
                        className="flex items-center gap-1 px-2 text-xs font-semibold text-accent hover:underline"
                      >
                        <Trash size={12} /> Xóa việc này
                      </button>
                    </li>
                  );
                const left = t.everyDays - daysSince(t.lastDone);
                const Icon = taskIcon(t.label);
                const pct = Math.max(0, Math.min(100, ((t.everyDays - left) / t.everyDays) * 100));
                return (
                  <li key={t.id} className="group flex items-center gap-3 rounded-2xl bg-background p-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-brand shadow-soft">
                      <Icon size={18} strokeWidth={1.75} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="text-sm font-semibold">{t.label}</p>
                        <p className={`text-xs font-semibold ${left <= 0 ? "text-accent" : "text-muted"}`}>
                          {left <= 0 ? "Đến hạn" : `Còn ${left} ngày`}
                        </p>
                      </div>
                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-line">
                        <div className={`h-full rounded-full ${left <= 0 ? "bg-accent" : "bg-brand"}`} style={{ width: `${pct}%` }} />
                      </div>
                      <p className="mt-1 text-[11px] text-muted">Mỗi {t.everyDays} ngày · lần cuối {fmtDate(t.lastDone)}</p>
                    </div>
                    <button onClick={() => startEdit(t)} aria-label="Sửa việc" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted transition hover:bg-white hover:text-foreground">
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => patchTask(t.id, { lastDone: todayStr() })}
                      aria-label="Đánh dấu xong"
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-line text-muted transition hover:border-brand hover:bg-brand hover:text-white"
                    >
                      <Check size={16} strokeWidth={3} />
                    </button>
                  </li>
                );
              })}
              {tasks.length === 0 && !adding && <li className="rounded-2xl bg-background p-4 text-center text-sm text-muted">Chưa có việc nào.</li>}
            </ul>
          </section>

          <section className={card}>
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
              <NotebookPen size={20} className="text-brand" /> Nhật ký
            </h2>
            <div className="mb-5 flex flex-wrap gap-2">
              <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addLog()} placeholder="Hôm nay cây/hồ thế nào?" className={`${field} min-w-0 flex-1 basis-60`} />
              {isTank && (
                <>
                  <input value={ph} onChange={(e) => setPh(e.target.value)} placeholder="pH" inputMode="decimal" className={`${field} w-24`} />
                  <input value={temp} onChange={(e) => setTemp(e.target.value)} placeholder="°C" inputMode="decimal" className={`${field} w-24`} />
                </>
              )}
              <button onClick={addLog} className="rounded-2xl bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark">Ghi lại</button>
            </div>
            {logs.length === 0 ? (
              <p className="rounded-2xl bg-background p-4 text-center text-sm text-muted">Chưa có ghi chép nào.</p>
            ) : (
              <ol className="relative space-y-4 border-l-2 border-line pl-5">
                {logs.map((l) => (
                  <li key={l.id} className="group relative">
                    <span className="absolute -left-[27px] top-1.5 h-3 w-3 rounded-full border-2 border-white bg-brand" />
                    <p className="text-xs font-semibold text-muted">{fmtDate(l.date)}</p>
                    <div className="flex items-start gap-2">
                      <p className="flex-1 text-sm">
                        {l.text}
                        {l.ph !== undefined && <span className="ml-2 rounded-full bg-sky-100 px-2 py-0.5 text-xs font-semibold text-sky-800">pH {l.ph}</span>}
                        {l.temp !== undefined && <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">{l.temp}°C</span>}
                      </p>
                      <button onClick={() => update((d) => void (d.logs = d.logs.filter((x) => x.id !== l.id)))} aria-label="Xóa ghi chép" className="text-muted opacity-0 transition group-hover:opacity-100 hover:text-accent">
                        <X size={16} />
                      </button>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>

        <aside className="space-y-6">
          <section className={card}>
            <h2 className="mb-4 text-xl font-semibold">Thông tin</h2>
            <label className="mb-1 block text-xs font-semibold text-muted">Vị trí</label>
            <input value={item.location} onChange={(e) => patch({ location: e.target.value })} placeholder="Sân trước, ban công..." className={`${field} mb-3 w-full`} />
            {isTank && (
              <>
                <label className="mb-1 block text-xs font-semibold text-muted">Loại cá</label>
                <input value={item.fishType ?? ""} onChange={(e) => patch({ fishType: e.target.value || undefined })} placeholder="Neon, bảy màu, cá vàng..." className={`${field} mb-3 w-full`} />
                <div className="mb-3 grid grid-cols-2 gap-2">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-muted">Số cá</label>
                    <input value={item.fishCount ?? ""} onChange={(e) => patch({ fishCount: e.target.value ? Number(e.target.value) || undefined : undefined })} inputMode="numeric" placeholder="vd: 12" className={`${field} w-full`} />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-muted">Dung tích (lít)</label>
                    <input value={item.volume ?? ""} onChange={(e) => patch({ volume: e.target.value ? Number(e.target.value) || undefined : undefined })} inputMode="numeric" placeholder="vd: 60" className={`${field} w-full`} />
                  </div>
                </div>
              </>
            )}
            <label className="mb-1 block text-xs font-semibold text-muted">Ghi chú</label>
            <textarea value={item.note} onChange={(e) => patch({ note: e.target.value })} placeholder="Giống, nơi mua, đặc điểm..." rows={3} className={`${field} w-full`} />
          </section>

          <section className={card}>
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
              <Camera size={20} className="text-brand" /> Ảnh của bạn
            </h2>
            <div className="grid grid-cols-3 gap-2">
              {item.photos.map((p) => (
                <Thumb
                  key={p}
                  photo={p}
                  onRemove={() => {
                    deletePhotos([p]);
                    patch({ photos: item.photos.filter((x) => x !== p) });
                  }}
                />
              ))}
              <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-line text-muted transition hover:border-brand hover:text-brand">
                <Camera size={20} />
                <span className="text-[11px] font-semibold">Thêm ảnh</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={async (e) => {
                    const files = [...(e.target.files ?? [])];
                    e.target.value = "";
                    const ids = await Promise.all(files.map(async (f) => savePhoto(await resize(f))));
                    if (ids.length) update((d) => void d.items.find((i) => i.id === id)!.photos.push(...ids));
                  }}
                />
              </label>
            </div>
            {item.photos.length === 0 && <p className="mt-3 text-xs text-muted">Ảnh đầu tiên bạn thêm sẽ thay ảnh minh họa.</p>}
          </section>

          {sp && (
            <Link href={`/cam-nang/${sp.key}`} className="group flex items-center gap-3 rounded-3xl bg-brand-dark p-5 text-white shadow-soft transition hover:shadow-lift">
              <BookOpen size={22} />
              <span className="flex-1">
                <span className="block text-xs text-white/70">Cẩm nang</span>
                <span className="font-semibold">Cách chăm sóc {sp.label.toLowerCase()}</span>
              </span>
              <span className="transition group-hover:translate-x-1">→</span>
            </Link>
          )}
        </aside>
      </div>
    </div>
  );
}
