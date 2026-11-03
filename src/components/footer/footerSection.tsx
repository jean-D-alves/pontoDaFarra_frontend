import { Suspense } from "react";
import { getWhatsAppNumber } from "@/lib/whatsapp";
import Link from "next/link";
import { FaInstagram, FaWhatsapp } from "react-icons/fa";
import FooterCategories from "./FooterCategories";

export default function FooterSection() {
  const number = getWhatsAppNumber();

  const Routes = [
    {
      name: "Categorias",
      rota: "/categorias",
    },
    {
      name: "Perfil",
      rota: "/perfil",
    },
    {
      name: "Carrinho",
      rota: "/carrinho",
    },
  ];
  const PerfilLinks = [
    {
      name: "Instagram",
      icon: <FaInstagram size={25} />,
      rota: "https://www.instagram.com/pontodafarra/",
    },
    {
      name: "WhatsApp",
      icon: <FaWhatsapp size={25} />,
      rota: `https://wa.me/${number}`,
    },
  ];

  return (
    <footer className="flex-row bottom-0 flex flex-1 w-full gap-16 bg-ink h-80 p-10">
      <div className="flex flex-col gap-2.5 justify-start">
        <h1 className={`font-display text-2xl tracking-wide text-text`}>
          PONTO DA FARRA
        </h1>
        {PerfilLinks.map((link) => (
          <Link className="text-text" href={link.rota} key={link.name}>
            {link.icon}
          </Link>
        ))}
      </div>
      <div className="border border-footer-line" />
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h1 className="text-text text-2xl">Rotas</h1>
        {Routes.map((route) => (
          <Link
            className="text-footer-muted"
            href={route.rota}
            key={route.name}
          >
            {route.name}
          </Link>
        ))}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h1 className="text-text text-2xl">Categorias</h1>

        <Suspense fallback={null}>
          <FooterCategories />
        </Suspense>
      </div>
    </footer>
  );
}
