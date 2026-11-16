"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
} from "react";
import {
  Banknote,
  Bike,
  CreditCard,
  Landmark,
  LoaderCircle,
  MapPin,
  MessageCircle,
  QrCode,
  Store,
  X,
  type LucideIcon,
} from "lucide-react";
import Modal from "@/src/components/Modal";
import ProductFormField from "@/src/components/Admin/ProductFormField";
import {
  FULFILLMENT_METHOD_LABELS,
  PAYMENT_METHOD_LABELS,
  formatOrderMessage,
  isOrderValid,
  saveLastOrder,
  type FulfillmentMethod,
  type PaymentMethod,
} from "@/lib/cart";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { useUser } from "@/src/Context/UserContext";
import { requestLocations } from "@/src/Handle/Location";
import { requestOrder } from "@/src/Handle/Order";
import { formatCurrency } from "@/src/Handle/Currency";
import type { OrderItem, OrderPayload } from "@/src/types/cart";
import type { Location } from "@/src/types/location";

const MAX_NOTE_LENGTH = 500;
const LOCATIONS_ERROR_MESSAGE = "Não foi possível carregar seus locais.";
const INVALID_ORDER_MESSAGE =
  "Pedido inválido. Revise os itens do carrinho e tente novamente.";
const SEND_ERROR_MESSAGE =
  "Não foi possível registrar o pedido. Tente novamente.";
const PAYMENT_REQUIRED_MESSAGE =
  "Selecione uma forma de pagamento para enviar o pedido.";

const PAYMENT_OPTIONS: ReadonlyArray<{
  value: PaymentMethod;
  label: string;
  Icon: LucideIcon;
}> = [
  { value: "pix", label: PAYMENT_METHOD_LABELS.pix, Icon: QrCode },
  { value: "credit", label: PAYMENT_METHOD_LABELS.credit, Icon: CreditCard },
  { value: "debit", label: PAYMENT_METHOD_LABELS.debit, Icon: Landmark },
  { value: "cash", label: PAYMENT_METHOD_LABELS.cash, Icon: Banknote },
];

/** Converte o valor formatado em reais para centavos (ex.: "R$ 50,00" → 5000). */
function parseCashChangeCents(value: string): number | null {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  const cents = digits ? Number(digits) : 0;

  return Number.isFinite(cents) && cents > 0 ? cents : null;
}

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black";

interface OrderWhatsAppModalProps {
  order: OrderPayload;
  itemNames: Record<string, string>;
  fulfillmentMethod: FulfillmentMethod;
  onFulfillmentMethodChange: (method: FulfillmentMethod) => void;
  onClose: () => void;
  onSent?: () => void;
}

export type { OrderItem, OrderPayload };

/**
 * Abre a aba do pedido ainda dentro do clique do usuário: se esperássemos o
 * `requestOrder`, o navegador bloquearia a nova aba por não haver mais gesto
 * do usuário. A aba fica em branco até o pedido ser registrado.
 */
function openCheckoutTab(): Window | null {
  if (typeof window === "undefined") return null;

  try {
    return window.open("", "_blank");
  } catch {
    return null;
  }
}

function goToCheckoutTab(tab: Window | null, url: string) {
  if (tab) {
    tab.opener = null;
    tab.location.href = url;
    return;
  }

  // Fallback para quando o navegador bloqueia pop-ups.
  window.location.assign(url);
}

