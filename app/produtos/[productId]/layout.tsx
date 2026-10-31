export default function ProductLayout({
  children,
}: LayoutProps<"/produtos/[productId]">) {
  return (
      <div className="min-h-full flex flex-col">
        {children}
      </div>
  );
}
