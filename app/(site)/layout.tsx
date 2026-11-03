import FooterSection from "@/src/components/footer/footerSection";
import WhatsAppBanner from "@/src/components/footer/WhatsAppBanner";
import Header from "@/src/components/header/Header";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <main className="flex min-h-dvh flex-col">
      <Header />
      <div className="flex flex-1 flex-col">{children}</div>
      <WhatsAppBanner />
      <FooterSection />
    </main>
  );
}