export default function OrderWhatsAppModal({
  order,
  itemNames,
  fulfillmentMethod,
  onFulfillmentMethodChange,
  onClose,
  onSent,
}: OrderWhatsAppModalProps) {
  const titleId = useId();
  const descriptionId = useId();
  const noteId = useId();
  const cashChangeId = useId();
  const locationsErrorId = useId();

  const { user } = useUser();
  const submittingRef = useRef(false);

  const [locations, setLocations] = useState<Location[] | null>(null);
  const [locationsError, setLocationsError] = useState<string | null>(null);
  const [locationsReloadKey, setLocationsReloadKey] = useState(0);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(
    null,
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(
    null,
  );
  const [cashChangeCents, setCashChangeCents] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    requestLocations()
      .then((list) => {
        if (!active) return;

        setLocations(list);
      })
      .catch((err) => {
        if (!active) return;

        setLocations([]);
        setLocationsError(
          err instanceof Error ? err.message : LOCATIONS_ERROR_MESSAGE,
        );
      });

    return () => {
      active = false;
    };
  }, [locationsReloadKey]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submittingRef.current) return;

    setError(null);

    if (!isOrderValid(order)) {
      setError(INVALID_ORDER_MESSAGE);
      return;
    }

    if (!paymentMethod) {
      setError(PAYMENT_REQUIRED_MESSAGE);
      return;
    }

    const payment = paymentMethod;

    submittingRef.current = true;
    setIsSubmitting(true);

    const checkoutTab = openCheckoutTab();

    try {
      const createdOrder = await requestOrder({
        items: order.items.map(({ productId, quantity }) => ({
          productId,
          quantity,
        })),
      });

      if (!createdOrder) {
        checkoutTab?.close();
        setError(SEND_ERROR_MESSAGE);
        return;
      }

      const selectedLocation =
        !isPickup
          ? locations?.find(
              (location) => location.locationId === selectedLocationId,
            ) ?? null
          : null;
      const message = formatOrderMessage(
        createdOrder,
        itemNames,
        {
          name: createdOrder.customerName ?? user?.name,
          phone: createdOrder.customerPhone ?? user?.phoneNumber,
        },
        new Date(createdOrder.createdAt),
        {
          fulfillmentMethod,
          location: selectedLocation,
          note,
          paymentMethod: payment,
          cashChangeCents: payment === "cash" ? cashChangeCents : null,
        },
      );
      const url = buildWhatsAppUrl(message);

      if (!url) {
        checkoutTab?.close();
        setError(SEND_ERROR_MESSAGE);
        return;
      }

      saveLastOrder(createdOrder, itemNames);
      goToCheckoutTab(checkoutTab, url);
      onSent?.();
    } catch {
      checkoutTab?.close();
      setError(SEND_ERROR_MESSAGE);
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  }

  const isLoadingLocations = locations === null;
  const isPickup = fulfillmentMethod === "pickup";
  const effectiveLocationId = isPickup ? null : selectedLocationId;

  return (
    <Modal
      labelledBy={titleId}
      describedBy={descriptionId}
      onClose={onClose}
      closeOnOverlay={!isSubmitting}
      closeOnEscape={!isSubmitting}
      panelClassName="max-w-lg"
    >
      <div className="flex max-h-[90vh] flex-col">
        <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
          <div className="min-w-0">
            <h2 id={titleId} className="text-lg font-semibold text-black">
              Pedir pelo WhatsApp
            </h2>
            <p id={descriptionId} className="text-sm text-muted">
              Escolha como receber, o local (para entrega), a forma de pagamento
              e adicione uma mensagem para o seu pedido.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Fechar"
            className="rounded-full p-2 text-muted transition hover:bg-surface hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X aria-hidden="true" size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          aria-busy={isSubmitting}
          className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto p-5"
        >
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-1 text-sm font-semibold text-black">
              Como deseja receber
            </legend>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {([
                {
                  value: "delivery" as const,
                  label: "Delivery",
                  description: "Receba no endereço informado (taxa calculada pelo backend).",
                  Icon: Bike,
                },
                {
                  value: "pickup" as const,
                  label: "Retirada no estabelecimento",
                  description: "Busque no estabelecimento, sem taxa de entrega.",
                  Icon: Store,
                },
              ]).map(({ value, label, description, Icon }) => {
                const selected = fulfillmentMethod === value;
                return (
                  <label
                    key={value}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${
                      selected
                        ? "border-line-strong bg-surface"
                        : "border-line bg-white hover:bg-surface"
                    }`}
                  >
                    <input
                      type="radio"
                      name="order-fulfillment"
                      value={value}
                      checked={selected}
                      onChange={() => {
                        onFulfillmentMethodChange(value);
                        if (value === "pickup") {
                          setSelectedLocationId(null);
                        }
                      }}
                      className="mt-1 h-4 w-4 shrink-0 accent-black"
                    />
                    <Icon
                      aria-hidden="true"
                      size={18}
                      className={`mt-0.5 shrink-0 ${selected ? "text-black" : "text-stone"}`}
                    />
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-stone-strong">
                        {label}
                      </span>
                      <span className="block text-xs text-stone">{description}</span>
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          {!isPickup && (
          <fieldset
            aria-describedby={locationsError ? locationsErrorId : undefined}
            className="flex flex-col gap-2"
          >
            <legend className="mb-1 text-sm font-semibold text-black">
              Localização (entrega)
            </legend>

            {isLoadingLocations ? (
              <div
                role="status"
                className="flex flex-col gap-2"
                aria-label="Carregando localizações"
              >
                <div className="h-[62px] animate-pulse rounded-xl border border-line bg-surface" />
                <div className="h-[62px] animate-pulse rounded-xl border border-line bg-surface" />
              </div>
            ) : (
              <>
                {locationsError && (
                  <div
                    id={locationsErrorId}
                    role="alert"
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-unavailable-bg px-3 py-2"
                  >
                    <p className="text-sm font-medium text-unavailable-text">
                      {locationsError}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setLocations(null);
                        setLocationsReloadKey((current) => current + 1);
                      }}
                      className={`inline-flex min-h-[36px] items-center rounded-lg border border-line-warm bg-white px-3 text-sm font-semibold text-stone-strong transition hover:bg-surface ${focusRing}`}
                    >
                      Tentar novamente
                    </button>
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  {locations?.map((location) => {
                    const selected = selectedLocationId === location.locationId;

                    return (
                      <label
                        key={location.locationId}
                        className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${
                          selected
                            ? "border-line-strong bg-surface"
                            : "border-line bg-white hover:bg-surface"
                        }`}
                      >
                        <input
                          type="radio"
                          name="order-location"
                          value={location.locationId}
                          checked={selected}
                          onChange={() =>
                            setSelectedLocationId(location.locationId)
                          }
                          className="mt-1 h-4 w-4 shrink-0 accent-black"
                        />
                        <span className="min-w-0">
                          <span className="flex items-center gap-1.5 text-sm font-semibold text-stone-strong">
                            <MapPin aria-hidden="true" size={14} />
                            {location.name}
                          </span>
                          <span className="mt-0.5 block text-sm text-stone">
                            {location.street}, {location.houseNumber}
                          </span>
                          <span className="block text-xs text-stone">
                            {location.neighborhood} · {location.city} -{" "}
                            {location.state}
                          </span>
                        </span>
                      </label>
                    );
                  })}

                  <label
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${
                      selectedLocationId === null
                        ? "border-line-strong bg-surface"
                        : "border-line bg-white hover:bg-surface"
                    }`}
                  >
                    <input
                      type="radio"
                      name="order-location"
                      value=""
                      checked={selectedLocationId === null}
                      onChange={() => setSelectedLocationId(null)}
                      className="mt-1 h-4 w-4 shrink-0 accent-black"
                    />
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-stone-strong">
                        Sem localização
                      </span>
                      <span className="block text-xs text-stone">
                        A mensagem será enviada com &quot;Localização não
                        definida&quot;.
                      </span>
                    </span>
                  </label>
                </div>
              </>
            )}
          </fieldset>
          )}

          {isPickup && (
            <div className="rounded-xl border border-line bg-surface p-3 text-sm text-stone">
              Retirada no estabelecimento: não é necessário informar endereço de entrega e não há cobrança de taxa de entrega.
            </div>
          )}

          <fieldset className="flex flex-col gap-2">
            <legend className="mb-1 text-sm font-semibold text-black">
              Forma de pagamento
            </legend>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {PAYMENT_OPTIONS.map(({ value, label, Icon }) => {
                const selected = paymentMethod === value;

                return (
                  <label
                    key={value}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition ${
                      selected
                        ? "border-line-strong bg-surface"
                        : "border-line bg-white hover:bg-surface"
                    }`}
                  >
                    <input
                      type="radio"
                      name="order-payment"
                      value={value}
                      checked={selected}
                      onChange={() => {
                        setPaymentMethod(value);
                        setError(null);

                        if (value !== "cash") {
                          setCashChangeCents(null);
                        }
                      }}
                      className="h-4 w-4 shrink-0 accent-black"
                    />
                    <Icon
                      aria-hidden="true"
                      size={18}
                      className={`shrink-0 ${
                        selected ? "text-black" : "text-stone"
                      }`}
                    />
                    <span className="text-sm font-semibold text-stone-strong">
                      {label}
                    </span>
                  </label>
                );
              })}
            </div>

            {paymentMethod === "cash" && (
              <div className="mt-1">
                <ProductFormField
                  id={cashChangeId}
                  label="Precisa de troco para quanto? (opcional)"
                  value={
                    cashChangeCents === null
                      ? ""
                      : formatCurrency(cashChangeCents / 100)
                  }
                  onChange={(value) =>
                    setCashChangeCents(parseCashChangeCents(value))
                  }
                  placeholder="ex.: R$ 50,00"
                  inputMode="numeric"
                  helper="Digite apenas números; os dois últimos são os centavos."
                />
              </div>
            )}
          </fieldset>

          <ProductFormField
            id={noteId}
            label="Mensagem (opcional)"
            value={note}
            onChange={setNote}
            placeholder="ex.: Trocar o sabor, ponto de referência, instruções de entrega…"
            maxLength={MAX_NOTE_LENGTH}
            helper={`${note.length}/${MAX_NOTE_LENGTH} caracteres`}
            multiline
            rows={3}
          />

          {error && (
            <p
              role="alert"
              className="rounded-xl bg-unavailable-bg px-3 py-2 text-sm font-medium text-unavailable-text"
            >
              {error}
            </p>
          )}

          <div className="mt-auto flex flex-col-reverse gap-2 sm:flex-row">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className={`min-h-[44px] flex-1 rounded-xl border border-line bg-white px-4 text-sm font-semibold text-body transition hover:bg-surface disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
              className={`inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl bg-brand-gradient px-4 text-sm font-semibold text-ink transition hover:brightness-105 disabled:cursor-wait disabled:opacity-60 ${focusRing}`}
            >
              {isSubmitting ? (
                <LoaderCircle
                  aria-hidden="true"
                  size={18}
                  className="animate-spin"
                />
              ) : (
                <MessageCircle aria-hidden="true" size={18} />
              )}
              {isSubmitting ? "Enviando pedido…" : "Enviar no WhatsApp"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
