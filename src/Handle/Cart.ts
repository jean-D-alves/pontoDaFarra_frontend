import type { CartItem } from "@/src/types/cart";
import type { Product } from "@/src/types/Products";

export const CART_STORAGE_KEY = "pontodafarra:cart";
export const CART_UPDATED_EVENT = "pontodafarra:cart-updated";

function isCartItem(value: unknown): value is CartItem {
  if (!value || typeof value !== "object") return false;

  const item = value as Partial<CartItem>;

  return (
    Boolean(item.product) &&
    typeof item.product?.productId === "string" &&
    typeof item.quantity === "number" &&
    item.quantity > 0
  );
}

function parseCart(raw: string | null): CartItem[] {
  if (!raw) return [];

  try {
    const parsed: unknown = JSON.parse(raw);

    if (!Array.isArray(parsed)) return [];

    return parsed.filter(isCartItem);
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

  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  window.dispatchEvent(new Event(CART_UPDATED_EVENT));
}

export function addToCart(product: Product, quantity = 1): CartItem[] {
  const cart = getCart();
  const amount = Math.max(1, Math.floor(quantity));
  const existing = cart.find(
    (item) => item.product.productId === product.productId,
  );

  if (existing) {
    existing.quantity += amount;
  } else {
    cart.push({ product, quantity: amount });
  }

  saveCart(cart);
  return cart;
}

export function removeFromCart(productId: string): CartItem[] {
  const cart = getCart().filter(
    (item) => item.product.productId !== productId,
  );

  saveCart(cart);
  return cart;
}

export function updateCartItemQuantity(
  productId: string,
  quantity: number,
): CartItem[] {
  if (quantity <= 0) return removeFromCart(productId);

  const cart = getCart().map((item) =>
    item.product.productId === productId
      ? { ...item, quantity: Math.floor(quantity) }
      : item,
  );

  saveCart(cart);
  return cart;
}

export function clearCart() {
  saveCart([]);
}
