import type { Metadata } from "next";
import "./admin.css";
import { AdminProvider } from "@/lib/admin-store";
import { AdminShell } from "@/components/admin/Shell";

export const metadata: Metadata = { title: { default: "Admin", template: "%s · MIJAB Admin" }, robots: { index: false, follow: false } };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminProvider>
      <AdminShell>{children}</AdminShell>
    </AdminProvider>
  );
}
