import { Suspense } from "react";
import { getWhatsAppNumber } from "@/lib/whatsapp";
import Link from "next/link";
import { FaInstagram, FaWhatsapp } from "react-icons/fa";
import FooterCategories from "./FooterCategories";

export default function FooterSection() {
  const number = getWhatsAppNumber();

  const Routes = [
    {
      name: "Todos os produtos",
      rota: "/produtos/all",
    },
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
    <footer className="mt-auto flex w-full flex-col gap-8 bg-ink min-h-80 p-10 md:flex-row md:gap-16">
      <div className="flex flex-col gap-2.5 justify-start">
        <h1 className={`font-display text-2xl tracking-wide text-text`}>
          PONTO DA FARRA
        </h1>
        <div className="flex flex-row gap-2.5">
        {PerfilLinks.map((link) => (
          <Link className="text-text" href={link.rota} key={link.name}>
            {link.icon}
          </Link>
        ))}
        </div>

      </div>
      <div className="h-px w-full shrink-0 bg-footer-line md:h-auto md:w-px" />
      <div className="flex w-full flex-col gap-2 p-4 md:flex-1">
        <h1 className="text-text text-2xl font-display">Rotas</h1>
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
      <div className="flex w-full flex-col gap-2 p-4 md:flex-1">
        <h1 className="text-text text-2xl font-display">Categorias</h1>

        <Suspense fallback={null}>
          <FooterCategories />
        </Suspense>
      </div>
    </footer>
  );
}
