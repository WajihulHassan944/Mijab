import Image from "next/image";
import type { Product } from "@/lib/products";

export function Media({
  src,
  alt,
  className = "",
  sizes = "(max-width: 820px) 100vw, 480px",
  priority,
  bg,
  children,
}: {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  bg?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={`media ${className}`} style={bg ? { background: bg } : undefined}>
      <Image src={src} alt={alt} fill sizes={sizes} priority={priority} />
      {children}
    </div>
  );
}

export function ProductMedia({ product, className = "", sizes, priority, children }: { product: Product; className?: string; sizes?: string; priority?: boolean; children?: React.ReactNode }) {
  const alt = product.id === "duo" ? "MIJAB Café Noir and Vanilla Gourmand" : `MIJAB ${product.name}`;
  return <Media src={product.image} alt={alt} className={className} sizes={sizes} priority={priority} bg={product.swatch}>{children}</Media>;
}
