export type Kind = "plant" | "tank";

export type Item = {
  id: string;
  kind: Kind;
  species: string;
  name: string;
  location: string;
  note: string;
  photos: string[]; // "photo:<uuid>" ids stored in IndexedDB (see photos.ts)
  createdAt: string;
  leafPickedYear?: number; // mai: Tết year whose leaf-picking is done
  volume?: number; // tank: litres
  fishType?: string;
  fishCount?: number;
};

export type Task = {
  id: string;
  itemId: string;
  label: string;
  everyDays: number;
  lastDone: string; // yyyy-mm-dd
};

export type Log = {
  id: string;
  itemId: string;
  date: string;
  text: string;
  ph?: number;
  temp?: number;
};

export type Db = { items: Item[]; tasks: Task[]; logs: Log[] };

export type Species = {
  key: string;
  kind: Kind;
  label: string;
  emoji: string;
  image: string;
  tagline: string;
  tasks: { label: string; everyDays: number }[];
  guide: { title: string; body: string }[];
};

export const SPECIES: Species[] = [
  {
    key: "mai",
    kind: "plant",
    label: "Mai",
    emoji: "🌼",
    image: "/images/mai.jpg",
    tagline: "Sắc vàng ngày Tết, cần nắng và lặt lá đúng lúc.",
    tasks: [
      { label: "Tưới nước", everyDays: 2 },
      { label: "Bón phân", everyDays: 30 },
      { label: "Kiểm tra sâu bệnh", everyDays: 14 },
    ],
    guide: [
      { title: "Ánh sáng", body: "Cần nắng đầy đủ, ít nhất 6 giờ mỗi ngày." },
      { title: "Nước", body: "Tưới vừa phải, tránh úng gốc. Giảm nước khi chuẩn bị lặt lá." },
      { title: "Lặt lá", body: "Lặt lá khoảng 25–30 ngày trước Tết (quanh rằm tháng Chạp) để mai nở đúng dịp. Trời lạnh, ít nắng thì lặt sớm hơn vài ngày; trời nóng thì lặt muộn hơn. Trước khi lặt nên ngưng tưới vài ngày cho lá héo nhẹ để dễ lặt và kích nụ." },
      { title: "Sâu bệnh", body: "Hay gặp rệp sáp, nấm lá; phun thuốc phòng định kỳ." },
    ],
  },
  {
    key: "bong-giay",
    kind: "plant",
    label: "Bông giấy",
    emoji: "🌺",
    image: "/images/bong-giay.jpg",
    tagline: "Ưa nắng, chịu hạn, càng khô càng nhiều hoa.",
    tasks: [
      { label: "Tưới nước", everyDays: 3 },
      { label: "Bón phân", everyDays: 30 },
      { label: "Tỉa cành", everyDays: 45 },
    ],
    guide: [
      { title: "Ánh sáng", body: "Ưa nắng gắt, thiếu nắng sẽ ít hoa." },
      { title: "Nước", body: "Chịu hạn tốt. Tưới ít, để đất khô giữa hai lần tưới; hạn chế nước để kích hoa." },
      { title: "Tỉa cành", body: "Tỉa sau mỗi đợt hoa để cây ra chồi mới." },
      { title: "Phân bón", body: "Dùng phân giàu kali (NPK nhiều K) khi cây chuẩn bị ra hoa." },
    ],
  },
  {
    key: "hoa-hong",
    kind: "plant",
    label: "Hoa hồng",
    emoji: "🌹",
    image: "/images/hoa-hong.jpg",
    tagline: "Nữ hoàng của vườn, cần nắng sáng và phòng bệnh đều.",
    tasks: [
      { label: "Tưới nước", everyDays: 1 },
      { label: "Bón phân", everyDays: 15 },
      { label: "Phun thuốc phòng bệnh", everyDays: 10 },
      { label: "Tỉa cành, cắt hoa tàn", everyDays: 14 },
    ],
    guide: [
      { title: "Ánh sáng", body: "Cần 5–6 giờ nắng, ưu tiên nắng sáng." },
      { title: "Nước", body: "Tưới gốc vào buổi sáng, tránh làm ướt lá để hạn chế nấm." },
      { title: "Sâu bệnh", body: "Dễ bị đốm đen, phấn trắng, rệp. Phun thuốc phòng định kỳ." },
      { title: "Tỉa", body: "Cắt hoa tàn và cành yếu để cây ra nụ liên tục." },
    ],
  },
  {
    key: "su-quan-tu",
    kind: "plant",
    label: "Sử quân tử",
    emoji: "🌿",
    image: "/images/su-quan-tu.jpg",
    tagline: "Dây leo hoa chùm đổi màu trắng – hồng – đỏ.",
    tasks: [
      { label: "Tưới nước", everyDays: 2 },
      { label: "Bón phân", everyDays: 30 },
      { label: "Tỉa cành", everyDays: 60 },
    ],
    guide: [
      { title: "Ánh sáng", body: "Ưa nắng nhẹ đến nắng nhiều, chịu được nửa bóng." },
      { title: "Nước", body: "Giữ ẩm đều, không để úng. Cây leo cần giàn hoặc trụ bám." },
      { title: "Tỉa cành", body: "Tỉa bớt cành già để cây ra hoa nhiều hơn." },
    ],
  },
  {
    key: "ca-canh",
    kind: "tank",
    label: "Hồ cá cảnh",
    emoji: "🐠",
    image: "/images/ca-canh.jpg",
    tagline: "Nước sạch, chỉ số ổn định là cá khỏe.",
    tasks: [
      { label: "Cho ăn", everyDays: 1 },
      { label: "Thay 20–30% nước", everyDays: 7 },
      { label: "Vệ sinh lọc", everyDays: 30 },
      { label: "Đo pH và nhiệt độ", everyDays: 7 },
    ],
    guide: [
      { title: "Cho ăn", body: "Cho ăn lượng vừa, cá ăn hết trong 2–3 phút. Thừa thức ăn làm bẩn nước." },
      { title: "Thay nước", body: "Thay 20–30% mỗi tuần bằng nước đã xử lý clo, cùng nhiệt độ với hồ." },
      { title: "Chỉ số nước", body: "pH thường 6.5–7.5, nhiệt độ 24–28°C với đa số cá nhiệt đới." },
      { title: "Cá bệnh", body: "Cá lờ đờ, nổi đốm trắng, xơ vây: cách ly và kiểm tra chất lượng nước trước." },
    ],
  },
];

