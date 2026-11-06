import FooterSection from "@/src/components/footer/footerSection";
import Header from "@/src/components/header/Header";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <main className="flex flex-1 flex-col">
      <Header />
      <div className="flex flex-1 flex-col">{children}</div>
      <FooterSection />
    </main>
  );
}
