'use client';

import { useState } from 'react';

interface SearchInputProps {
  onSearch?: (query: string) => void;
}

export default function SearchInput({ onSearch }: SearchInputProps) {
  const [query, setQuery] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch(query);
    }
  };

  return (
    <input
      type="text"
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      onKeyDown={handleKeyDown}
      placeholder="Pesquise cervejas, vodka, refrigerante..."
      aria-label="Pesquisar produtos"
      className="w-full h-9 rounded-full bg-white border border-gray-300 px-4 text-sm placeholder:text-gray-400 focus:outline-none"
    />
  );
}
