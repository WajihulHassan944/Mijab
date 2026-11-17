/** Page banner: a photo shown at its own proportions (never cropped), with the
 * copy laid over its calm side. Phones get a square photo made for them. */
export function Banner({
  desktop,
  mobile,
  children,
  className = "",
}: {
  desktop: string;
  mobile: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`lx-banner ${className}`}>
      <div className="lx-banner-in">
        <picture>
          <source media="(max-width: 820px)" srcSet={mobile} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={desktop} alt="" fetchPriority="high" />
        </picture>
        <div className="lx-banner-copy">{children}</div>
      </div>
    </section>
  );
}
