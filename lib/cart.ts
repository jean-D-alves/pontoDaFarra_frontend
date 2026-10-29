import { formatCurrency } from "@/src/Handle/Currency";
import type { CartItem, OrderItem, OrderPayload } from "@/src/types/cart";
import type { Product } from "@/src/types/Products";

export const CART_STORAGE_KEY = "pontodafarra:cart";
export const CART_UPDATED_EVENT = "pontodafarra:cart-updated";

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toFiniteNumber(value: unknown): number | null {
  const number =
    typeof value === "number"
      ? value
      : typeof value === "string" && value.trim() !== ""
        ? Number(value)
        : Number.NaN;

  return Number.isFinite(number) ? number : null;
}

function normalizeCartItem(value: unknown): CartItem | null {
  if (!isRecord(value)) return null;

  const legacyProduct = isRecord(value.product) ? value.product : null;
  const source = legacyProduct ?? value;

  const productId =
    typeof source.productId === "string" && source.productId.length > 0
      ? source.productId
      : null;
  const name =
    typeof source.name === "string" && source.name.length > 0
      ? source.name
      : null;
  const unitPrice = toFiniteNumber(
    legacyProduct ? legacyProduct.value : value.unitPrice,
  );
  const quantity = toFiniteNumber(value.quantity);
  const imageUrl =
    typeof source.imageUrl === "string" && source.imageUrl.length > 0
      ? source.imageUrl
      : null;

  if (
    !productId ||
    !name ||
    unitPrice === null ||
    unitPrice < 0 ||
    quantity === null ||
    !Number.isInteger(quantity) ||
    quantity <= 0
  ) {
    return null;
  }

  return { productId, name, unitPrice, quantity, imageUrl };
}

export function parseCart(raw: string | null): CartItem[] {
  if (!raw) return [];

  try {
    const parsed: unknown = JSON.parse(raw);

    if (!Array.isArray(parsed)) return [];

    return parsed
      .map(normalizeCartItem)
      .filter((item): item is CartItem => item !== null);
  } catch {
    return [];
  }
}

export function getCartSnapshot(): string {
  if (typeof window === "undefined") return "";

  return window.localStorage.getItem(CART_STORAGE_KEY) ?? "";
}

export function getCartServerSnapshot(): string {
  return "";
}

export function subscribeToCart(callback: () => void) {
  if (typeof window === "undefined") return () => {};

  window.addEventListener(CART_UPDATED_EVENT, callback);
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener(CART_UPDATED_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

export function countCartItems(raw: string): number {
  return parseCart(raw).reduce((total, item) => total + item.quantity, 0);
}

export function getCart(): CartItem[] {
  return parseCart(getCartSnapshot());
}

export function getCartCount(): number {
  return getCart().reduce((total, item) => total + item.quantity, 0);
}

export function saveCart(cart: CartItem[]) {
  if (typeof window === "undefined") return;

  const normalized = cart
    .map(normalizeCartItem)
    .filter((item): item is CartItem => item !== null);

  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(normalized));
  window.dispatchEvent(new Event(CART_UPDATED_EVENT));
}

export function addToCart(product: Product, quantity = 1): CartItem[] {
  const cart = getCart();
  const amount = Math.max(1, Math.floor(quantity));
  const unitPrice = Number(product.value);
  const existing = cart.find((item) => item.productId === product.productId);

  if (existing) {
    existing.quantity += amount;
  } else {
    cart.push({
      productId: product.productId,
      name: product.name,
      unitPrice: Number.isFinite(unitPrice) && unitPrice >= 0 ? unitPrice : 0,
      quantity: amount,
      imageUrl: product.imageUrl,
    });
  }

  saveCart(cart);
  return cart;
}

export function removeFromCart(productId: string): CartItem[] {
  const cart = getCart().filter((item) => item.productId !== productId);

  saveCart(cart);
  return cart;
}

export function updateCartItemQuantity(
  productId: string,
  quantity: number,
): CartItem[] {
  if (quantity <= 0) return removeFromCart(productId);

  const cart = getCart().map((item) =>
    item.productId === productId
      ? { ...item, quantity: Math.floor(quantity) }
      : item,
  );

  saveCart(cart);
  return cart;
}

export function clearCart() {
  saveCart([]);
}

export function getCartSubtotalCents(items: CartItem[]): number {
  return items.reduce(
    (total, item) =>
      total + Math.round(item.unitPrice * 100) * item.quantity,
    0,
  );
}

export function getItemSubtotal(item: CartItem): number {
  return (Math.round(item.unitPrice * 100) * item.quantity) / 100;
}

export function buildOrderPayload(items: CartItem[]): OrderPayload {
  const totalCents = getCartSubtotalCents(items);

  return {
    totalValue: Number((totalCents / 100).toFixed(2)),
    items: items.map(({ productId, quantity, unitPrice }) => ({
      productId,
      quantity,
      unitPrice,
    })),
  };
}

export function getCartItemNames(items: CartItem[]): Record<string, string> {
  return Object.fromEntries(
    items.map((item) => [item.productId, item.name]),
  );
}

export function isOrderValid(order: OrderPayload): boolean {
  if (!order || !Array.isArray(order.items) || order.items.length === 0) {
    return false;
  }

  if (!Number.isFinite(order.totalValue) || order.totalValue < 0) {
    return false;
  }

  let totalCents = 0;

  for (const item of order.items) {
    if (!item || typeof item.productId !== "string" || !item.productId) {
      return false;
    }

    if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
      return false;
    }

    if (!Number.isFinite(item.unitPrice) || item.unitPrice < 0) {
      return false;
    }

    totalCents += Math.round(item.unitPrice * 100) * item.quantity;
  }

  return totalCents === Math.round(order.totalValue * 100);
}

