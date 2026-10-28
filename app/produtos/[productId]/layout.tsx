import Header from "@/src/components/header/Header";

export default function ProductLayout({
  children,
}: LayoutProps<"/produtos/[productId]">) {
  return (
    <>
      <Header />
      {children}
    </>
  );
}
