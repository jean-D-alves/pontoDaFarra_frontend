"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export const SEARCH_PATH = "/produtos/search";

export default function SearchInput() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const name = query.trim();
    if (!name) return;

    router.push(`${SEARCH_PATH}?name=${encodeURIComponent(name)}&page=1`);
  };

  return (
    <form onSubmit={handleSubmit} role="search" className="relative w-full">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Pesquise cervejas, vodka, refrigerante..."
        aria-label="Pesquisar produtos"
        className="w-full h-9 rounded-full bg-white border border-gray-300 pl-4 pr-10 text-sm placeholder:text-gray-400 focus:outline-none"
      />
      <button
        type="submit"
        aria-label="Buscar"
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black cursor-pointer"
      >
        <Search size={16} />
      </button>
    </form>
  );
}