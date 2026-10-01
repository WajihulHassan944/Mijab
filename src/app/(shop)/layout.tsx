import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { TabBar } from "@/components/TabBar";

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="page">
        <Header />
        <main>{children}</main>
        <Footer />
      </div>
      <TabBar />
    </>
  );
}
