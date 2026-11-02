import Header from "@/src/components/header/Header";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <main>
      <Header />
      {children}
    </main>
  );
}
