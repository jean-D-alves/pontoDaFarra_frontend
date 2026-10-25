import { ShoppingCart } from 'lucide-react';
import Link from 'next/link';

interface CartButtonProps {
  cartCount: number;
}

export default function CartButton({ cartCount }: CartButtonProps) {
  return (
    <Link
      href="/carrinho"
      aria-label="Carrinho de compras"
      className="flex items-center gap-2 bg-black text-yellow-400 rounded-full px-4 py-2"
    >
      <ShoppingCart size={18} />
      <span className="text-sm">Carrinho ({cartCount})</span>
    </Link>
  );
}
