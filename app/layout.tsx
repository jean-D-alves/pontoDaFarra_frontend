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
  metadataBase: new URL("https://ponto-da-farra.vercel.app"),
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
        url: "/Image/PontoDaFarraIcon.jpeg",
        width: 1393,
        height: 1129,
        alt: "Ponto da Farra - Distribuidora de bebidas",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Ponto da Farra",
    description: "Distribuidora de bebidas em Acari - RN",
    images: ["/Image/PontoDaFarraIcon.jpeg"],
  },
};
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LiquorStore",
  name: "Ponto da Farra Distribuidora de Bebidas",
  description: "Distribuidora de bebidas em Acari - RN",
  url: "https://ponto-da-farra.vercel.app",
  image: "https://ponto-da-farra.vercel.app/Image/PontoDaFarraIcon.jpeg",
  telephone: "+55-84-99644-2187",
  address: {
    "@type": "PostalAddress",
    streetAddress: "R. Ana Fernandes, 413 - Ver. Tarcisio Bezerra Galvão",
    addressLocality: "Acari",
    addressRegion: "RN",
    postalCode: "59370-000",
    addressCountry: "BR",
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ],
      opens: "08:00",
      closes: "20:00",
    },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${bebasNeue.variable} ${poppins.variable} h-full antialiased`}
    >
      <body className="flex min-h-screen flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />
        <UserProvider>{children}</UserProvider>
      </body>
    </html>
  );
}