export const speciesOf = (key: string) => SPECIES.find((s) => s.key === key);

/** yyyy-mm-dd in the device's local time zone (toISOString would use UTC). */
export function isoDate(d: Date) {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

const today = () => isoDate(new Date());

export function seedDb(): Db {
  const plan: [string, number][] = [
    ["mai", 2],
    ["bong-giay", 8],
    ["hoa-hong", 6],
    ["su-quan-tu", 2],
    ["ca-canh", 10],
  ];
  const db: Db = { items: [], tasks: [], logs: [] };
  for (const [key, n] of plan) {
    const sp = speciesOf(key)!;
    for (let i = 1; i <= n; i++) {
      const item = addItem(db, key, `${sp.kind === "tank" ? "Hồ" : sp.label} ${i}`);
      void item;
    }
  }
  // Spread seeded tasks across their cycle so only some are due today, like a real garden.
  db.tasks.forEach((t, i) => {
    const ago = (i * 7) % (t.everyDays + 1);
    t.lastDone = isoDate(new Date(Date.now() - ago * 86400000));
  });
  return db;
}

export function addItem(db: Db, speciesKey: string, name: string): Item {
  const sp = speciesOf(speciesKey)!;
  const item: Item = {
    id: crypto.randomUUID(),
    kind: sp.kind,
    species: speciesKey,
    name,
    location: "",
    note: "",
    photos: [],
    createdAt: today(),
  };
  db.items.push(item);
  for (const t of sp.tasks) {
    db.tasks.push({
      id: crypto.randomUUID(),
      itemId: item.id,
      label: t.label,
      everyDays: t.everyDays,
      lastDone: today(),
    });
  }
  return item;
}

export const todayStr = today;

export function daysSince(date: string) {
  const a = new Date(date + "T00:00:00").getTime();
  const b = new Date(today() + "T00:00:00").getTime();
  return Math.round((b - a) / 86400000);
}

/** The date `days` days before today. */
export function dateAgo(days: number) {
  return new Date(Date.now() - days * 86400000);
}
