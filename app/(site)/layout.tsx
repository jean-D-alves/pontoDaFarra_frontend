import FooterSection from "@/src/components/footer/footerSection";
import Header from "@/src/components/header/Header";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <main >
      <Header />
      {children}
      <FooterSection />
    </main>
  );
}
