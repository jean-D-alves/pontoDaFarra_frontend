// src/components/Banner.tsx
type BannerProps = {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "first" | "second";
};

const variants = {
  first: "w-full bg-brand-gradient text-ink py-10 md:py-10",
  second: "hidden w-full md:w-1/3 md:block bg-black-gradient text-brand py-8",
} as const;

export default function Banner({
  children,
  onClick,
  type = "first",
}: BannerProps) {
  const className = `px-20 py-30 ${variants[type]} flex items-center justify-center rounded-2xl `;
  const title = (
    <h2 className="font-display text-3xl tracking-wide">{children}</h2>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`${className} cursor-pointer hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink`}
      >
        {title}
      </button>
    );
  }

  return <div className={className}>{title}</div>;
}