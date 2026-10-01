import { CustomerDetail } from "./CustomerDetail";

export default async function Page({ params }: { params: Promise<{ email: string }> }) {
  const { email } = await params;
  return <CustomerDetail email={decodeURIComponent(email)} />;
}
