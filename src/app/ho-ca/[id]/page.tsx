import { Suspense } from "react";
import ItemDetail from "@/components/ItemDetail";

export default function Page() {
  return (
    <Suspense fallback={<p>Đang tải...</p>}>
      <ItemDetail back="/ho-ca" />
    </Suspense>
  );
}
