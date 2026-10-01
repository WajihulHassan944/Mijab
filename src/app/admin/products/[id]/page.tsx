import { ProductEdit } from "./ProductEdit";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProductEdit id={id} />;
}
