# 🌱 Vườn nhà mình

Web app nhỏ giúp chăm sóc cây cảnh và hồ cá tại nhà: nhắc việc mỗi ngày, ghi nhật ký, lưu ảnh, theo dõi chỉ số nước và xem cẩm nang theo từng loài.

Được làm cho một khu vườn thật ở Huế gồm 2 cây mai, 8 cây bông giấy, 6 cây hoa hồng, 2 cây sử quân tử và 10 hồ cá cảnh.

## Tính năng

- **Hôm nay**: gom các việc đến hạn hoặc trễ theo từng cây/hồ, bấm để đánh dấu xong.
- **Thời tiết Huế**: nhiệt độ hiện tại và dự báo 3 ngày (Open-Meteo). Ngày mưa từ 5mm gợi ý bỏ tưới; ngày nóng từ 35°C nhắc tưới thêm cho hoa hồng.
- **Lịch chăm sóc tùy chỉnh**: mỗi loài có lịch mặc định (tưới, bón phân, tỉa cành, thay nước...), sửa được chu kỳ, thêm hoặc xóa việc riêng.
- **Đếm ngược lặt lá mai**: tính ngày lặt lá gợi ý (khoảng 28 ngày trước Tết) và đánh dấu từng cây đã lặt.
- **Hồ cá**: loại cá, số cá, dung tích; ghi pH và nhiệt độ, biểu đồ theo thời gian có vùng an toàn và cảnh báo khi lệch.
- **Hồ sơ từng cây/hồ**: vị trí, ghi chú, nhật ký dạng dòng thời gian, nhiều ảnh. Ảnh đầu tiên thay ảnh minh họa.
- **Cẩm nang**: hướng dẫn ánh sáng, nước, phân bón, sâu bệnh cho từng loài.

## Dữ liệu được lưu ở đâu

Chưa có tài khoản hay máy chủ. Mọi dữ liệu nằm trong trình duyệt của bạn:

- Danh sách cây/hồ, lịch, nhật ký: `localStorage`
- Ảnh: IndexedDB

Vì vậy dữ liệu trên điện thoại và máy tính là riêng biệt, và xóa dữ liệu trình duyệt sẽ mất dữ liệu. Nút **"Tạo lại dữ liệu mẫu"** ở chân trang xóa tất cả và tạo lại dữ liệu mẫu.

## Chạy trên máy

Cần Node.js 20 trở lên.

```bash
npm install
npm run dev      # mở http://localhost:3000
```

Các lệnh khác:

```bash
npm run lint     # kiểm tra code
npm run build    # build bản production
npm run start    # chạy bản đã build
```

## Công nghệ

- [Next.js](https://nextjs.org) 16 (App Router), React 19, TypeScript
- [Tailwind CSS](https://tailwindcss.com) 4
- Icon: [lucide-react](https://lucide.dev)
- Font: Fraunces (tiêu đề) và Be Vietnam Pro (nội dung) qua `next/font`
- Lưu ảnh: [idb-keyval](https://github.com/jakearchibald/idb-keyval)
- Thời tiết: [Open-Meteo](https://open-meteo.com) (miễn phí, không cần API key)

## Cấu trúc thư mục

```
src/
  app/                 Các trang (App Router)
    page.tsx           Hôm nay
    cay/               Danh sách và chi tiết cây
    ho-ca/             Danh sách và chi tiết hồ cá
    cam-nang/          Cẩm nang theo loài
  components/          Thành phần giao diện (thẻ, biểu đồ, menu...)
  lib/
    data.ts            Kiểu dữ liệu, danh sách loài, lịch mặc định, cẩm nang
    store.ts           Lưu/đọc dữ liệu (localStorage)
    photos.ts          Lưu ảnh (IndexedDB)
    weather.ts         Thời tiết Huế
    tet.ts             Ngày Tết và ngày lặt lá mai
public/images/         Ảnh minh họa từng loài
```

## Triển khai

Deploy lên [Vercel](https://vercel.com/new): import repo này, giữ cài đặt mặc định cho Next.js, không cần biến môi trường.

## Kế hoạch tiếp theo

- Đồng bộ dữ liệu qua đám mây (Supabase) và đăng nhập để dùng chung trên nhiều thiết bị
- Cài như app trên điện thoại (PWA) và thông báo nhắc việc

## Ghi công ảnh

Ảnh minh họa lấy từ Wikimedia Commons, tác giả và giấy phép ghi trong `src/lib/credits.json` và ở chân trang web:

| Ảnh | Tác giả | Giấy phép |
|---|---|---|
| Mai (*Ochna integerrima*) | Prenn | CC BY-SA 3.0 |
| Bông giấy | Waran R Samay | CC BY 4.0 |
| Hoa hồng | Daderot | CC0 |
| Sử quân tử (*Combretum indicum*) | Prenn | CC BY-SA 3.0 |
| Cá neon | Holger Krisp | CC BY 3.0 |
| Ảnh vườn trang chủ | psyberartist | CC BY 2.0 |
