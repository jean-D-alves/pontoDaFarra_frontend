import { buildWhatsAppUrl } from "@/lib/whatsapp";

const WHATSAPP_MESSAGE = "Olá! Gostaria de conversar com vocês.";

export default function WhatsAppBanner() {
  const whatsappUrl = buildWhatsAppUrl(WHATSAPP_MESSAGE);

  if (!whatsappUrl) return null;

  return (
    <section className="w-full bg-linear-to-br from-brand to-brand-deep">
      <div className="flex flex-col items-center justify-center gap-7 px-6 py-12 text-center md:min-h-[244px] md:flex-row md:items-center md:justify-between md:gap-12 md:px-24 md:py-16 md:text-left">
        <h2 className="font-display text-5xl uppercase leading-[1.05] tracking-wide text-ink md:text-7xl md:leading-none">
          Converse pessoalmente conosco
        </h2>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-14 w-full items-center justify-center gap-3 whitespace-nowrap rounded-full bg-ink px-8 font-sans text-base font-semibold text-brand transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink md:w-auto"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5 shrink-0"
          >
            <path d="M21 11.5a8.5 8.5 0 0 1-12.6 7.4L3 20.5l1.7-5.2A8.5 8.5 0 1 1 21 11.5z" />
          </svg>
          Chamar no WhatsApp
        </a>
      </div>
    </section>
  );
}