export const ORDER_MESSAGE_SEPARATOR = "---------";

export type OrderCustomer = {
  name?: string | null;
  phone?: string | null;
};

function formatCustomerPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");

  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }

  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  return phone.trim();
}

function formatOrderDate(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

/**
 * Monta a mensagem do WhatsApp apenas com os caracteres de formatação que o
 * próprio WhatsApp interpreta: `*negrito*`, `_itálico_` e `~riscado~`.
 */
export function formatOrderMessage(
  order: OrderPayload,
  itemNames: Record<string, string>,
  customer?: OrderCustomer,
  date: Date = new Date(),
): string {
  const itemBlocks = order.items.map((item: OrderItem) => {
    const name = itemNames[item.productId] || "Produto";
    const subtotal =
      (Math.round(item.unitPrice * 100) * item.quantity) / 100;

    return [
      `*${item.quantity}x* ${name}`,
      `_${formatCurrency(item.unitPrice)} un._ → *${formatCurrency(subtotal)}*`,
    ].join("\n");
  });

  const totalItems = order.items.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  const customerLines = [
    customer?.name?.trim() ? `*Cliente:* ${customer.name.trim()}` : null,
    customer?.phone?.trim()
      ? `*Contato:* ${formatCustomerPhone(customer.phone)}`
      : null,
  ].filter((line): line is string => line !== null);

  const blocks: string[] = ["*PONTO DA FARRA*", "*NOVO PEDIDO*"];

  if (customerLines.length > 0) {
    blocks.push(ORDER_MESSAGE_SEPARATOR, ...customerLines);
  }

  blocks.push(
    ORDER_MESSAGE_SEPARATOR,
    "*ITENS*",
    ORDER_MESSAGE_SEPARATOR,
    "",
    itemBlocks.join("\n\n"),
    "",
    ORDER_MESSAGE_SEPARATOR,
    "*RESUMO*",
    ORDER_MESSAGE_SEPARATOR,
    `Itens: ${totalItems}`,
    `TOTAL: *${formatCurrency(order.totalValue)}*`,
    ORDER_MESSAGE_SEPARATOR,
    `_${formatOrderDate(date)} · pedido feito pelo site_`,
  );

  return blocks.join("\n");
}

export const LAST_ORDER_STORAGE_KEY = "pontodafarra:last-order";
export const LAST_ORDER_TTL_MS = 24 * 60 * 60 * 1000;

export type LastOrder = {
  order: OrderPayload;
  itemNames: Record<string, string>;
  createdAt: string;
};

function normalizeOrderPayload(value: unknown): OrderPayload | null {
  if (!isRecord(value) || !Array.isArray(value.items)) return null;

  const items: OrderItem[] = [];

  for (const raw of value.items) {
    if (!isRecord(raw)) return null;

    const productId =
      typeof raw.productId === "string" && raw.productId.length > 0
        ? raw.productId
        : null;
    const quantity = toFiniteNumber(raw.quantity);
    const unitPrice = toFiniteNumber(raw.unitPrice);

    if (
      !productId ||
      quantity === null ||
      !Number.isInteger(quantity) ||
      quantity <= 0 ||
      unitPrice === null ||
      unitPrice < 0
    ) {
      return null;
    }

    items.push({ productId, quantity, unitPrice });
  }

  const totalValue = toFiniteNumber(value.totalValue);

  if (totalValue === null || totalValue < 0) return null;

  const order: OrderPayload = { totalValue, items };

  return isOrderValid(order) ? order : null;
}

/**
 * Guarda o último pedido enviado para o WhatsApp, permitindo reenviar a
 * mensagem caso o cliente feche a conversa sem enviar.
 */
export function saveLastOrder(
  order: OrderPayload,
  itemNames: Record<string, string>,
): void {
  if (typeof window === "undefined" || !isOrderValid(order)) return;

  const snapshot: LastOrder = {
    order: {
      totalValue: order.totalValue,
      items: order.items.map(({ productId, quantity, unitPrice }) => ({
        productId,
        quantity,
        unitPrice,
      })),
    },
    itemNames: { ...itemNames },
    createdAt: new Date().toISOString(),
  };

  window.localStorage.setItem(
    LAST_ORDER_STORAGE_KEY,
    JSON.stringify(snapshot),
  );
}

export function getLastOrder(): LastOrder | null {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(LAST_ORDER_STORAGE_KEY);

  if (!raw) return null;

  try {
    const parsed: unknown = JSON.parse(raw);

    if (!isRecord(parsed)) return null;

    const order = normalizeOrderPayload(parsed.order);

    if (!order) return null;

    const createdAt =
      typeof parsed.createdAt === "string" ? parsed.createdAt : null;

    if (!createdAt) return null;

    const createdAtMs = new Date(createdAt).getTime();

    if (
      !Number.isFinite(createdAtMs) ||
      Date.now() - createdAtMs > LAST_ORDER_TTL_MS
    ) {
      clearLastOrder();
      return null;
    }

    const itemNames: Record<string, string> = {};

    if (isRecord(parsed.itemNames)) {
      for (const [productId, name] of Object.entries(parsed.itemNames)) {
        if (typeof name === "string" && name.length > 0) {
          itemNames[productId] = name;
        }
      }
    }

    return { order, itemNames, createdAt };
  } catch {
    return null;
  }
}

export function clearLastOrder(): void {
  if (typeof window === "undefined") return;

  window.localStorage.removeItem(LAST_ORDER_STORAGE_KEY);
}
