import type { Metadata } from "next";
import { Bebas_Neue, Poppins } from "next/font/google";
import "./globals.css";
import { UserProvider } from "@/src/Context/UserContext";

const bebasNeue = Bebas_Neue({
  variable: "--font-bebas",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL!,
  ),
  title: "Ponto da Farra | Distribuidora de bebidas",
  description: "Distribuidora de bebidas em Acari - RN",
  openGraph: {
    title: "Ponto da Farra",
    description: "Distribuidora de bebidas em Acari - RN",
    url: "/",
    siteName: "Ponto da Farra",
    locale: "pt_BR",
    type: "website",
    images: [
      {
        url: "/pontodafarra-logo.png",
        width: 1200,
        height: 630,
        alt: "Logo",
      },
    ],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${bebasNeue.variable} ${poppins.variable} h-full antialiased`}
    >
      <body className="flex min-h-screen flex-col">
        <UserProvider>{children}</UserProvider>
      </body>
    </html>
  );
}
