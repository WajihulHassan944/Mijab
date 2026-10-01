import { Suspense } from "react";
import { OrdersClient } from "./OrdersClient";

export default function OrdersPage() {
  return (
    <Suspense>
      <OrdersClient />
    </Suspense>
  );
}
