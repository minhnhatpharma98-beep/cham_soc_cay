"use client";

import { seedDb } from "@/lib/data";
import { clearPhotos } from "@/lib/photos";
import { update } from "@/lib/store";

export default function ResetButton() {
  return (
    <button
      onClick={() => {
        if (!confirm("Xóa toàn bộ dữ liệu và ảnh, rồi tạo lại dữ liệu mẫu?")) return;
        void clearPhotos();
        update((d) => Object.assign(d, seedDb()));
      }}
      className="mt-2 text-xs font-semibold text-accent underline-offset-2 hover:underline"
    >
      Tạo lại dữ liệu mẫu
    </button>
  );
}
